import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, ArrowRight, Star, Menu, X, Search, Camera, Video, Compass, Cpu, Image, Sparkles } from "lucide-react";
import { Link } from "react-router";
import imgHero from "../../assets/cd69347ff2071545a8f5c40747f7c6eada393abe.png";
import imgHgvLogo from "../../assets/cd8f347f8929f0c65b02f008df4e6d7431d70a30.png";

function MegaMenu() {
  const services = [
    { icon: Camera, title: "Real Estate Photography", desc: "HDR photos that make listings shine." },
    { icon: Video, title: "Property Video Tours", desc: "Cinematic walkthroughs for every listing." },
    { icon: Compass, title: "Aerial / Drone Media", desc: "Stunning aerial views of any property." },
    { icon: Image, title: "Virtual Staging", desc: "Transform empty rooms digitally." },
    { icon: Cpu, title: "3D Matterport Tours", desc: "Interactive 3D experiences for buyers." },
    { icon: Sparkles, title: "Social Media Content", desc: "Reels, shorts & branded content." },
  ];

  const comingSoon = [
    { title: "Floor Plans", desc: "Detailed 2D & 3D floor plans." },
    { title: "Agent Branding Kits", desc: "Logos, templates & headshots." },
    { title: "Property Websites", desc: "Single-property landing pages." },
  ];

  return (
    <motion.div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-[75%] max-w-[1065px]"
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="bg-white rounded-[20px] shadow-2xl overflow-visible flex min-h-[380px]">
        <div className="hidden xl:block w-[290px] shrink-0 p-[10px] pr-0">
          <div className="relative w-full h-full rounded-[15px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1612301988752-5a5b19021f45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlJTIwaW50ZXJpb3IlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NzQ2NDA5MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Featured property"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white text-[18px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                Media That Sells Homes
              </p>
              <p className="text-white/80 text-[13px] mt-1" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                Professional visuals designed to generate leads and close deals faster.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 pl-5">
          <div className="flex gap-10">
            <div className="flex-1">
              <p className="text-[#1F3A5F]/50 text-[12px] tracking-[0.1em] uppercase mb-4" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
                Our Services
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {services.map((s) => (
                  <a key={s.title} href="#" className="flex items-start gap-3 group">
                    <div
                      className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0 transition-all duration-200 group-hover:translate-y-[-2px]"
                      style={{
                        background: "linear-gradient(145deg, #f0f4f8, #e0e7ef)",
                        boxShadow: "4px 4px 8px rgba(31,58,95,0.1), -2px -2px 6px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.6)",
                      }}
                    >
                      <s.icon size={17} className="text-[#1F3A5F]" />
                    </div>
                    <div>
                      <p className="text-[#1F3A5F] text-[14px] group-hover:text-[#2FA4A9] transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                        {s.title}
                      </p>
                      <p className="text-[#1F3A5F]/50 text-[12px] mt-0.5" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                        {s.desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="w-[190px] shrink-0">
              <p className="text-[#1F3A5F]/50 text-[12px] tracking-[0.1em] uppercase mb-4" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
                Coming Soon
              </p>
              <div className="flex flex-col gap-4">
                {comingSoon.map((s) => (
                  <div key={s.title} className="flex items-start gap-3">
                    <div
                      className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(145deg, #f5f5f5, #ebebeb)",
                        boxShadow: "3px 3px 6px rgba(31,58,95,0.06), -2px -2px 5px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.5)",
                      }}
                    >
                      <div className="w-[8px] h-[8px] rounded-full bg-[#1F3A5F]/20" />
                    </div>
                    <div>
                      <p className="text-[#1F3A5F] text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                        {s.title}
                      </p>
                      <p className="text-[#1F3A5F]/50 text-[12px] mt-0.5" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#1F3A5F]/10 flex items-center justify-between">
            <div>
              <p className="text-[#1F3A5F] text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                Need help choosing a package?
              </p>
              <p className="text-[#1F3A5F]/50 text-[12px] mt-0.5" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                We'll help you find the perfect media solution for your listings.
              </p>
            </div>
            <button className="bg-[#1F3A5F] text-white text-[15px] px-7 py-3.5 rounded-full hover:bg-[#162d4a] transition-colors shrink-0"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const links = [
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
    { label: "Process", href: "#process" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-[1394px] bg-white sm:bg-transparent rounded-[16px] sm:rounded-[20px] h-[60px] sm:h-[72px] lg:h-[87px] flex items-center justify-between px-4 sm:px-6 z-20">
      <Link to="/" className="h-full flex items-center py-1">
        <img
          src={imgHgvLogo}
          alt="HGV Logo"
          className="h-full w-auto object-contain sm:brightness-0 sm:invert"
          style={{ aspectRatio: "135 / 87" }}
        />
      </Link>

      <div className="hidden lg:flex items-center gap-8 xl:gap-10">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-[#F4F6F7] text-[15px] xl:text-[16px] hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <div className="relative flex items-center">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mr-1"
              >
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the site..."
                  className="w-full h-[44px] rounded-full bg-white px-5 text-[#1F3A5F] text-[14px] outline-none placeholder:text-[#1F3A5F]/40"
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              setSearchOpen(!searchOpen);
              if (searchOpen) setSearchQuery("");
            }}
            className="w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            {searchOpen ? (
              <X size={18} className="text-[#1F3A5F]" />
            ) : (
              <Search size={18} className="text-[#1F3A5F]" />
            )}
          </button>
        </div>
        <button
          className="h-[44px] px-6 rounded-full border border-white text-white text-[15px] hover:bg-white/10 transition-colors flex items-center gap-2"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
          onClick={() => setMegaOpen(!megaOpen)}
        >
          {megaOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className="hidden sm:block lg:hidden relative">
        <div className="absolute inset-0 bg-white/40 rounded-[999px] translate-y-[3px] blur-[2px]" />
        <button className="relative bg-[#597eb1] text-white text-[13px] font-['Satoshi',sans-serif] tracking-[0.06em] uppercase px-4 sm:px-6 py-2.5 sm:py-3 rounded-[999px] hover:bg-[#4a6d9e] transition-all">
          Book a Shoot
        </button>
      </div>

      <button
        className="lg:hidden p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[16px] shadow-xl p-6 flex flex-col gap-4 lg:hidden">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#1F3A5F] text-[18px] font-['Satoshi',sans-serif] hover:opacity-70 transition-opacity"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button className="sm:hidden bg-[#597eb1] text-white text-[13px] font-['Satoshi',sans-serif] tracking-[0.06em] uppercase px-6 py-3 rounded-[999px] hover:bg-[#4a6d9e] transition-colors w-full mt-2">
            Book a Shoot
          </button>
        </div>
      )}

      <AnimatePresence>
        {megaOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setMegaOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <MegaMenu />
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

function HeroCTAs() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 sm:mt-8">
      <button className="relative rounded-[999px] bg-white p-[3px]">
        <div className="bg-[#597eb1] rounded-[999px] px-5 sm:px-8 py-3 sm:py-4 flex items-center gap-3 hover:bg-[#4a6d9e] transition-colors">
          <span className="text-white text-[15px] sm:text-[18px] font-medium tracking-wide">
            BOOK YOUR SHOOT
          </span>
          <ArrowRight className="text-white" size={20} />
        </div>
      </button>
      <div className="flex items-center gap-3">
        <button className="bg-white/25 backdrop-blur-md border border-white/30 rounded-full w-[52px] h-[52px] sm:w-[68px] sm:h-[68px] flex items-center justify-center hover:bg-white/35 transition-colors shrink-0">
          <Play className="text-white" size={20} />
        </button>
        <span className="text-[#F4F6F7] text-[17px] sm:text-[20px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>See Our Work</span>
      </div>
    </div>
  );
}

function RatingSection() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
      <div className="flex -space-x-4 sm:-space-x-5">
        <div className="w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] rounded-full bg-white" />
        <div className="w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] rounded-full bg-white/90" />
        <div className="w-[44px] h-[44px] sm:w-[60px] sm:h-[60px] rounded-full bg-white/80" />
      </div>
      <span
        className="text-[#F4F6F7] text-[16px] sm:text-[20px]"
        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
      >
        200+ Lorem
      </span>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} fill="#FFFB00" stroke="none" />
        ))}
      </div>
      <span
        className="text-[#F4F6F7] text-[16px] sm:text-[20px]"
        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
      >
        5.0
      </span>
    </div>
  );
}

