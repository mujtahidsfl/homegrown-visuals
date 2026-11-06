import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { SiteNavbar } from "../components/SiteNavbar";
import { safeNext } from "./safeNext";
import { useCustomerSession } from "./useCustomerSession";

export const ACCOUNT_PRIMARY_BUTTON =
  "h-11 px-6 rounded-full bg-[#111111] text-white text-[13px] font-semibold hover:bg-black transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
export const ACCOUNT_SECONDARY_BUTTON =
  "h-11 px-5 rounded-full border border-[#d9dce3] bg-white text-[#111111] text-[13px] font-semibold hover:bg-[#f5f6f8] transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
export const ACCOUNT_INPUT =
  "w-full h-11 rounded-xl border border-[#d9dce3] bg-white px-4 text-[15px] text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#597eb1]";
export const ACCOUNT_HEADING_STYLE = { fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 } as const;
export const ACCOUNT_BODY_STYLE = { fontFamily: "'Satoshi', sans-serif" } as const;

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const { available, ready, session, sendCode, verifyCode } = useCustomerSession();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) navigate(next, { replace: true });
  }, [ready, session, next, navigate]);

  const requestCode = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await sendCode(email, next);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    setStep("code");
    setNotice(`We sent a 6-digit code to ${email.trim()}. You can also use the link in that email.`);
  };

  const submitCode = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await verifyCode(email, code);
    setBusy(false);
    if (!result.ok) setError(result.message);
    // On success the session listener redirects.
  };

  return (
    <section className="min-h-screen bg-[#f6f9fc] px-4 sm:px-8 py-10 sm:py-14">
      <SiteNavbar variant="cool" />
      <div className="max-w-[460px] mx-auto bg-white border border-[#dbe3ef] rounded-[20px] p-6 sm:p-10" style={ACCOUNT_BODY_STYLE}>
        <h1 className="text-[#1F3A5F] text-[30px] sm:text-[36px]" style={ACCOUNT_HEADING_STYLE}>Log in</h1>
        <p className="mt-2 text-[#51607b] text-[15px]">
          Use the email you book with. We'll send you a one-time code — no password needed.
        </p>

        {!available ? (
          <p className="mt-6 text-[#9a3412]">Login is unavailable right now.</p>
        ) : step === "email" ? (
          <form className="mt-6 flex flex-col gap-4" onSubmit={requestCode}>
            <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#1F3A5F]">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                className={ACCOUNT_INPUT}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {error && <p role="alert" className="text-[14px] text-[#b42318]">{error}</p>}
            <button type="submit" className={ACCOUNT_PRIMARY_BUTTON} disabled={busy || !email.trim()}>
              {busy ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={submitCode}>
            {notice && <p className="text-[14px] text-[#1F3A5F]">{notice}</p>}
            <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#1F3A5F]">
              6-digit code
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className={`${ACCOUNT_INPUT} tracking-[0.3em]`}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              />
            </label>
            {error && <p role="alert" className="text-[14px] text-[#b42318]">{error}</p>}
            <button type="submit" className={ACCOUNT_PRIMARY_BUTTON} disabled={busy || code.length !== 6}>
              {busy ? "Checking…" : "Verify"}
            </button>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={ACCOUNT_SECONDARY_BUTTON} disabled={busy} onClick={() => requestCode()}>
                Resend code
              </button>
              <button
                type="button"
                className={ACCOUNT_SECONDARY_BUTTON}
                disabled={busy}
                onClick={() => { setStep("email"); setCode(""); setError(null); setNotice(null); }}
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
