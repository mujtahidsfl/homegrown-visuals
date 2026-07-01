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
  { src: ctLogo, alt: "Cretin Townsend Homes", sizeClass: "scale-[0.92] sm:scale-100" },
  { src: drHorton, alt: "DR Horton", sizeClass: "scale-[0.92] sm:scale-100" },
  { src: envLogo, alt: "Engel & Volkers", sizeClass: "scale-[1.02] sm:scale-[1.08]" },
  { src: hantoClarke, alt: "Hanto + Clarke", sizeClass: "scale-[0.94] sm:scale-[1.04]" },
  { src: kellerWilliams, alt: "Keller Williams Realty Gulf Coast", sizeClass: "scale-[0.9] sm:scale-[1.02]" },
  { src: lrrLogo, alt: "Levin Rinke Realty", sizeClass: "scale-[0.98] sm:scale-[1.06]" },
  { src: remaxSelect, alt: "Remax Select Partners", sizeClass: "scale-[1.02] sm:scale-[1.08]" },
  { src: solidPine, alt: "Solid Pine", sizeClass: "scale-[0.92] sm:scale-100" },
  { src: rpPreferredPartner, alt: "Preferred Partner Badge", sizeClass: "scale-[1.02] sm:scale-[1.08]" },
] as const;

export function TrustBadges() {
  const rendered = logos.map((logo, i) => (
    <div
      key={`${logo.alt}-${i}`}
      className="flex items-center justify-center px-4 sm:px-10 md:px-14 opacity-70 hover:opacity-100 transition-opacity duration-300 shrink-0"
    >
      <img
        src={logo.src}
        alt={logo.alt}
        className={`h-[36px] sm:h-[56px] md:h-[62px] w-auto object-contain shrink-0 ${logo.sizeClass}`}
        loading="lazy"
        decoding="async"
      />
    </div>
  ));

  return (
    <section className="bg-[#FFFFFF] py-10 sm:py-14 overflow-hidden">
      <p
        className="text-center text-[#1F3A5F]/40 text-[17px] sm:text-[26px] tracking-[0.08em] uppercase mb-8 sm:mb-10 px-4 leading-[1.35]"
        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
      >
        <span className="block sm:hidden">Trusted by Leading Brands</span>
        <span className="block sm:hidden">on the Gulf Coast</span>
        <span className="hidden sm:inline">TRUSTED BY LEADING BRANDS ON THE GULF COAST</span>
      </p>

      <div className="relative w-full overflow-hidden min-h-[62px] sm:min-h-[84px]">
        <div className="flex w-max min-w-max animate-marquee-track will-change-transform">
          <div className="flex w-max min-w-max">
            {rendered}
          </div>
          <div className="flex w-max min-w-max">
            {rendered}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-track {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-track {
          animation: marquee-track 24s linear infinite;
        }
      `}</style>
    </section>
  );
}
