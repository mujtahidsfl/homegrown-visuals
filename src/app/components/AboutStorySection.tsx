import whoWeAreAerial from "../../assets/about/who-we-are-aerial.jpg";

const WHO_WE_ARE_IMAGE = whoWeAreAerial;

export function AboutStorySection() {
  return (
    <section id="about-story" className="bg-white px-4 sm:px-8 py-12 sm:py-20">
      <div className="max-w-[1394px] mx-auto">
        <div className="bg-white relative rounded-[22px] p-4 sm:p-8 lg:p-10">
          <div className="grid md:grid-cols-[0.95fr_1.05fr] lg:grid-cols-[1fr_1fr] gap-8 sm:gap-10 lg:gap-12 items-stretch md:min-h-[560px] lg:min-h-[700px]">
            <div className="relative min-h-[0] sm:min-h-[560px] md:min-h-[520px] lg:min-h-[700px] h-full">
              <div className="hidden sm:block absolute -left-8 md:-left-5 lg:-left-10 top-1/2 h-[68%] md:h-[72%] w-[22%] md:w-[18%] -translate-y-1/2 rounded-[20px] bg-[#d8e6ff]" />
              <div className="relative h-full w-full rounded-[22px] sm:rounded-[28px] overflow-hidden border border-[#d9e1ed] shadow-[0_18px_34px_rgba(24,44,76,0.14)]">
                <img src={WHO_WE_ARE_IMAGE} alt="Aerial showcase of a coastal Homegrown Visuals listing at sunset" className="w-full h-full min-h-[300px] sm:min-h-[560px] md:min-h-[520px] lg:min-h-[700px] object-cover" />
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 rounded-full bg-white/92 text-[#1f2e4a] text-[11px] px-3 py-1.5 tracking-[0.14em] uppercase" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                  Signature View
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e35]/22 via-transparent to-transparent" />
              </div>
            </div>

            <div className="rounded-[14px] p-1 sm:p-7 md:p-5 lg:p-8 h-full flex flex-col">
              <p
                className="text-[#6FAFE5] text-[26px] sm:text-[40px]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Who We Are.
              </p>
              <h3
                className="mt-3 text-[#0f0f10] text-[36px] sm:text-[50px] lg:text-[56px] leading-[0.98] max-w-[820px]"
                style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, letterSpacing: "-0.02em" }}
              >
                <span className="block">Welcome to Homegrown Visuals</span>
              </h3>
              <p
                className="mt-5 sm:mt-7 text-[#6f7177] text-[16px] sm:text-[20px] max-w-[720px]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.45 }}
              >
                <span className="text-[#0f0f10]">
                  Homegrown Visuals is a media and marketing team serving the Gulf Coast from Orange Beach, AL to Destin, FL.
                </span>{" "}
                <span className="text-[#6f7177]">
                  We help realtors, brokerages, homebuilders, contractors and local business owners stand out with quality photos, videos, drone work, and social media marketing strategies.
                </span>
              </p>
              <p
                className="mt-5 sm:mt-8 text-[#6f7177] text-[16px] sm:text-[20px] max-w-[720px]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.45 }}
              >
                <span className="text-[#0f0f10]">
                  The difference? We don&apos;t just deliver beautiful media, we deliver results.
                </span>{" "}
                <span className="text-[#6f7177]">
                  Engaging content that generates leads for your business and followers for your brand. You could hire a team that just creates media, or you could hire a team that makes that media work for you!
                </span>
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href="/services"
                  className="inline-flex items-center justify-center rounded-full border border-[#d9e1ed] bg-[#eef4ff] px-5 sm:px-6 py-3 text-[#1f3a5f] transition-colors hover:bg-[#e5eeff]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                >
                  Book your shoot
                </a>
                <a
                  href="#work"
                  className="inline-flex items-center justify-center rounded-full border border-[#d9e1ed] bg-white px-5 sm:px-6 py-3 text-[#4b5d7c] transition-colors hover:bg-[#f7f9fd]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                >
                  See recent work
                </a>
              </div>

              <div className="mt-5 sm:mt-6 rounded-[22px] sm:rounded-[28px] border border-[#ececec] bg-white p-4 sm:p-6 relative overflow-hidden w-full max-w-[920px]">
                <div className="absolute left-0 top-0 bottom-0 w-[9px] bg-[#244573]" />
                <p
                  className="text-[#8d96a8] text-[14px] sm:text-[17px] italic pl-5 sm:pl-6"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}
                >
                  “Top notch service. Homegrown Visuals takes the time to understand your vision and consistently delivers above and beyond. I keep coming back, couldn’t recommend them more!”
                </p>
                <p
                  className="pl-5 sm:pl-6 mt-3 text-[#2d3a55] text-[15px] sm:text-[16px]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                >
                  , Truman A.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
