import { Play } from "lucide-react";

const FOUNDER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200";

export function AboutStorySection() {
  return (
    <section id="about-story" className="bg-white px-4 sm:px-8 py-16 sm:py-20">
      <div className="max-w-[1394px] mx-auto">
        <div className="bg-white relative rounded-[22px] p-4 sm:p-8 lg:p-10">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 sm:gap-10 lg:gap-12 items-stretch lg:min-h-[700px]">
            <div className="relative min-h-[380px] sm:min-h-[470px] lg:min-h-[700px] h-full">
              <div className="absolute left-0 top-[48px] w-[84%] h-[58%] rounded-[15px] bg-[#d9e8ff]" />
              <div className="absolute left-7 sm:left-10 top-0 w-[86%] max-w-[620px] rounded-[28px] overflow-hidden border border-[#d9e1ed] shadow-[0_18px_34px_rgba(24,44,76,0.14)]">
                <img src={FOUNDER_PLACEHOLDER} alt="Founder placeholder portrait" className="w-full h-full min-h-[360px] sm:min-h-[430px] object-cover" />
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 rounded-full bg-white/92 text-[#1f2e4a] text-[11px] px-3 py-1.5 tracking-[0.14em] uppercase" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                  Founder
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e35]/22 via-transparent to-transparent" />
                <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/85 backdrop-blur-[2px] border border-white/50 flex items-center justify-center">
                  <Play className="text-[#2f63d7] ml-1" size={38} />
                </button>
              </div>

              <div className="absolute right-0 bottom-0 w-[78%] max-w-[360px] rounded-[24px] bg-white border border-[#d9e1ed] shadow-[0_14px_24px_rgba(22,42,71,0.14)] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex -space-x-3">
                    {["#a8b9d9", "#8ea6d4", "#6f8fce"].map((color, i) => (
                      <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] border-white" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#2f63d7] text-white flex items-center justify-center text-[15px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}>
                    2k+
                  </div>
                </div>
                <p className="mt-3 text-[#2f63d7] text-[14px] sm:text-[16px] tracking-[0.18em] uppercase" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}>
                  Media Delivered
                </p>
              </div>
            </div>

            <div className="rounded-[14px] p-5 sm:p-7 lg:p-8 h-full flex flex-col">
              <p
                className="text-[#b79a72] text-[34px] sm:text-[40px]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Who We Are ?
              </p>
              <h3
                className="mt-3 text-[#0f0f10] text-[44px] sm:text-[50px] lg:text-[56px] leading-[0.98] max-w-[820px]"
                style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, letterSpacing: "-0.02em" }}
              >
                <span className="block whitespace-nowrap">Welcome to Homegrown</span>
                <span className="block">Visuals.</span>
              </h3>
              <p
                className="mt-7 text-[#6f7177] text-[18px] sm:text-[20px] max-w-[720px]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.45 }}
              >
                Homegrown Visuals is a full-service real estate media and marketing team serving the Gulf Coast from Orange Beach, AL to Navarre, FL. We help realtors, brokerages, and homebuilders stand out with listing photos, drone work, 3D walkthroughs, property videos, and social media marketing strategies.
              </p>
              <p
                className="mt-8 text-[#6f7177] text-[18px] sm:text-[20px] max-w-[720px]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.45 }}
              >
                The difference? We do not just deliver beautiful media, we deliver outcomes. Engaging content that generates leads for your listings and builds followers for your brand.
              </p>

              <div className="mt-6 lg:mt-auto rounded-[28px] border border-[#ececec] bg-white p-5 sm:p-6 relative overflow-hidden w-full max-w-[920px]">
                <div className="absolute left-0 top-0 bottom-0 w-[9px] bg-[#244573]" />
                <p
                  className="text-[#8d96a8] text-[15px] sm:text-[17px] italic pl-6"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}
                >
                  “Top notch service. Homegrown Visuals takes the time to fully understand the vision and process for each project, allowing for a tailored experience. I have done several projects with them, and each time they deliver above and beyond. I will continue going back to them for my projects. Couldn’t recommend them more!”
                </p>
                <p
                  className="text-[#1f2430] text-[17px] sm:text-[19px] mt-3 pl-6"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                >
                  • Truman A.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
