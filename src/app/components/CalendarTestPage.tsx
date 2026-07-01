import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SiteNavbar } from "./SiteNavbar";
import { FooterSection } from "./FooterSection";

type TeamCalendar = {
  key: "dean" | "brayden";
  name: string;
  role: string;
  description: string;
  bookingUrl: string;
  iframeId: string;
};

const calendars: TeamCalendar[] = [
  {
    key: "dean",
    name: "Dean",
    role: "Lead Scheduler",
    description: "Use Dean's calendar to test the live LeadConnector booking widget and verify the embedded scheduling experience.",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/V6J170tMMqltADDAZYbZ",
    iframeId: "V6J170tMMqltADDAZYbZ_1776800907630",
  },
  {
    key: "brayden",
    name: "Brayden",
    role: "Alternate Scheduler",
    description: "Use Brayden's calendar to compare the second booking flow and test alternate assignment routing.",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/qcdmDWbYLif4WbRhcGet",
    iframeId: "qcdmDWbYLif4WbRhcGet_1776800982818",
  },
];

declare global {
  interface Window {
    __hgvLeadConnectorScriptLoaded?: boolean;
  }
}

function LeadConnectorCalendarEmbed({ calendar }: { calendar: TeamCalendar }) {
  useEffect(() => {
    if (typeof document === "undefined" || window.__hgvLeadConnectorScriptLoaded) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-hgv-leadconnector="true"]');
    if (existing) {
      window.__hgvLeadConnectorScriptLoaded = true;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    script.dataset.hgvLeadconnector = "true";
    script.onload = () => {
      window.__hgvLeadConnectorScriptLoaded = true;
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="rounded-[28px] border border-[#dbe3ef] bg-white shadow-[0_20px_50px_rgba(31,58,95,0.08)] overflow-hidden">
      <div className="border-b border-[#e7edf5] px-6 py-5 sm:px-8">
        <p className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}>
          {calendar.role}
        </p>
        <h1
          className="mt-2 text-[#1F3A5F] text-[30px] sm:text-[40px]"
          style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}
        >
          {calendar.name} Calendar
        </h1>
        <p
          className="mt-3 max-w-[760px] text-[#1F3A5F]/72 text-[15px] sm:text-[17px]"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.65 }}
        >
          {calendar.description}
        </p>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-6 bg-[#f6f9fc]">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <a
            href={calendar.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#1F3A5F] px-5 py-3 text-white text-[13px] sm:text-[14px] transition-colors hover:bg-[#17304e]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
          >
            Open {calendar.name}'s Scheduling Link
            <ExternalLink size={16} />
          </a>
          <span
            className="rounded-full border border-[#d7dfeb] bg-white px-4 py-2 text-[#4d5b73] text-[12px] sm:text-[13px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
          >
            Local test only
          </span>
        </div>

        <div className="rounded-[22px] overflow-hidden border border-[#dbe3ef] bg-white">
          <iframe
            src={calendar.bookingUrl}
            title={`${calendar.name} booking calendar`}
            style={{ width: "100%", border: "none", overflow: "hidden", minHeight: "920px" }}
            scrolling="no"
            id={calendar.iframeId}
          />
        </div>
      </div>
    </div>
  );
}

export function CalendarTestPage() {
  const [activeCalendar, setActiveCalendar] = useState<TeamCalendar["key"]>("dean");
  const currentCalendar = calendars.find((calendar) => calendar.key === activeCalendar) ?? calendars[0];

  return (
    <div className="min-h-screen bg-white">
      <SiteNavbar variant="cool" flat navBgClass="bg-white" />

      <main className="px-4 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="text-center mb-8 sm:mb-10">
            <p
              className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase mb-3"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
            >
              Scheduler Prototype
            </p>
            <h2
              className="text-[#1F3A5F] text-[32px] sm:text-[42px]"
              style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}
            >
              Dean & Brayden Calendar Testing
            </h2>
            <p
              className="text-[#1F3A5F]/72 text-[16px] sm:text-[18px] max-w-[840px] mx-auto mt-4"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.65 }}
            >
              This local-only page is set up to test the client-requested scheduling embeds before we decide how they should replace or merge with the current booking flow.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {calendars.map((calendar) => {
              const isActive = calendar.key === activeCalendar;
              return (
                <button
                  key={calendar.key}
                  type="button"
                  onClick={() => setActiveCalendar(calendar.key)}
                  className={`rounded-full px-5 py-3 text-[14px] transition-colors ${
                    isActive ? "bg-[#1F3A5F] text-white" : "border border-[#d8e0eb] bg-white text-[#1F3A5F] hover:bg-[#f5f8fb]"
                  }`}
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                >
                  {calendar.name}
                </button>
              );
            })}
          </div>

          <LeadConnectorCalendarEmbed calendar={currentCalendar} />
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
