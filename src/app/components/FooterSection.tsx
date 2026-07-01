import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";
import imgHgvLogo from "../../assets/cd8f347f8929f0c65b02f008df4e6d7431d70a30.png";
import { sendBackupEmailFromFormData, sendGoogleSheetsFromFormData } from "../backupEmail";

const FOOTER_EMAIL_WEBHOOK_URL = "https://hook.us2.make.com/72v3rcegdh1cxqmupxtf4vxe3ftaf7gu";

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

export function FooterSection() {
  return (
    <footer className="bg-[#000000] text-white px-4 sm:px-6 pt-14 sm:pt-16 pb-9 sm:pb-10">
      <div className="max-w-[1394px] mx-auto">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_auto] gap-9 sm:gap-12">
          <div>
            <img
              src={imgHgvLogo}
              alt="Homegrown Visuals logo"
              className="w-[190px] sm:w-[220px] h-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p
              className="mt-4 text-[15px] sm:text-[16px] text-white/70 max-w-[560px]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.65 }}
            >
              Outstanding media produces results. Exceptional content that drives quicker sales, fuller calendars, and builds your reputation.
            </p>
            <a
              href="/services"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 h-[42px] px-5 rounded-full bg-white text-[#091321] hover:bg-white/90 transition-colors"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
            >
              Book With Us <ArrowUpRight size={15} />
            </a>
          </div>

          <div>
            <p className="text-[20px] text-white mb-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
              Quick Links
            </p>
            <ul className="space-y-2 text-white/72 text-[15px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300 }}>
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-white">Portfolio</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/#faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[20px] text-white mb-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
              Contact
            </p>
            <ul className="space-y-2 text-white/72 text-[15px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300 }}>
              <li>
                <a href="mailto:homegrownventuresllc@gmail.com" className="hover:text-white inline-flex items-center gap-2">
                  <Mail size={16} className="text-white/70" aria-hidden="true" />
                  homegrownventuresllc@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+18509720187" className="hover:text-white inline-flex items-center gap-2">
                  <Phone size={16} className="text-white/70" aria-hidden="true" />
                  (850) 972-0187
                </a>
              </li>
              <li className="inline-flex items-start gap-2">
                <MapPin size={16} className="mt-[3px] text-white/70" aria-hidden="true" />
                <span>7319 N 9th Ave, Pensacola, FL 32504</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[20px] text-white mb-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
              Connect
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.facebook.com/profile.php?id=61571518889534&sk=reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white text-[#0a1422] inline-flex items-center justify-center hover:opacity-90"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.instagram.com/_homegrownvisuals?igsh=MWNvYWZldHJvdXY1dw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white text-[#0a1422] inline-flex items-center justify-center hover:opacity-90"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://share.google/eJCNlOUVCQ4kqiHkf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white text-[#0a1422] inline-flex items-center justify-center hover:opacity-90"
                aria-label="Google Business Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 19.557H24V7.094h-8.142z"
                    strokeWidth="1"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.858 7.094H9.142a2 2 0 0 0-1.941 1.52L4.5 19.557h9.75m9.75 0a4.875 4.875 0 0 1-9.75 0m0 0a4.875 4.875 0 0 1-9.75 0m29.25 0H24V7.094h8.142zM32.142 7.094h6.716a2 2 0 0 1 1.941 1.52L43.5 19.557h-9.75m-9.75 0a4.875 4.875 0 0 0 9.75 0m0 0a4.875 4.875 0 0 0 9.75 0"
                    strokeWidth="1"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.325 23.977v14.93a2 2 0 0 0 2 2h29.35a2 2 0 0 0 2-2v-14.93"
                    strokeWidth="1"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M33.5 33.569h3.956a3.977 3.977 0 0 1-3.88 4.072l-.077.001a4.073 4.073 0 1 1 0-8.147a4 4 0 0 1 2.02.536"
                    strokeWidth="1"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 border-t border-white/12 pt-7 sm:pt-8">
          <p
            className="text-white text-[28px] sm:text-[38px] leading-[1.1] max-w-[760px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
          >
            Join Our Email List
          </p>
          <form
            action="https://formsubmit.co/homegrownventuresllc@gmail.com"
            method="POST"
            onSubmit={(event) => {
              sendBackupEmailFromFormData(new FormData(event.currentTarget), {
                source: "footer_email_subscribe_form",
                subject: "Backup Copy - Footer Email Subscriber",
              });
              sendGoogleSheetsFromFormData(new FormData(event.currentTarget), "footer_email_subscribe_form");
              sendWebhookCopy(
                event.currentTarget,
                FOOTER_EMAIL_WEBHOOK_URL,
                "footer_email_subscribe_form",
              );
            }}
            className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <input type="hidden" name="_subject" value="New Homegrown Visuals Footer Subscriber" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="h-12 sm:h-[52px] w-full sm:max-w-[440px] rounded-full bg-transparent border border-white/35 px-5 text-white placeholder:text-white/55 focus:outline-none focus:border-white/70"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300 }}
            />
            <button
              type="submit"
              className="h-12 sm:h-[52px] px-7 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
            >
              Subscribe
            </button>
          </form>
        </div>

        <div
          className="mt-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-white/55 text-[13px] sm:text-[14px]"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 300 }}
        >
          <p>Copyright © {new Date().getFullYear()} Homegrown Visuals</p>
          <div className="flex items-center gap-3.5">
            <Link to="/privacy-policy" className="hover:text-white/80">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white/80">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