export function HeroSection() {
  return (
    <div className="bg-[#FAF8F2] px-1 sm:px-1 pt-1 sm:pt-1">
      <section id="services" className="relative w-full min-h-[85vh] overflow-hidden rounded-[20px] sm:rounded-[24px]">
        <img
          src={imgHero}
          alt="Real estate interior"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "contrast(1.1) saturate(0.85) brightness(0.95)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b2e]/85 via-[#1F3A5F]/50 to-[#1F3A5F]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2e]/60 via-transparent to-[#0d1b2e]/20" />
        <div className="absolute top-0 left-0 right-0 h-[6%] bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 150px 60px rgba(0,0,0,0.3)" }} />

        <Navbar />

        <div className="relative z-10 flex flex-col justify-center min-h-[85vh] px-4 sm:px-8 pt-[130px] sm:pt-[120px] lg:pt-[130px] pb-8 sm:pb-12 max-w-[1394px] mx-auto rounded-[15px]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8">
            <div className="flex flex-col max-w-full lg:max-w-[60%] mt-[38px] sm:mt-[18px]">
              <h1
                className="text-[#F4F6F7] max-w-[700px] text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em" }}
              >
                Media That Sells<br />Homes Faster.
              </h1>
              <p
                className="text-[#F4F6F7] text-[15px] sm:text-[16px] md:text-[18px] max-w-[572px] mt-4 sm:mt-4"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.75 }}
              >
                We don't just shoot photos and videos — we create media that
                generates leads for your listings and grows your brand.
              </p>

              <HeroCTAs />

              <div className="w-full max-w-[817px] h-[1px] bg-white mt-10 sm:mt-10 mb-7 sm:mb-8" />

              <RatingSection />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
