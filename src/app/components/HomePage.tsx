import { HeroSection } from "./HeroSection";
import { TrustBadges } from "./TrustBadges";
import { ClientTestimonialsSection } from "./ClientTestimonialsSection";
import { AboutStorySection } from "./AboutStorySection";
import { OurProcessSection } from "./OurProcessSection";
import { WhyHGVSection } from "./WhyHGVSection";
import { FooterSection } from "./FooterSection";

export function HomePage() {
  return (
    <div className="w-full bg-[#FFFFFF]">
      <HeroSection />
      <TrustBadges />
      <ClientTestimonialsSection />
      <AboutStorySection />
      <OurProcessSection />
      <WhyHGVSection />
      <FooterSection />
    </div>
  );
}
