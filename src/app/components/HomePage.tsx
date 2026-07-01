import { HeroSection } from "./HeroSection";
import { TrustBadges } from "./TrustBadges";
import { ClientTestimonialsSection } from "./ClientTestimonialsSection";
import { AboutStorySection } from "./AboutStorySection";
import { OurProcessSection } from "./OurProcessSection";
import { FAQSection } from "./FAQSection";
import { FooterSection } from "./FooterSection";

export function HomePage() {
  return (
    <div className="w-full bg-[#FFFFFF]">
      <HeroSection />
      <TrustBadges />
      <ClientTestimonialsSection />
      <AboutStorySection />
      <OurProcessSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
