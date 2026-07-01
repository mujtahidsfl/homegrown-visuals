import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Play, Pause, Menu, X, MapPin, ExternalLink, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import imgHgvLogo from "../../assets/cd8f347f8929f0c65b02f008df4e6d7431d70a30.png";
import { PACKAGE_DISPLAY, type PackageKey } from "../booking/config";
import { BookingIntentModal } from "./booking/BookingIntentModal";
import { SmartSearchBox } from "./SmartSearchBox";

const GOOGLE_BUSINESS_URL =
  "https://www.google.com/maps/place/Homegrown+Visuals/@30.4979441,-87.1880423,17z/data=!3m1!4b1!4m6!3m5!1s0x8891b7fe9d8bd97f:0x2de33357bb1292e7!8m2!3d30.4979441!4d-87.1880423!16s%2Fg%2F11x03610mm?entry=ttu&g_ep=EgoyMDI2MDQwMS4wIKXMDSoASAFQAw%3D%3D";
const HERO_VIDEO_URL =
  "https://dl.dropboxusercontent.com/scl/fi/oqmkqotg1qqr3bj5kj4xv/Website-welcome-video.mp4?rlkey=wcgyl1ts639gd5imcsex95l69&st=kadfcb2e&raw=1";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/#faq" },
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
          <Link
            key={link.label}
            to={link.href}
            className="text-[#F4F6F7] text-[15px] xl:text-[16px] hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <SmartSearchBox overlay />
        <Link
          to="/services"
          className="h-[44px] px-6 rounded-full border border-white/45 text-white text-[15px] hover:bg-white/10 transition-colors flex items-center"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
        >
          Book With Us
        </Link>
      </div>

      <button
        className="lg:hidden p-2 text-[#111111] sm:text-white"
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
              to={link.href}
              className="text-[#1F3A5F] text-[18px] font-['Satoshi',sans-serif] hover:opacity-70 transition-opacity"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/services"
            className="bg-[#597eb1] text-white text-[13px] font-['Satoshi',sans-serif] tracking-[0.06em] uppercase px-6 py-3 rounded-[999px] hover:bg-[#4a6d9e] transition-colors w-full mt-2 text-center"
          >
            Book a Shoot
          </a>
        </div>
      )}
    </nav>
  );
}

const HERO_PACKAGE_OPTIONS = [
  PACKAGE_DISPLAY.standard,
  PACKAGE_DISPLAY.zillow_showcase,
  PACKAGE_DISPLAY.luxury,
] as const;

function PackagePickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (packageKey: PackageKey) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center px-4">
      <button
        className="absolute inset-0 bg-[#0f1d2f]/55 backdrop-blur-[2px]"
        aria-label="Close package picker"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[940px] rounded-[22px] bg-white border border-[#d8e2ef] shadow-[0_28px_80px_rgba(15,29,47,0.35)] p-5 sm:p-7">
        <button
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#1F3A5F]/20 flex items-center justify-center text-[#1F3A5F] hover:bg-[#1F3A5F]/5"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <p
          className="text-[#2FA4A9] text-[12px] tracking-[0.16em] uppercase"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
        >
          Choose a Package
        </p>
        <h3
          className="text-[#1F3A5F] text-[30px] sm:text-[38px] mt-2"
          style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.12 }}
        >
          Select what you want to book
        </h3>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {HERO_PACKAGE_OPTIONS.map((pkg) => (
            <button
              key={pkg.key}
              type="button"
              onClick={() => onSelect(pkg.key)}
              className="text-left rounded-[18px] border border-[#d8e2ef] bg-[#f9fbff] p-4 sm:p-5 hover:bg-white hover:shadow-[0_10px_24px_rgba(31,58,95,0.12)] transition-all"
            >
              <p className="text-[#1F3A5F] text-[20px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.2 }}>
                {pkg.name}
              </p>
              <p className="mt-2 text-[#1F3A5F] text-[28px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>
                {pkg.range}
              </p>
              <p className="mt-3 text-[#52607a] text-[14px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}>
                {pkg.subtitle}
              </p>
              <span className="mt-4 inline-flex h-10 px-4 items-center rounded-full bg-[#1F3A5F] text-white text-[13px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                Select package
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroCTAs({
  onBookClick,
  onToggleVideo,
  isVideoPlaying,
}: {
  onBookClick: () => void;
  onToggleVideo: () => void;
  isVideoPlaying: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 sm:mt-8 w-full">
      <button type="button" onClick={onBookClick} className="relative rounded-[999px] bg-white p-[3px] w-full sm:w-auto">
        <div className="bg-[#597eb1] rounded-[999px] px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-3 hover:bg-[#4a6d9e] transition-colors">
          <span className="text-white text-[14px] sm:text-[18px] font-medium tracking-wide">
            BOOK YOUR SHOOT
          </span>
          <ArrowRight className="text-white" size={20} />
        </div>
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleVideo}
          className="bg-white/25 backdrop-blur-md border border-white/30 rounded-full w-[52px] h-[52px] sm:w-[68px] sm:h-[68px] flex items-center justify-center hover:bg-white/35 transition-colors shrink-0"
          aria-label={isVideoPlaying ? "Pause hero video" : "Play hero video"}
        >
          {isVideoPlaying ? (
            <Pause className="text-white" size={20} />
          ) : (
            <Play className="text-white ml-0.5" size={20} />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/portfolio";
          }}
          className="text-[#F4F6F7] text-[17px] sm:text-[20px] underline underline-offset-4 decoration-white/75 hover:text-white hover:decoration-white transition-colors"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
        >
          See Our Work
        </button>
      </div>
    </div>
  );
}

function HeroLocationBadge() {
  return (
    <a
      href={GOOGLE_BUSINESS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 sm:gap-2.5 w-fit rounded-full border border-white/35 bg-white/15 backdrop-blur-md px-4 py-2.5 hover:bg-white/22 transition-colors"
      aria-label="Open Homegrown Visuals on Google Maps"
    >
      <MapPin size={16} className="text-[#F4F6F7]" />
      <span className="text-[#F4F6F7] text-[14px] sm:text-[15px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
        Pensacola, FL
      </span>
      <span className="text-white/50">•</span>
      <span className="text-[#F4F6F7]/90 text-[13px] sm:text-[14px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}>
        Google Reviews
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path fill="#f9f9f9" d="M22 8.5c0 1.37-1.12 2.5-2.5 2.5S17 9.87 17 8.5c0 1.37-1.12 2.5-2.5 2.5S12 9.87 12 8.5c0 1.37-1.12 2.5-2.5 2.5S7 9.87 7 8.5C7 9.87 5.88 11 4.5 11S2 9.87 2 8.5l1.39-5.42S3.68 2 4.7 2h14.6c1.02 0 1.31 1.08 1.31 1.08zm-1 3.7V20c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-7.8a3.96 3.96 0 0 0 4-.58c.69.55 1.56.88 2.5.88c.95 0 1.82-.33 2.5-.88c.69.55 1.56.88 2.5.88c.95 0 1.82-.33 2.5-.88c.68.55 1.56.88 2.5.88c.53 0 1.04-.11 1.5-.3m-2 5.13c0-.2 0-.41-.05-.63l-.03-.16h-2.97v1.17h1.81c-.06.22-.14.44-.31.62c-.33.33-.78.51-1.26.51c-.5 0-.99-.21-1.35-.56c-.69-.71-.69-1.86.02-2.58c.69-.7 1.83-.7 2.55-.03l.14.13l.84-.85l-.16-.14c-.56-.52-1.3-.81-2.08-.81h-.01c-.81 0-1.57.31-2.14.87c-.59.58-.92 1.34-.92 2.13c0 .8.31 1.54.88 2.09a3.2 3.2 0 0 0 2.22.91h.02c.8 0 1.51-.29 2.03-.8c.47-.48.77-1.2.77-1.87"/>
      </svg>
      <ExternalLink size={14} className="text-[#F4F6F7]/85" />
    </a>
  );
}

export function HeroSection() {
  const [showPackagePicker, setShowPackagePicker] = useState(false);
  const [activePackage, setActivePackage] = useState<PackageKey | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleHeroVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsVideoPlaying(true);
      return;
    }
    video.pause();
    setIsVideoPlaying(false);
  };

  return (
    <div className="bg-[#FFFFFF] px-1 sm:px-1 pt-1 sm:pt-1">
      <section
        id="services"
        className="relative w-full min-h-[calc(100dvh+27px)] sm:min-h-[calc(100svh-25px)] md:min-h-[860px] lg:min-h-[calc(100svh-25px)] overflow-hidden rounded-[20px] sm:rounded-[24px]"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
          className="absolute inset-0 w-full h-full object-cover object-[62%_center] sm:object-center"
          style={{ filter: "contrast(1.1) saturate(0.85) brightness(0.95)" }}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b2e]/85 via-[#1F3A5F]/50 to-[#1F3A5F]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2e]/60 via-transparent to-[#0d1b2e]/20" />
        <div className="absolute top-0 left-0 right-0 h-[6%] bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 150px 60px rgba(0,0,0,0.3)" }} />

        <Navbar />

        <div className="relative z-10 flex flex-col justify-end sm:justify-center min-h-[calc(100dvh+27px)] sm:min-h-[calc(100svh-25px)] md:min-h-[860px] lg:min-h-[calc(100svh-25px)] px-4 sm:px-8 md:px-10 lg:px-8 pt-[104px] sm:pt-[120px] md:pt-[138px] lg:pt-[130px] pb-14 sm:pb-12 md:pb-16 max-w-[1394px] mx-auto rounded-[15px]">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8">
            <div className="flex flex-col max-w-full md:max-w-[72%] lg:max-w-[60%] mt-[24px] sm:mt-[18px] translate-y-[10px] sm:translate-y-0">
              <div className="mb-4 sm:hidden">
                <HeroLocationBadge />
              </div>
              <div className="hidden sm:inline-flex mb-4 lg:mb-5">
                <HeroLocationBadge />
              </div>
              <h1
                className="text-[#F4F6F7] max-w-[350px] sm:max-w-[700px] md:max-w-[640px] text-[42px] sm:text-[44px] md:text-[56px] lg:text-[60px]"
                style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em" }}
              >
                <span className="block whitespace-nowrap sm:hidden">You deserve to</span>
                <span className="block whitespace-nowrap sm:hidden">be remembered</span>
                <span className="hidden sm:inline">You deserve to be</span>
                <span className="hidden sm:inline sm:ml-2">remembered</span>
              </h1>
              <p
                className="text-[#F4F6F7] text-[15px] sm:text-[16px] md:text-[18px] max-w-[352px] sm:max-w-[572px] mt-3 sm:mt-4"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.75 }}
              >
                Not just photos and videos. We create media and marketing strategies that generate leads and grow your brand.
              </p>

              <HeroCTAs
                onBookClick={() => {
                  window.location.href = "/services";
                }}
                onToggleVideo={toggleHeroVideo}
                isVideoPlaying={isVideoPlaying}
              />

            </div>
          </div>

          <motion.div
            initial={{ opacity: 0.45, y: 0 }}
            animate={{ opacity: [0.35, 0.8, 0.35], y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-4 sm:bottom-7 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <ChevronDown
              strokeWidth={2.4}
              className="text-white/90 h-[34px] w-[34px] sm:h-[48px] sm:w-[48px]"
            />
          </motion.div>
        </div>
      </section>

      <PackagePickerModal
        open={showPackagePicker}
        onClose={() => setShowPackagePicker(false)}
        onSelect={(packageKey) => {
          setShowPackagePicker(false);
          setActivePackage(packageKey);
        }}
      />

      <BookingIntentModal
        packageKey={activePackage}
        onClose={() => setActivePackage(null)}
      />
    </div>
  );
}
