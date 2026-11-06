import { createClient } from "@supabase/supabase-js";

/**
 * Check a Supabase access token and return the customer's verified email.
 * - `{ email }`: valid token with a confirmed email.
 * - `null`: Supabase rejected the token, or the email isn't confirmed.
 * - `{ error: "unavailable" }`: the check couldn't run (missing config, network
 *   failure, Supabase 5xx). The token may be fine, so callers shouldn't treat
 *   this as "signed out".
 */
export async function verifySupabaseToken(token, env = process.env, createClientImpl = createClient) {
  if (!token) return null;
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return { error: "unavailable" };
  try {
    const client = createClientImpl(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error) {
      const status = Number(error.status) || 0;
      return status >= 400 && status < 500 ? null : { error: "unavailable" };
    }
    const user = data?.user;
    if (!user?.email || !user.email_confirmed_at) return null;
    return { email: user.email.trim().toLowerCase() };
  } catch {
    return { error: "unavailable" };
  }
}
