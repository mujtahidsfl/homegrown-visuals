import svgPaths from "./svg-dno7wvr5b4";
import imgHero from "../assets/cd69347ff2071545a8f5c40747f7c6eada393abe.png";
import imgHgvLogo from "../assets/cd8f347f8929f0c65b02f008df4e6d7431d70a30.png";
import imgRectangle39 from "../assets/320ede941f25d394c5fbaa573ab9981c38ae1f6c.png";

function NavLinks() {
  return (
    <div className="absolute contents font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[606px] not-italic text-[18px] text-black top-[53px] whitespace-nowrap" data-name="NAV LINKS">
      <p className="absolute decoration-solid left-[606px] top-[53px] underline">Services</p>
      <p className="absolute left-[728px] top-[53px]">Work</p>
      <p className="absolute left-[820px] top-[53px]">Process</p>
      <p className="absolute left-[936px] top-[53px]">Pricing</p>
      <p className="absolute left-[1043px] top-[53px]">FAQ</p>
    </div>
  );
}

function PrimaryCtaButton() {
  return (
    <div className="absolute contents left-[1232px] top-[29px]" data-name="PRIMARY CTA BUTTON">
      <div className="absolute bg-[#1f3a5f] h-[69px] left-[1232px] rounded-[20px] top-[29px] w-[174px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1262px] not-italic text-[18px] text-white top-[53px] whitespace-nowrap">Book a Shoot</p>
    </div>
  );
}

function HeadingsBody() {
  return (
    <div className="absolute contents font-['PP_Neue_Montreal:Medium',sans-serif] leading-[normal] left-[17px] not-italic text-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] text-white top-[341px]" data-name="HEADINGS + BODY">
      <p className="absolute left-[17px] text-[55px] top-[341px] w-[520px]">Your Listings Deserve to Stand Out.</p>
      <p className="absolute left-[17px] text-[20px] top-[503px] w-[572px]">{`We don’t just shoot photos and videos — we create media that generates leads for your listings and grows your brand. `}</p>
    </div>
  );
}

