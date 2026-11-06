import { createClient } from "@supabase/supabase-js";

/**
 * Check a Supabase access token and return the customer's verified email.
 * Returns null when the token is invalid or expired, or the email isn't confirmed.
 */
export async function verifySupabaseToken(token, env = process.env) {
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  try {
    const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    const user = data?.user;
    if (error || !user?.email || !user.email_confirmed_at) return null;
    return { email: user.email.trim().toLowerCase() };
  } catch {
    return null;
  }
}
