import { HeroSection } from "./HeroSection";
import { NumericalStats } from "./NumericalStats";
import { TrustBadges } from "./TrustBadges";
import { ClientVideoTestimonials } from "./ClientVideoTestimonials";
import { PortfolioSection } from "./PortfolioSection";
import { OurProcessSection } from "./OurProcessSection";
import { WhyHGVSection } from "./WhyHGVSection";
import { TransformationSection } from "./TransformationSection";
import { FAQSection } from "./FAQSection";
import { FooterSection } from "./FooterSection";

export function HomePage() {
  return (
    <div className="w-full bg-[#FAF8F2]">
      <HeroSection />
      <NumericalStats />
      <TrustBadges />
      <ClientVideoTestimonials />
      <PortfolioSection />
      <OurProcessSection />
      <WhyHGVSection />
      <TransformationSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