function IconoirArrowUp({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-name="iconoir:arrow-up">
      <div className="absolute inset-[12.5%_14.58%]" data-name="Vector">
        <div className="absolute inset-[-4.17%_-4.41%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.5 19.5">
            <path d={svgPaths.p38972e80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonTextSecondary() {
  return (
    <div className="absolute contents left-[47px] top-[613px]" data-name="BUTTON TEXT SECONDARY">
      <p className="absolute font-['PP_Neue_Montreal:Medium',sans-serif] leading-[normal] left-[47px] not-italic text-[20px] text-white top-[615px] whitespace-nowrap">BOOK YOUR SHOOT</p>
      <div className="absolute flex items-center justify-center left-[254px] size-[24px] top-[613px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <IconoirArrowUp />
        </div>
      </div>
    </div>
  );
}

function SecondaryCta() {
  return (
    <div className="absolute contents left-[17px] top-[589px]" data-name="SECONDARY CTA">
      <div className="absolute bg-white h-[71px] left-[17px] rounded-[30px] top-[589px] w-[284px]" />
      <div className="absolute bg-[#597eb1] h-[64px] left-[20px] rounded-[30px] top-[593px] w-[278px]" />
      <ButtonTextSecondary />
    </div>
  );
}

function LucidePlay({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[347px] size-[24px] top-[611px]"} data-name="lucide:play">
      <div className="absolute inset-[12.5%_12.49%_12.5%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-5.56%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0012 20.0012">
            <path d={svgPaths.p1421a100} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TertiaryPfRedirection() {
  return (
    <div className="absolute contents left-[325px] top-[589px]" data-name="TERTIARY PF REDIRECTION">
      <div className="absolute bg-white h-[68px] left-[325px] rounded-[100px] top-[589px] w-[67px]" />
      <LucidePlay />
    </div>
  );
}

function HeroCtas() {
  return (
    <div className="absolute contents left-[17px] top-[589px]" data-name="HERO CTA'S">
      <SecondaryCta />
      <TertiaryPfRedirection />
      <p className="absolute font-['PP_Neue_Montreal:Medium',sans-serif] leading-[normal] left-[416px] not-italic text-[20px] text-white top-[611px] whitespace-nowrap">See Our Work</p>
    </div>
  );
}

function RatingSeriesImagery() {
  return (
    <div className="absolute h-[80px] left-[23px] top-[775px] w-[160px]" data-name="RATING SERIES IMAGERY">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 80">
        <g id="RATING SERIES IMAGERY">
          <circle cx="40" cy="40" fill="var(--fill-0, white)" id="Ellipse 1" r="40" />
          <circle cx="78" cy="40" fill="var(--fill-0, white)" fillOpacity="0.9" id="Ellipse 2" r="40" />
          <circle cx="120" cy="40" fill="var(--fill-0, white)" fillOpacity="0.8" id="Ellipse 3" r="40" />
        </g>
      </svg>
    </div>
  );
}

function SolarStarBold({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[371px] size-[24px] top-[803px]"} data-name="solar:star-bold">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.0005 19.9999">
          <path d={svgPaths.p3a4429c0} fill="var(--fill-0, #FFFB00)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function RatingGraphic() {
  return (
    <div className="absolute contents left-[371px] top-[803px]" data-name="RATING GRAPHIC">
      <SolarStarBold />
      <div className="absolute left-[401px] size-[24px] top-[803px]" data-name="solar:star-bold">
        <div className="absolute inset-[8.33%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.0005 19.9999">
            <path d={svgPaths.p3a4429c0} fill="var(--fill-0, #FFFB00)" id="Vector" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[431px] size-[24px] top-[803px]" data-name="solar:star-bold">
        <div className="absolute inset-[8.33%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.0005 19.9999">
            <path d={svgPaths.p3a4429c0} fill="var(--fill-0, #FFFB00)" id="Vector" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[461px] size-[24px] top-[803px]" data-name="solar:star-bold">
        <div className="absolute inset-[8.33%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.0005 19.9999">
            <path d={svgPaths.p3a4429c0} fill="var(--fill-0, #FFFB00)" id="Vector" />
          </svg>
        </div>
      </div>
      <div className="absolute left-[491px] size-[24px] top-[803px]" data-name="solar:star-bold">
        <div className="absolute inset-[8.33%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.0005 19.9999">
            <path d={svgPaths.p3a4429c0} fill="var(--fill-0, #FFFB00)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RatingUnderHeroSection() {
  return (
    <div className="absolute contents left-[23px] top-[775px]" data-name="RATING UNDER HERO SECTION">
      <RatingSeriesImagery />
      <p className="absolute font-['Neue_Montreal:Bold',sans-serif] leading-[normal] left-[200px] not-italic text-[20px] text-white top-[803px] whitespace-nowrap">200+ Lorem</p>
      <RatingGraphic />
      <p className="absolute font-['Neue_Montreal:Bold',sans-serif] leading-[normal] left-[538px] not-italic text-[20px] text-white top-[803px] whitespace-nowrap">5.0</p>
    </div>
  );
}

function MdiLocations({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[1102px] size-[28px] top-[809px]"} data-name="mdi:locations">
      <div className="absolute inset-[8.33%_12.5%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 23.3333">
          <path d={svgPaths.pf7da480} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="relative size-full" data-name="HERO">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHero} />
      <div className="-translate-x-1/2 absolute bg-white h-[87px] left-1/2 rounded-[20px] top-[20px] w-[1394px]" data-name="NAV BAR" />
      <NavLinks />
      <div className="absolute bg-white h-[305px] left-[1098px] rounded-[20px] top-[617px] w-[319px]" data-name="GOOGLE MAP LIVE GMB ACC LINK" />
      <p className="absolute font-['PP_Neue_Montreal:Medium',sans-serif] leading-[normal] left-[1137px] not-italic text-[16px] text-black top-[813px] whitespace-nowrap">{` Orange Beach, AL → to Navarre, FL.`}</p>
      <PrimaryCtaButton />
      <HeadingsBody />
      <HeroCtas />
      <div className="absolute flex h-[1.007px] items-center justify-center left-[23px] top-[707px] w-[817px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[0.07deg]">
          <div className="h-0 relative w-[817.001px]" data-name="PARTITION LINE">
            <div className="absolute inset-[-1.5px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 817.001 1.5">
                <line id="PARTITION LINE" stroke="var(--stroke-0, white)" strokeWidth="1.5" x2="817.001" y1="0.75" y2="0.75" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <RatingUnderHeroSection />
      <div className="absolute h-[87px] left-[47px] top-[20px] w-[135px]" data-name="HGV LOGO">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHgvLogo} />
      </div>
      <div className="absolute h-[177px] left-[1102px] rounded-tl-[20px] rounded-tr-[20px] top-[620px] w-[312px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[20px] rounded-tr-[20px] size-full" src={imgRectangle39} />
      </div>
      <MdiLocations />
    </div>
  );
}