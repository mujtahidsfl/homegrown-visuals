import { CalendarCheck, Camera, FolderDown } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    step: "01",
    title: "Book Your Shoot",
    description:
      "Pick a date, choose your services, and we handle the rest. Our online booking takes under 2 minutes — no phone calls needed.",
  },
  {
    icon: Camera,
    step: "02",
    title: "We Show Up & Shoot",
    description:
      "Our team arrives on time, fully equipped. We capture everything — photos, video, drone, 3D — in a single visit so you're never waiting around.",
  },
  {
    icon: FolderDown,
    step: "03",
    title: "Get Your Media Fast",
    description:
      "Edited and polished photos delivered to your inbox next day. Plus, our professional video content gets delivered within days, not weeks. Your listings are time-sensitive, and we understand the importance of marketing while buyer interest is hot.",
  },
];

export function OurProcessSection() {
  return (
    <section id="process" className="bg-gradient-to-b from-[#E8F4F8] to-[#F6EDE4] rounded-[20px] mx-3 sm:mx-4 py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[1394px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <p
            className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase mb-3"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
          >
            How It Works
          </p>
          <h2
            className="text-[#1F3A5F] text-[32px] sm:text-[42px] md:text-[55px] mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
          >
            From Booking to Delivery in 3 Simple Steps.
          </h2>
          <p
            className="text-[#3D5A80] text-[16px] sm:text-[20px] md:text-[24px] max-w-[837px] mx-auto"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
          >
            We built our process around one thing — respecting your time. No back-and-forth headaches, no confusing invoices, no wondering where your photos are. Here's how it works.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {steps.map((step) => (
            <div
              key={step.step}
              className="bg-white/70 backdrop-blur-sm border border-white rounded-[30px] p-8 sm:p-10 flex flex-col min-h-[400px] sm:min-h-[499px]"
            >
              {/* Step number */}
              <span
                className="text-[#2FA4A9] text-[16px] sm:text-[18px] mb-4"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              >
                Step {step.step}
              </span>

              {/* Icon */}
              <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl bg-[#2FA4A9]/10 flex items-center justify-center mb-6">
                <step.icon size={32} className="text-[#2FA4A9]" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3
                className="text-[#1F3A5F] text-[22px] sm:text-[26px] mb-4 mt-auto"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className="text-[#3D5A80] text-[15px] sm:text-[17px] mt-3"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
