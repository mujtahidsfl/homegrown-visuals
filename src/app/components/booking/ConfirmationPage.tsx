import { Link, useLocation } from "react-router";

export function ConfirmationPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isCalendarConfirmed =
    searchParams.get("source") === "ghl" ||
    searchParams.get("status") === "confirmed" ||
    searchParams.get("booking") === "confirmed";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,#f6fdff_0%,#eaf6ff_20%,#d9edf8_42%,#f6f9fc_70%,#ffffff_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-[8%] h-64 w-64 rounded-full bg-[#7CC5F6]/25 blur-3xl" />
        <div className="absolute top-[14%] right-[10%] h-72 w-72 rounded-full bg-[#2FA4A9]/18 blur-3xl" />
        <div className="absolute bottom-[6%] left-[16%] h-80 w-80 rounded-full bg-[#1F3A5F]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1180px] items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(247,252,255,0.96)_100%)] px-6 py-12 text-center shadow-[0_30px_90px_rgba(31,58,95,0.18)] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 18 }).map((_, index) => {
              const left = `${5 + index * 5.2}%`;
              const delay = `${(index % 6) * 0.22}s`;
              const duration = `${3.6 + (index % 5) * 0.35}s`;
              const color = ["#2FA4A9", "#7CC5F6", "#1F3A5F", "#B9E6FF"][index % 4];
              return (
                <span
                  key={index}
                  className="absolute top-[-12%] h-3 w-3 rounded-sm opacity-80"
                  style={{
                    left,
                    backgroundColor: color,
                    animation: `hgv-confetti-fall ${duration} linear ${delay} infinite`,
                    transform: `rotate(${index * 21}deg)`,
                  }}
                />
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(47,164,169,0.45),transparent)]" />
          <div className="pointer-events-none absolute left-10 top-10 hidden h-24 w-24 rounded-full border border-[#2FA4A9]/20 lg:block" />
          <div className="pointer-events-none absolute bottom-12 right-12 hidden h-28 w-28 rounded-full border border-[#1F3A5F]/12 lg:block" />
          <div className="pointer-events-none absolute left-[12%] top-[22%] hidden text-[#1F3A5F]/8 lg:block" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontSize: "140px", fontWeight: 700 }}>
            booked
          </div>

          <div className="relative mx-auto flex h-[138px] w-[138px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f8fdff_0%,#dff5fb_48%,#c6e8f4_100%)] shadow-[0_24px_55px_rgba(47,164,169,0.24)]">
            <div className="absolute inset-2 rounded-full border border-white/75" />
            <svg width="84" height="84" viewBox="0 0 78 78" fill="none" aria-hidden="true">
              <circle cx="39" cy="39" r="34" fill="#1F3A5F" />
              <path d="M24 39.5L34.5 50L54 28.5" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p
            className="mt-8 text-[#2FA4A9] text-[12px] sm:text-[13px] tracking-[0.22em] uppercase"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
          >
            Congratulations
          </p>
          <h1
            className="text-[#1F3A5F] text-[40px] sm:text-[58px] lg:text-[72px] mt-4"
            style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.02 }}
          >
            Booking submitted
          </h1>
          <p
            className="text-[#43516a] text-[17px] sm:text-[20px] mt-5 max-w-[720px] mx-auto"
            style={{ fontFamily: "'Satoshi', sans-serif", lineHeight: 1.65 }}
          >
            Our team will reach out shortly to confirm your time.
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-[760px] flex-col gap-3 sm:flex-row sm:justify-center">
            <div className="rounded-full border border-[#d7e7f1] bg-white/85 px-5 py-3 text-[#1F3A5F] shadow-[0_12px_28px_rgba(31,58,95,0.08)]">
              <span style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>We&apos;ve got your details.</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/services" className="h-12 px-7 rounded-full bg-[#1F3A5F] text-white flex items-center justify-center shadow-[0_18px_34px_rgba(31,58,95,0.18)]">
              Book Another Property →
            </Link>
            <Link to="/" className="h-12 px-7 rounded-full border border-[#c9d4e3] bg-white/80 text-[#1F3A5F] flex items-center justify-center">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes hgv-confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          12% { opacity: 0.95; }
          100% { transform: translateY(760px) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
