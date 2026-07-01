import { useEffect, useRef, useState } from "react";
import founderDeanFagot from "../../assets/about/founder-dean-fagot.png";
import hantoClarke from "../../assets/client-badges/hanto-clarke.png";
import kellerWilliams from "../../assets/client-badges/keller-williams.webp";
import lrrLogo from "../../assets/client-badges/lrr-logo.png";

export function AboutIntroSection() {
  const [countValue, setCountValue] = useState(0);
  const statRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = statRef.current;
    if (!node) return;

    let frame = 0;
    let started = false;

    const animateCount = () => {
      const duration = 1600;
      const target = 2000;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCountValue(Math.round(target * eased));

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          animateCount();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="about-intro" className="bg-white px-4 sm:px-8 py-12 sm:py-18">
      <div className="max-w-[1394px] mx-auto">
        <div className="grid md:grid-cols-[0.92fr_1.08fr] lg:grid-cols-[0.96fr_1.04fr] gap-8 sm:gap-10 lg:gap-12 items-stretch md:min-h-[560px] lg:min-h-[680px]">
          <div className="relative min-h-[340px] sm:min-h-[560px] md:min-h-[520px] lg:min-h-[680px] h-full">
            <div className="hidden sm:block absolute left-0 md:left-2 top-[46px] md:top-[34px] w-[86%] md:w-[72%] h-[62%] md:h-[70%] rounded-[15px] bg-[#d8e6ff]" />
            <div className="relative sm:absolute left-0 sm:left-8 md:left-10 top-0 h-full w-full sm:w-[88%] md:w-[78%] lg:w-[88%] rounded-[24px] overflow-hidden shadow-[0_18px_34px_rgba(24,44,76,0.15)]">
              <img src={founderDeanFagot} alt="Dean Fagot, founder of Homegrown Visuals" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e35]/22 via-transparent to-transparent" />
            </div>

            <div
              ref={statRef}
              className="absolute right-0 sm:right-3 md:-right-6 bottom-5 sm:bottom-7 md:bottom-6 bg-white rounded-[18px] sm:rounded-[22px] px-4 sm:px-5 py-4 sm:py-5 shadow-[0_10px_24px_rgba(20,36,68,0.2)] min-w-[232px] sm:min-w-[320px] md:min-w-[280px]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex -space-x-3">
                  {[
                    { src: hantoClarke, alt: "Hanto + Clarke" },
                    { src: kellerWilliams, alt: "Keller Williams" },
                    { src: lrrLogo, alt: "Levin Rinke Realty" },
                  ].map((logo) => (
                    <span
                      key={logo.alt}
                      className="w-11 h-11 rounded-full bg-[#eef3ff] border-2 border-white shadow-[0_8px_20px_rgba(63,102,204,0.12)] flex items-center justify-center overflow-hidden p-2"
                    >
                      <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain" />
                    </span>
                  ))}
                </div>
                <span
                  className="min-w-[74px] h-10 rounded-full bg-[#3f66cc] text-white text-[15px] inline-flex items-center justify-center px-3"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                >
                  {countValue.toLocaleString()}+
                </span>
              </div>
              <p
                className="mt-3 text-[#3f66cc] tracking-[0.12em] uppercase text-[14px] sm:text-[16px]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
              >
                Media Assets Delivered
              </p>
            </div>
          </div>

          <div className="h-full flex flex-col justify-center">
            <p
              className="text-[#6FAFE5] text-[26px] sm:text-[40px]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
            >
              Get to Know Us.
            </p>
            <h2
              className="mt-3 text-[#0f0f10] text-[36px] sm:text-[52px] lg:text-[58px] leading-[0.98] max-w-[820px]"
              style={{ fontFamily: "'PP Neue Montreal', 'Satoshi', sans-serif", fontWeight: 500, letterSpacing: "-0.02em" }}
            >
              Welcome to Homegrown
              <br />
              Visuals.
            </h2>
            <p
              className="mt-6 text-[20px] sm:text-[24px] max-w-[720px]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.45 }}
            >
              <span className="text-[#0f0f10]">
                Homegrown Visuals was built for businesses, agents, and brands that need more than pretty content.
              </span>{" "}
              <span className="text-[#6f7177]">
                We create strategic photo, video, and marketing assets designed to help listings stand out, build stronger brands, and turn attention into action.
              </span>
            </p>
            <p
              className="mt-5 text-[20px] sm:text-[24px] max-w-[720px]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.45 }}
            >
              <span className="text-[#0f0f10]">
                Founded by Dean Fagot, Homegrown brings together real estate insight, construction-world discipline, and a filmmaker&apos;s eye for story.
              </span>{" "}
              <span className="text-[#6f7177]">
                Dean&apos;s background spans real estate acquisitions, large-scale construction projects, and years of hands-on media production across the Gulf Coast.
              </span>
            </p>
            <p
              className="mt-5 text-[20px] sm:text-[24px] max-w-[720px]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.45 }}
            >
              <span className="text-[#0f0f10]">
                Today, we support clients from Orange Beach to Destin with media that is polished, intentional, and built to perform.
              </span>{" "}
              <span className="text-[#6f7177]">
                Whether it&apos;s a luxury listing, a reel, a brand campaign, or a full content rollout, the goal stays the same: create work that looks elevated and delivers real results.
              </span>
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-[#d9e1ed] bg-[#eef4ff] px-5 sm:px-6 py-3 text-[#1f3a5f] transition-colors hover:bg-[#e5eeff]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Book your shoot
              </a>
              <a
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full border border-[#d9e1ed] bg-white px-5 sm:px-6 py-3 text-[#4b5d7c] transition-colors hover:bg-[#f7f9fd]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Explore the portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
