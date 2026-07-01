import { SiteNavbar } from "./SiteNavbar";
import { AboutIntroSection } from "./AboutIntroSection";
import { FooterSection } from "./FooterSection";

export function AboutPage() {
  return (
    <div className="w-full bg-white min-h-screen">
      <SiteNavbar variant="warm" flat navBgClass="bg-white" />
      <AboutIntroSection />
      <FooterSection />
    </div>
  );
}
