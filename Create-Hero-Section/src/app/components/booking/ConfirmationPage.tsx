import { CheckCircle2, Camera, Mail, ReceiptText } from "lucide-react";
import { Link } from "react-router";

type Summary = {
  package_name?: string;
  address?: string;
  shoot_date?: string;
  shoot_time?: string;
  estimated_total?: number;
};

export function ConfirmationPage() {
  const email = localStorage.getItem("hgv_lead_email") ?? "";
  const summary: Summary = JSON.parse(localStorage.getItem("hgv_booking_summary") ?? "{}");

  const timeline = [
    { icon: Mail, label: "Confirmation email sent to you" },
    { icon: Camera, label: "Photographer assigned to your shoot" },
    { icon: ReceiptText, label: "Invoice sent 24hrs before your shoot" },
  ];

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,#eaf6ff_0%,#f4f8fc_50%,#fbfaf6_100%)] px-4 py-16">
      <div className="max-w-[920px] mx-auto">
        <div className="bg-white border border-[#dbe3ef] rounded-[20px] p-8 sm:p-10 shadow-[0_18px_40px_rgba(31,58,95,0.12)] text-center">
          <CheckCircle2 size={58} className="mx-auto text-[#2FA4A9]" />
          <h1 className="text-[#1F3A5F] text-[42px] mt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
            You're all booked!
          </h1>
          <p className="text-[#43516a] text-[17px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", lineHeight: 1.65 }}>
            We've received your booking request and will confirm your shoot details within 2 hours.
            {email ? <> Check your inbox at <span className="font-semibold">{email}</span>.</> : null}
          </p>

          {summary.package_name && (
            <div className="mt-8 text-left border border-[#dbe3ef] rounded-[14px] p-5">
              <p className="text-[#1F3A5F] text-[17px] mb-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                Booking Summary
              </p>
              <div className="space-y-2 text-[15px] text-[#465570]">
                <p><b>Package:</b> {summary.package_name}</p>
                <p><b>Property:</b> {summary.address}</p>
                <p><b>Shoot:</b> {summary.shoot_date} · {summary.shoot_time}</p>
                <p><b>Estimated total:</b> ${Number(summary.estimated_total ?? 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {timeline.map((item) => (
              <div key={item.label} className="border border-[#dbe3ef] rounded-[12px] p-4">
                <item.icon size={20} className="text-[#2FA4A9] mx-auto" />
                <p className="text-[#3e4f6a] text-[14px] mt-2">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/#pricing" className="h-11 px-6 rounded-full bg-[#1F3A5F] text-white flex items-center justify-center">
              Book Another Property →
            </Link>
            <Link to="/" className="h-11 px-6 rounded-full border border-[#c9d4e3] text-[#1F3A5F] flex items-center justify-center">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

