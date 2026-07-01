import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";
import imgHgvLogo from "../../assets/cd8f347f8929f0c65b02f008df4e6d7431d70a30.png";
import { SmartSearchBox } from "./SmartSearchBox";

type SiteNavbarProps = {
  overlay?: boolean;
  variant?: "warm" | "cool";
  flat?: boolean;
  navBgClass?: string;
};

export function SiteNavbar({ overlay = false, variant = "warm", flat = false, navBgClass }: SiteNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", to: "/" },
    { label: "Services", to: "/services" },
    { label: "Portfolio", to: "/portfolio" },
    { label: "About", to: "/about" },
    { label: "FAQ", to: "/#faq" },
  ];

  const solidContainerClass =
    variant === "cool"
      ? "bg-[#f7fbff] border border-[#d6deea] shadow-[0_8px_20px_rgba(31,58,95,0.08)]"
      : "bg-[#ffffff] border border-[#e3dccf] shadow-[0_8px_20px_rgba(31,58,95,0.08)]";

  const flatContainerClass = navBgClass ?? (variant === "cool" ? "bg-[#f7fbff]" : "bg-[#ffffff]");
  const flatContainerSurfaceClass = `${flatContainerClass} border border-transparent shadow-none`;

  const navPositionClass = overlay
    ? "absolute top-2 sm:top-3"
    : flat
      ? "relative mt-0 mb-4 sm:mb-5"
      : "relative mt-2 sm:mt-3 mb-5 sm:mb-7";

  return (
    <nav
      className={`${navPositionClass} left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-[1394px] rounded-[16px] sm:rounded-[20px] h-[60px] sm:h-[72px] lg:h-[87px] flex items-center justify-between px-4 sm:px-6 z-40 ${overlay ? "bg-white sm:bg-transparent" : flat ? flatContainerSurfaceClass : solidContainerClass}`}
    >
      <Link to="/" className="h-full flex items-center py-1">
        <img
          src={imgHgvLogo}
          alt="HGV Logo"
          className={`h-full w-auto object-contain ${overlay ? "sm:brightness-0 sm:invert" : ""}`}
          style={{ aspectRatio: "135 / 87" }}
        />
      </Link>

      <div className="hidden lg:flex items-center gap-8 xl:gap-10">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={`${overlay ? "text-[#F4F6F7]" : "text-[#1F3A5F]"} text-[15px] xl:text-[16px] hover:opacity-70 transition-opacity`}
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <SmartSearchBox overlay={overlay} flat={flat} />
        <Link
          to="/services"
          className={`${overlay ? "border-white/45 text-white hover:bg-white/10" : flat ? "bg-[#1F3A5F]/8 text-[#1F3A5F] hover:bg-[#1F3A5F]/14 border-transparent" : "border-[#1F3A5F]/25 text-[#1F3A5F] hover:bg-[#1F3A5F]/5"} h-[44px] px-6 rounded-full border text-[15px] transition-colors flex items-center`}
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
        >
          Book With Us
        </Link>

      </div>

      <button
        className={`lg:hidden p-2 ${overlay ? "text-[#1F3A5F] sm:text-white" : "text-[#1F3A5F]"}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[16px] shadow-xl p-6 flex flex-col gap-4 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[#1F3A5F] text-[18px] font-['Satoshi',sans-serif] hover:opacity-70 transition-opacity"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/services" className="bg-[#597eb1] text-white text-[13px] font-['Satoshi',sans-serif] tracking-[0.06em] uppercase px-6 py-3 rounded-[999px] hover:bg-[#4a6d9e] transition-colors w-full mt-2 text-center">
            Book a Shoot
          </Link>
        </div>
      )}
    </nav>
  );
}
