import { SiteNavbar } from "./SiteNavbar";
import { PortfolioSection } from "./PortfolioSection";
import { FooterSection } from "./FooterSection";

export function PortfolioPage() {
  return (
    <div className="w-full bg-white min-h-screen">
      <SiteNavbar variant="warm" flat navBgClass="bg-white" />
      <PortfolioSection />
      <FooterSection />
    </div>
  );
}
