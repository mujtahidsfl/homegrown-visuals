import { SiteNavbar } from "./SiteNavbar";
import { FooterSection } from "./FooterSection";
import { ServicesBookingFlow } from "./ServicesBookingFlow";

export function PricingPage() {
  return (
    <div className="w-full bg-white min-h-screen">
      <SiteNavbar variant="cool" flat navBgClass="bg-white" />
      <ServicesBookingFlow />
      <FooterSection />
    </div>
  );
}
