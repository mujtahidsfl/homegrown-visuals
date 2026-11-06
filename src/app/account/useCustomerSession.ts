import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export type AuthResult = { ok: true } | { ok: false; message: string };

const UNAVAILABLE = "Login is unavailable right now.";

function friendlyError(message: string): string {
  if (/rate limit|too many|seconds/i.test(message)) return "Please wait a minute before requesting another code.";
  if (/expired|invalid|token/i.test(message)) return "That code is wrong or has expired. Request a new one.";
  return "Something went wrong. Please try again.";
}

export function useCustomerSession() {
  const [ready, setReady] = useState(!supabase);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const sendCode = useCallback(async (email: string, next = "/account"): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: UNAVAILABLE };
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/account/login?next=${encodeURIComponent(next)}`,
      },
    });
    return error ? { ok: false, message: friendlyError(error.message) } : { ok: true };
  }, []);

  const verifyCode = useCallback(async (email: string, code: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: UNAVAILABLE };
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    return error ? { ok: false, message: friendlyError(error.message) } : { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  return {
    available: Boolean(supabase),
    ready,
    session,
    email: session?.user?.email ?? null,
    sendCode,
    verifyCode,
    signOut,
  };
}
