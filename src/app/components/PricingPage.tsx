import { SiteNavbar } from "./SiteNavbar";
import { TransformationSection } from "./TransformationSection";
import { FooterSection } from "./FooterSection";

export function PricingPage() {
  return (
    <div className="w-full bg-[#F3F8FF] min-h-screen">
      <SiteNavbar variant="cool" />
      <TransformationSection />
      <FooterSection />
    </div>
  );
}
