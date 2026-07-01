import svgPaths from "../../imports/svg-fsx7nrcg4w";

function Logo1() {
  return (
    <div className="h-[50px] w-[103px] shrink-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 103 50">
        <path d={svgPaths.p3fce8b80} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.pc2ccd00} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p3db52780} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p2a09d80} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p3d7b2e80} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p2ada3b00} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p11bc1380} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p176f3d00} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p3ff56c00} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.pd4e6680} fill="var(--fill-0, #1F3A5F)" />
        <path d={svgPaths.p1e6f8e00} fill="var(--fill-0, #1F3A5F)" />
      </svg>
    </div>
  );
}

function Logo2() {
  return (
    <div className="h-[41px] w-[144px] shrink-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 144 41">
        <path d={svgPaths.p3dc85b00} fill="url(#paint0_linear_trust)" />
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_trust" x1="-0.000465691" x2="137.977" y1="16.3998" y2="16.3998">
            <stop stopColor="#494582" />
            <stop offset="0.307" stopColor="#8E3F5A" />
            <stop offset="0.604" stopColor="#113322" />
            <stop offset="1" stopColor="#494582" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Logo3() {
  return (
    <div className="h-[70px] w-[130px] shrink-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 195 108">
        <path d={svgPaths.p23762900} fill="#394149" />
        <path d={svgPaths.p16086980} fill="#394149" />
        <path d={svgPaths.p3fe68900} fill="#394149" />
        <path d={svgPaths.p7b09e00} fill="#394149" />
        <path d={svgPaths.p681ad70} fill="#394149" />
        <path d={svgPaths.p23097400} fill="#394149" />
        <path d={svgPaths.p3e1df80} fill="#394149" />
        <path d={svgPaths.p280afe00} fill="#394149" />
        <path d={svgPaths.p32025000} fill="#394149" />
        <path d={svgPaths.p324bf00} fill="#394149" />
      </svg>
    </div>
  );
}

function Logo4() {
  return (
    <div className="h-[65px] w-[115px] shrink-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 177.78 100">
        <path d={svgPaths.p34ecfc80} fill="#394149" />
      </svg>
    </div>
  );
}

function Logo5() {
  return (
    <div className="h-[55px] w-[113px] shrink-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 96.05 46.7367">
        <path d={svgPaths.p1531dbf0} fill="black" />
        <path d={svgPaths.p3880e630} fill="black" />
        <path d={svgPaths.p1fc7c780} fill="black" />
        <path d={svgPaths.p2b31bc80} fill="black" />
        <path d={svgPaths.p25bb1a80} fill="black" />
        <path d={svgPaths.p358b3100} fill="black" />
        <path d={svgPaths.p3032c400} fill="black" />
        <path d={svgPaths.p7958400} fill="black" />
        <path d={svgPaths.p8f566f0} fill="black" />
        <path d={svgPaths.p25419a00} fill="black" />
        <path d={svgPaths.p25486a00} fill="black" />
        <path d={svgPaths.p3ae66900} fill="black" />
        <path d={svgPaths.p31418800} fill="black" />
      </svg>
    </div>
  );
}

const logos = [Logo1, Logo2, Logo3, Logo4, Logo5];

export function TrustBadges() {
  // Duplicate logos for seamless loop
  const rendered = [...logos, ...logos, ...logos].map((Logo, i) => (
    <div key={i} className="flex items-center justify-center px-8 sm:px-12 md:px-16 opacity-60 hover:opacity-100 transition-opacity duration-300">
      <Logo />
    </div>
  ));

  return (
    <section className="bg-[#FAF8F2] py-10 sm:py-14 overflow-hidden">
      {/* Heading */}
      <p
        className="text-center text-[#1F3A5F]/40 text-[12px] sm:text-[13px] tracking-[0.2em] uppercase mb-8 sm:mb-10 px-4"
        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
      >
        Trusted by Leading Brands on the Emerald Coast
      </p>

      {/* Scrolling marquee */}
      <div className="relative w-full">
        <div className="flex animate-marquee">
          {rendered}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
