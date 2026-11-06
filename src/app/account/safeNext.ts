const FALLBACK = "/account";

/**
 * Where to send the customer after login. Only same-site paths are allowed,
 * so a crafted ?next= link can't bounce them to another website.
 */
export function safeNext(raw: string | null | undefined): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) return FALLBACK;
  // Block protocol-relative and backslash tricks, and encoded slashes/backslashes.
  if (/^\/[\\/]/.test(raw) || /%2f|%5c/i.test(raw.slice(0, 4))) return FALLBACK;
  if (/[\u0000-\u001f\\]/.test(raw)) return FALLBACK;
  const path = raw.split(/[?#]/)[0];
  if (path === "/account/login" || path.startsWith("/account/login/")) return FALLBACK;
  return raw;
}
