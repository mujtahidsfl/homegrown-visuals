import { SiteNavbar } from "./SiteNavbar";
import { WhyHGVSection } from "./WhyHGVSection";
import { FAQSection } from "./FAQSection";
import { FooterSection } from "./FooterSection";

export function AboutPage() {
  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen">
      <SiteNavbar variant="warm" />
      <WhyHGVSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
