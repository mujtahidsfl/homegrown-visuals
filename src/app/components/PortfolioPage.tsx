import { SiteNavbar } from "./SiteNavbar";
import { PortfolioSection } from "./PortfolioSection";
import { FooterSection } from "./FooterSection";

export function PortfolioPage() {
  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen">
      <SiteNavbar variant="warm" />
      <PortfolioSection />
      <FooterSection />
    </div>
  );
}
