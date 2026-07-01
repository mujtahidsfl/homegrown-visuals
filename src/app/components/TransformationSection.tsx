import { useState } from "react";
import { Check } from "lucide-react";
import { PACKAGE_DISPLAY, type PackageKey } from "../booking/config";
import { sendBackupEmailFromFormData, sendGoogleSheetsFromFormData } from "../backupEmail";
import { BookingIntentModal } from "./booking/BookingIntentModal";

const SOCIAL_MEDIA_WEBHOOK_URL = "https://hook.us2.make.com/im0m5469kvkslku9bfqqudvymgs1nq6x";

const cards = [
  PACKAGE_DISPLAY.standard,
  PACKAGE_DISPLAY.zillow_showcase,
  PACKAGE_DISPLAY.luxury,
] as const;

function sendWebhookCopy(form: HTMLFormElement, webhookUrl: string, source: string) {
  const payload = new URLSearchParams();
  const formData = new FormData(form);

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      payload.append(key, value);
    }
  });
  payload.append("source", source);
  payload.append("submitted_at", new Date().toISOString());

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload.toString()], {
      type: "application/x-www-form-urlencoded;charset=UTF-8",
    });
    navigator.sendBeacon(webhookUrl, blob);
    return;
  }

  fetch(webhookUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: payload.toString(),
    keepalive: true,
  }).catch(() => {
    // noop: preserve primary form submission flow
  });
}

