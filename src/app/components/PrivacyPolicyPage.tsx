import { Link } from "react-router";
import { SiteNavbar } from "./SiteNavbar";

export function PrivacyPolicyPage() {
  return (
    <section className="min-h-screen bg-[#f6f9fc] px-4 sm:px-8 py-10 sm:py-14">
      <SiteNavbar variant="cool" />
      <div className="max-w-[980px] mx-auto bg-white border border-[#dbe3ef] rounded-[20px] p-6 sm:p-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-[#1F3A5F] text-[34px] sm:text-[42px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}>
            Privacy Policy
          </h1>
          <Link to="/" className="text-[#1F3A5F] text-[14px] underline" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
            Back to Home
          </Link>
        </div>

        <div className="space-y-6 text-[#41516b] text-[15px] sm:text-[16px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.7 }}>
          <p><strong>Effective Date:</strong> April 3, 2026</p>
          <p>
            Homegrown Visuals collects contact and booking information to provide media services, coordinate scheduling, and deliver requested updates.
          </p>
          <p>
            <strong>SMS Privacy Notice:</strong> No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. Information sharing to subcontractors in support services, such as customer service is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
          </p>
          <p>
            We maintain reasonable safeguards to protect personal information. You may contact us to request updates or deletion of your information where applicable.
          </p>
        </div>
      </div>
    </section>
  );
}
