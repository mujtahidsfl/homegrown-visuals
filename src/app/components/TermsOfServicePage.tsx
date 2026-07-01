import { Link } from "react-router";
import { SiteNavbar } from "./SiteNavbar";

export function TermsOfServicePage() {
  return (
    <section className="min-h-screen bg-[#f6f9fc] px-4 sm:px-8 py-10 sm:py-14">
      <SiteNavbar variant="cool" />
      <div className="max-w-[980px] mx-auto bg-white border border-[#dbe3ef] rounded-[20px] p-6 sm:p-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-[#1F3A5F] text-[34px] sm:text-[42px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}>
            Terms of Service
          </h1>
          <Link to="/" className="text-[#1F3A5F] text-[14px] underline" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
            Back to Home
          </Link>
        </div>

        <div className="space-y-6 text-[#41516b] text-[15px] sm:text-[16px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.7 }}>
          <p><strong>Effective Date:</strong> April 3, 2026</p>

          <div>
            <p className="text-[#1F3A5F] mb-2" style={{ fontWeight: 700 }}>Scheduling &amp; Cancellation Policy</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Scheduling Requests:</strong> Preferred booking times submitted through our form are requests only. Our team will reach out shortly to confirm the exact shoot time.</li>
              <li><strong>Rescheduling:</strong> If weather, property access, or listing readiness affects the appointment, we will coordinate the next available time with you directly.</li>
              <li><strong>Cancellation:</strong> If you need to cancel or reschedule, please contact Homegrown Visuals as early as possible so we can update your appointment and availability.</li>
            </ul>
          </div>

          <div>
            <p className="text-[#1F3A5F] mb-2" style={{ fontWeight: 700 }}>SMS Program Terms</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Program Name:</strong> Homegrown Visuals Client Messaging Program.</li>
              <li><strong>Program Description:</strong> Users receive booking confirmations, appointment reminders, scheduling updates, media delivery notifications, and optional promotional offers.</li>
              <li><strong>Message Frequency:</strong> Message frequency may vary based on your bookings and preferences.</li>
              <li><strong>Message and Data Rates:</strong> Message and data rates may apply depending on your mobile carrier plan.</li>
              <li><strong>Program Links:</strong> Review our <Link to="/privacy-policy" className="underline">Privacy Policy</Link> and <Link to="/terms-of-service" className="underline">Terms of Service</Link> for full SMS and data-use details.</li>
              <li><strong>Opt-Out:</strong> You can cancel the SMS service at any time. Text STOP to unsubscribe. After confirmation, you will no longer receive SMS messages from us unless you opt in again.</li>
              <li><strong>Help:</strong> Text HELP for assistance or contact us directly through our website contact options.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
