import ctLogo from "../../assets/client-badges/ct-logo.png";
import drHorton from "../../assets/client-badges/dr-horton.png";
import envLogo from "../../assets/client-badges/env.png";
import hantoClarke from "../../assets/client-badges/hanto-clarke.png";
import kellerWilliams from "../../assets/client-badges/keller-williams.webp";
import lrrLogo from "../../assets/client-badges/lrr-logo.png";
import remaxSelect from "../../assets/client-badges/remax-select.png";
import solidPine from "../../assets/client-badges/solid-pine.png";
import rpPreferredPartner from "../../assets/client-badges/rp-preferred-partner.png";

const logos = [
  { src: ctLogo, alt: "Cretin Townsend Homes" },
  { src: drHorton, alt: "DR Horton" },
  { src: envLogo, alt: "Engel & Volkers" },
  { src: hantoClarke, alt: "Hanto + Clarke" },
  { src: kellerWilliams, alt: "Keller Williams Realty Gulf Coast" },
  { src: lrrLogo, alt: "Levin Rinke Realty" },
  { src: remaxSelect, alt: "Remax Select Partners" },
  { src: solidPine, alt: "Solid Pine" },
  { src: rpPreferredPartner, alt: "Preferred Partner Badge" },
] as const;

export function TrustBadges() {
  const rendered = [...logos, ...logos, ...logos].map((logo, i) => (
    <div
      key={`${logo.alt}-${i}`}
      className="flex items-center justify-center px-8 sm:px-12 md:px-16 opacity-70 hover:opacity-100 transition-opacity duration-300"
    >
      <img
        src={logo.src}
        alt={logo.alt}
        className="h-[54px] sm:h-[62px] md:h-[68px] w-auto object-contain shrink-0"
        loading="lazy"
        decoding="async"
      />
    </div>
  ));

  return (
    <section className="bg-[#FFFFFF] py-10 sm:py-14 overflow-hidden">
      <p
        className="text-center text-[#1F3A5F]/40 text-[12px] sm:text-[13px] tracking-[0.2em] uppercase mb-8 sm:mb-10 px-4"
        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
      >
        Trusted by Leading Brands on the Emerald Coast
      </p>

      <div className="relative w-full">
        <div className="flex animate-marquee">{rendered}</div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
