import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Camera, Zap, Gift } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const IMG_DRONE =
  "https://images.unsplash.com/photo-1772693109381-620f0622646b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcm9uZSUyMGFlcmlhbCUyMGNvYXN0YWwlMjBwcm9wZXJ0eSUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NDg4NDg3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const IMG_PHOTOGRAPHER =
  "https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoZXIlMjBzaG9vdGluZyUyMGx1eHVyeSUyMGhvbWUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzQ4ODQ4NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const IMG_BEACH =
  "https://images.unsplash.com/photo-1688150271975-ab191b741057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBiZWFjaCUyMGhvdXNlJTIwZXh0ZXJpb3IlMjBndWxmJTIwY29hc3R8ZW58MXx8fHwxNzc0ODg0ODc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function WhyHGVSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeCard, setActiveCard] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);

    // Find the card closest to center of the scroll container
    const containerRect = el.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });
    setActiveCard(closestIdx);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [checkScroll]);

  const scroll = (dir: number) => {
    setIsScrolling(true);
    scrollRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 600);
  };

  const cardStyle = (idx: number): React.CSSProperties => ({
    transform: idx === activeCard ? "translateY(-12px)" : "translateY(0px)",
    transition: "transform 0.4s ease",
  });
  const cardClass = (idx: number, base: string) => {
    return base;
  };

  return (
    <section id="why-hgv" className="bg-[#FFFFFF] py-16 sm:py-24 px-4 sm:px-8 lg:px-12 max-w-[1394px] mx-auto">
      {/* Header row */}
      <div className="flex items-start justify-between mb-10 sm:mb-14">
        <div>
          <p
            className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase mb-3"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
          >
            Why Homegrown Visuals
          </p>
          <h2
            className="text-[#1F3A5F] text-[32px] sm:text-[42px] lg:text-[50px] max-w-[700px]"
            style={{
              fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            What Sets Us Apart
            <br />
            From the Rest?
          </h2>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="w-[70px] h-11 rounded-full border border-[#1F3A5F]/15 flex items-center justify-center text-[#1F3A5F]/50 hover:text-[#1F3A5F] hover:border-[#1F3A5F]/30 transition-all disabled:opacity-30"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="w-[70px] h-11 rounded-full bg-[#2FA4A9] flex items-center justify-center text-white hover:bg-[#278f93] transition-all disabled:opacity-50"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable cards row */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-6 pt-4 items-end"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Card 1, Image (drone) */}
          <div
            ref={(el) => { cardRefs.current[0] = el; }}
            className={cardClass(
              0,
              "shrink-0 w-[300px] sm:w-[330px] h-[400px] sm:h-[420px] rounded-[24px] overflow-hidden relative cursor-pointer"
            )}
            style={cardStyle(0)}
          >
            <ImageWithFallback
              src={IMG_DRONE}
              alt="Aerial coastal property"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <p
              className="absolute bottom-6 left-6 right-6 text-white text-[17px]"
              style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.3 }}
            >
              Drone &amp; Aerial
              <br />
              <span className="text-white/70" style={{ fontWeight: 400 }}>Photography</span>
            </p>
          </div>

          {/* Card 2, Teal info card */}
          <div
            ref={(el) => { cardRefs.current[1] = el; }}
            className={cardClass(
              1,
              "shrink-0 w-[340px] sm:w-[380px] h-[400px] sm:h-[420px] rounded-[24px] bg-[#2FA4A9] p-8 sm:p-9 flex flex-col justify-between cursor-pointer"
            )}
            style={cardStyle(1)}
          >
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white/30 border-2 border-[#2FA4A9] flex items-center justify-center text-white text-[11px]"
                      style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                    >
                      {["JB", "KL", "ST"][i - 1]}
                    </div>
                  ))}
                </div>
                <span
                  className="text-white/90 text-[13px]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                >
                  500+ properties shot
                </span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[13px] px-4 py-2 rounded-full mb-6"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
              >
                <Gift size={14} /> Fast Turnaround
              </span>
            </div>
            <p
              className="text-white text-[19px] sm:text-[20px]"
              style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.35 }}
            >
              24–48 hour delivery{" "}
              <span className="text-white/70" style={{ fontWeight: 400, fontFamily: "'Satoshi', sans-serif" }}>
                so your listings go live while the momentum is hot.
              </span>
            </p>
          </div>

          {/* Card 3, Image (photographer) */}
          <div
            ref={(el) => { cardRefs.current[2] = el; }}
            className={cardClass(
              2,
              "shrink-0 w-[370px] sm:w-[420px] h-[400px] sm:h-[420px] rounded-[24px] overflow-hidden cursor-pointer"
            )}
            style={cardStyle(2)}
          >
            <ImageWithFallback
              src={IMG_PHOTOGRAPHER}
              alt="Photographer shooting interior"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card 4, Stat card */}
          <div
            ref={(el) => { cardRefs.current[3] = el; }}
            className={cardClass(
              3,
              "shrink-0 w-[300px] sm:w-[330px] h-[400px] sm:h-[420px] rounded-[24px] bg-white border border-[#e8edf2] p-8 sm:p-9 flex flex-col justify-between cursor-pointer"
            )}
            style={cardStyle(3)}
          >
            <div>
              <p
                className="text-[#1F3A5F] text-[56px] sm:text-[60px]"
                style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1 }}
              >
                98%
              </p>
              <p
                className="text-[#3D5A80] text-[14px] mt-2"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              >
                Client Satisfaction
                <br />
                Rate
              </p>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-4 mt-auto">
              {[
                { label: "Q1", h: 75 },
                { label: "Q2", h: 105 },
                { label: "Q3", h: 130 },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-[44px] rounded-full bg-[#2FA4A9]"
                    style={{ height: bar.h }}
                  />
                  <span
                    className="text-[#3D5A80]/60 text-[12px]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                  >
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5, Teal info card 2 */}
          <div
            ref={(el) => { cardRefs.current[4] = el; }}
            className={cardClass(
              4,
              "shrink-0 w-[340px] sm:w-[380px] h-[400px] sm:h-[420px] rounded-[24px] bg-[#2FA4A9] p-8 sm:p-9 flex flex-col justify-between cursor-pointer"
            )}
            style={cardStyle(4)}
          >
            <div>
              <span
                className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[13px] px-4 py-2 rounded-full"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
              >
                <Camera size={14} /> Full Service
              </span>
            </div>
            <p
              className="text-white text-[19px] sm:text-[20px]"
              style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.35 }}
            >
              Photo, video, drone &amp; virtual tours{" "}
              <span className="text-white/70" style={{ fontWeight: 400, fontFamily: "'Satoshi', sans-serif" }}>
                all from one team. No juggling vendors, we handle every angle in a single visit.
              </span>
            </p>
          </div>

          {/* Card 6, Image (beach house) */}
          <div
            ref={(el) => { cardRefs.current[5] = el; }}
            className={cardClass(
              5,
              "shrink-0 w-[320px] sm:w-[360px] h-[400px] sm:h-[420px] rounded-[24px] overflow-hidden relative cursor-pointer"
            )}
            style={cardStyle(5)}
          >
            <ImageWithFallback
              src={IMG_BEACH}
              alt="Beach house exterior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span
                className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#1F3A5F] text-[13px] px-4 py-2 rounded-full"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
              >
                <Zap size={13} className="text-[#2FA4A9]" /> Gulf Coast Experts
              </span>
            </div>
          </div>

          {/* Card 7, Stat card 2 */}
          <div
            ref={(el) => { cardRefs.current[6] = el; }}
            className={cardClass(
              6,
              "shrink-0 w-[300px] sm:w-[330px] h-[400px] sm:h-[420px] rounded-[24px] bg-white border border-[#e8edf2] p-8 sm:p-9 flex flex-col justify-between cursor-pointer"
            )}
            style={cardStyle(6)}
          >
            <div>
              <p
                className="text-[#1F3A5F] text-[56px] sm:text-[60px]"
                style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1 }}
              >
                3x
              </p>
              <p
                className="text-[#3D5A80] text-[14px] mt-2"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              >
                More Engagement
                <br />
                Than Static Photos
              </p>
            </div>
            <div className="flex items-end gap-4 mt-auto">
              {[
                { label: "Before", h: 45 },
                { label: "After", h: 130 },
              ].map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-[44px] rounded-full bg-[#2FA4A9]"
                    style={{ height: bar.h }}
                  />
                  <span
                    className="text-[#3D5A80]/60 text-[12px]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                  >
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial strip */}
      <div className="mt-14 pt-10 border-t border-[#e8edf2] flex flex-col sm:flex-row items-start gap-5">
        <span
          className="shrink-0 inline-block border border-[#2FA4A9]/30 text-[#2FA4A9] text-[12px] px-4 py-1.5 rounded-full"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
        >
          Testimonial
        </span>
        <div className="flex-1">
          <p
            className="text-[#1F3A5F] text-[20px] sm:text-[24px] lg:text-[28px]"
            style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.35 }}
          >
            <span className="text-[#2FA4A9] mr-2" style={{ fontSize: "32px" }}>"</span>
            We don't just photograph properties, we tell the story of how it feels to live there,{" "}
            <span className="text-[#3D5A80]/60" style={{ fontWeight: 400, fontFamily: "'Satoshi', sans-serif" }}>
              creating content that stops the scroll and starts the conversation.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