export function TransformationSection() {
  const [activePackage, setActivePackage] = useState<PackageKey | null>(null);

  return (
    <section
      id="pricing"
      className="px-2 sm:px-4 py-18 sm:py-24 bg-[#eaf5ff]"
    >
      <div
        className="max-w-[1620px] mx-auto rounded-[24px] px-4 sm:px-8 py-12 sm:py-14 border border-white/80"
        style={{
          backgroundColor: "#eaf5ff",
          backgroundImage: "radial-gradient(#c4dced 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <div className="text-center mb-10 sm:mb-12">
          <p
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#1F3A5F]/10 text-[#1F3A5F] text-[12px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
          >
            Services
          </p>
          <h2
            className="text-[#1F2D5A] text-[34px] sm:text-[50px] mt-5"
            style={{
              fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            OUTSTANDING MEDIA PRODUCES RESULTS.
          </h2>
          <p
            className="text-[#46506b] text-[16px] sm:text-[18px] max-w-[760px] mx-auto mt-4"
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 400,
              lineHeight: 1.65,
            }}
          >
            STRATEGIC CONTENT THAT CLOSES DEALS FASTER, KEEPS YOUR CALENDAR PACKED, AND MAKES YOUR NAME IMPOSSIBLE TO IGNORE.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {cards.map((pkg) => (
            <article
              key={pkg.key}
              className="rounded-[24px] border p-6 sm:p-7 flex flex-col min-h-0 lg:min-h-[540px] bg-white border-[#e4e6ef] shadow-[0_4px_16px_rgba(31,58,95,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <p
                  className="text-[28px] sm:text-[32px] text-[#3a4257]"
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {pkg.name}
                </p>
                {pkg.key === "zillow_showcase" && (
                  <span
                    className="px-4 py-1.5 rounded-full bg-[#1F2D5A] text-white text-[13px] whitespace-nowrap"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                  >
                    Most Popular
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end gap-2">
                <p
                  className="text-[32px] sm:text-[36px] text-[#1F2D5A]"
                  style={{
                    fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {pkg.range}
                </p>
                <p
                  className="text-[15px] sm:text-[16px] mb-1.5 text-[#4a5269]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                >
                  /property size
                </p>
              </div>

              <p
                className="mt-4 text-[15px] sm:text-[16px] text-[#525b71]"
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontWeight: 400,
                  lineHeight: 1.55,
                }}
              >
                {pkg.subtitle}
              </p>

              <button
                type="button"
                onClick={() => setActivePackage(pkg.key)}
                className={`mt-6 h-12 rounded-full border flex items-center justify-center text-[14px] transition-colors ${
                  pkg.key === "zillow_showcase"
                    ? "bg-[#1F2D5A] text-white border-[#1F2D5A] hover:bg-[#162249]"
                    : "bg-white text-[#424b62] border-[#e4e6ef] hover:bg-[#f7f8fc]"
                }`}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Book this package
              </button>

              <div className="mt-7 pt-6 border-t border-[#e4e6ef]">
                <p
                  className="text-[16px] text-[#3f4760]"
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Package includes
                </p>
                <div className="mt-4 space-y-3">
                  {pkg.includes.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <Check size={16} className="text-[#2f3f66] mt-1" />
                      <span
                        className="text-[14px] text-[#4b556c]"
                        style={{
                          fontFamily: "'Satoshi', sans-serif",
                          fontWeight: 500,
                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mt-5 sm:mt-6">
          <article className="rounded-[24px] border p-6 sm:p-7 flex flex-col min-h-0 lg:min-h-[540px] bg-white border-[#e4e6ef] shadow-[0_4px_16px_rgba(31,58,95,0.06)]">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full bg-[#eef3fb] border border-[#d7e0eb] text-[#1F2D5A] text-[12px] w-fit"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
            >
              Personal Branding
            </span>
            <h3
              className="text-[#1F2D5A] text-[28px] sm:text-[32px] mt-4"
              style={{
                fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Agent On-Camera Luxury Reel
            </h3>
            <p
              className="mt-5 text-[#1F2D5A] text-[32px] sm:text-[36px]"
              style={{
                fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              Starting at $749
            </p>
            <div className="mt-5 space-y-2.5">
              <p className="text-[#4b556c] text-[16px] sm:text-[18px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                Stand out from every other agent.
              </p>
              <p className="text-[#4b556c] text-[16px] sm:text-[18px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                - we create the script
              </p>
              <p className="text-[#4b556c] text-[16px] sm:text-[18px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                - on-set professional coaching
              </p>
              <p className="text-[#4b556c] text-[16px] sm:text-[18px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
                - full editing and production
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePackage("luxury")}
              className="mt-auto h-12 px-8 rounded-full border border-[#1F2D5A] bg-[#1F2D5A] text-white text-[14px] hover:bg-[#17254d] transition-colors"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
            >
              Book this package
            </button>
          </article>
          <article className="rounded-[24px] border p-6 sm:p-7 flex flex-col min-h-0 lg:min-h-[540px] bg-white border-[#e4e6ef] shadow-[0_4px_16px_rgba(31,58,95,0.06)]">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full bg-[#eef3fb] border border-[#d7e0eb] text-[#1F2D5A] text-[12px] w-fit"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
            >
              Personal Branding
            </span>
            <h3
              className="text-[#1F2D5A] text-[28px] sm:text-[32px] mt-4"
              style={{
                fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Social Media Marketing Services
            </h3>
            <p
              className="mt-4 text-[#4b556c] text-[15px] sm:text-[16px]"
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 400,
                lineHeight: 1.65,
              }}
            >
              We have you covered from social media ads that stop the scroll to full social media management and ad placement management. We have helped both local businesses and multi-state brands grow strong social audiences. If you're ready to grow your business's social media presence, fill out the form below and we will reach out shortly.
            </p>

            <form
              action="https://formsubmit.co/homegrownventuresllc@gmail.com"
              method="POST"
              onSubmit={(event) => {
                sendBackupEmailFromFormData(new FormData(event.currentTarget), {
                  source: "services_social_media_marketing_form",
                  subject: "Backup Copy - Social Media Marketing Services Inquiry",
                });
                sendGoogleSheetsFromFormData(new FormData(event.currentTarget), "services_social_media_marketing_form");
                sendWebhookCopy(
                  event.currentTarget,
                  SOCIAL_MEDIA_WEBHOOK_URL,
                  "services_social_media_marketing_form",
                );
              }}
              className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
            >
              <input type="hidden" name="_subject" value="New Social Media Marketing Services Inquiry" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input
                name="name"
                required
                placeholder="Name"
                className="h-11 px-4 rounded-[12px] border border-[#d7e0eb] outline-none focus:border-[#2FA4A9] text-[#1F2D5A]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <input
                name="business_name"
                required
                placeholder="Business Name"
                className="h-11 px-4 rounded-[12px] border border-[#d7e0eb] outline-none focus:border-[#2FA4A9] text-[#1F2D5A]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="h-11 px-4 rounded-[12px] border border-[#d7e0eb] outline-none focus:border-[#2FA4A9] text-[#1F2D5A]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <input
                type="tel"
                name="phone_number"
                required
                placeholder="Phone Number"
                className="h-11 px-4 rounded-[12px] border border-[#d7e0eb] outline-none focus:border-[#2FA4A9] text-[#1F2D5A]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <textarea
                name="reason_for_submitting"
                required
                placeholder="Reason for submitting"
                rows={4}
                className="sm:col-span-2 px-4 py-3 rounded-[12px] border border-[#d7e0eb] outline-none focus:border-[#2FA4A9] text-[#1F2D5A] resize-y"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <div className="sm:col-span-2 mt-1">
                <button
                  type="submit"
                  className="h-11 px-8 rounded-full border border-[#1F2D5A] bg-[#1F2D5A] text-white text-[14px] hover:bg-[#17254d] transition-colors"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                >
                  Contact us
                </button>
              </div>
            </form>
          </article>
        </div>
      </div>

      <BookingIntentModal
        packageKey={activePackage}
        onClose={() => setActivePackage(null)}
      />
    </section>
  );
}
