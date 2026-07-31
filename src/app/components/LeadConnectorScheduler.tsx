import { useEffect } from "react";
import { ExternalLink } from "lucide-react";

export type SchedulerOption = {
  key: string;
  name: string;
  role: string;
  bookingUrl: string;
  iframeId: string;
};

declare global {
  interface Window {
    __hgvLeadConnectorScriptLoaded?: boolean;
  }
}

type LeadConnectorSchedulerProps = {
  label: string;
  description: string;
  options: SchedulerOption[];
  selectedKey: string;
  onSelect: (option: SchedulerOption) => void;
  assignmentMode?: "manual" | "auto";
  durationLabel?: string;
  helperNote?: string;
  prefillContact?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
};

export function LeadConnectorScheduler({
  label,
  description,
  options,
  selectedKey,
  onSelect,
  assignmentMode = "manual",
  durationLabel,
  helperNote,
  prefillContact,
}: LeadConnectorSchedulerProps) {
  if (!options.length) {
    return (
      <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4 sm:p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
        <p className="text-[12px] uppercase tracking-[0.18em] text-[#2FA4A9]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}>
          {label}
        </p>
        <p className="mt-2 text-[15px] sm:text-[16px] text-[#51607b]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.65 }}>
          {description}
        </p>
        <p className="mt-4 text-[13px] text-[#b45309]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
          No matching calendar bucket is available for this order yet.
        </p>
      </div>
    );
  }

  const selectedOption = options.find((option) => option.key === selectedKey) ?? options[0];
  const servicesDraft = (() => {
    if (typeof window === "undefined") return null;
    const rawDraft = localStorage.getItem("hgv_services_booking_draft_v1");
    if (!rawDraft) return null;
    try {
      return JSON.parse(rawDraft) as Record<string, any>;
    } catch {
      return null;
    }
  })();

  const draftContact =
    prefillContact ??
    servicesDraft?.realEstateContact ??
    servicesDraft?.realEstateOversizeContact ??
    servicesDraft?.landContact ??
    servicesDraft?.socialContact ??
    null;

  const fullName =
    typeof window === "undefined"
      ? ""
      : (prefillContact?.fullName ?? localStorage.getItem("hgv_lead_name") ?? draftContact?.fullName ?? "").trim();
  const firstName = fullName.split(" ")[0] ?? "";
  const lastName = fullName.split(" ").slice(1).join(" ");
  const email =
    typeof window === "undefined"
      ? ""
      : (prefillContact?.email ?? localStorage.getItem("hgv_lead_email") ?? draftContact?.email ?? "").trim();
  const phone =
    typeof window === "undefined"
      ? ""
      : (prefillContact?.phone ?? localStorage.getItem("hgv_lead_phone") ?? draftContact?.phone ?? "").trim();

  const baseCalendarUrl = selectedOption.bookingUrl;
  const params = new URLSearchParams();
  if (firstName) params.append("first_name", firstName);
  if (lastName) params.append("last_name", lastName);
  if (email) params.append("email", email);
  if (phone) params.append("phone", phone);
  const queryString = params.toString();
  const calendarUrl = queryString ? `${baseCalendarUrl}?${queryString}` : baseCalendarUrl;

  useEffect(() => {
    if (typeof document === "undefined") return;

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
    <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4 sm:p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <p className="text-[12px] uppercase tracking-[0.18em] text-[#2FA4A9]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}>
        {label}
      </p>
      <p className="mt-2 text-[15px] sm:text-[16px] text-[#51607b]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.65 }}>
        {description}
      </p>

      {assignmentMode === "manual" && (
        <div className="mt-4 flex flex-wrap gap-3">
          {options.map((option) => {
            const active = option.key === selectedOption.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onSelect(option)}
                className={`rounded-full px-4 py-2.5 text-[13px] transition-colors ${
                  active ? "bg-[#1F3A5F] text-white" : "border border-[#dbe3ef] bg-white text-[#1F3A5F] hover:bg-[#f5f8fb]"
                }`}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={calendarUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#dbe3ef] bg-white px-4 py-2 text-[12px] text-[#1F3A5F] hover:bg-[#f5f8fb]"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
        >
          Open scheduling link
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="mt-5 rounded-[18px] overflow-hidden border border-[#dbe3ef] bg-[#f8fafc]">
        <iframe
          key={selectedOption.key}
          src={calendarUrl}
          style={{ width: "100%", border: "none" }}
          className="w-full h-[1400px] sm:h-[860px]"
          scrolling="yes"
          id={selectedOption.iframeId}
          title={`${selectedOption.name} scheduling calendar`}
          allow="camera; microphone; autoplay; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <p className="mt-4 text-[12px] text-[#6b7280]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.55 }}>
        If the embedded calendar does not load in your browser, use the scheduling link above to open it directly.
      </p>
    </div>
  );
}
