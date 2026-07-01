import { ArrowUpRight, Camera, Instagram, Facebook, Linkedin, Send } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-black text-white px-4 sm:px-8 pt-14 sm:pt-18 pb-8">
      <div className="max-w-[1394px] mx-auto">
        <div className="rounded-[24px] border border-white/10 p-8 sm:p-12 bg-[radial-gradient(circle_at_10%_0%,rgba(30,43,67,0.45),rgba(0,0,0,0.95)_45%)]">
          <h2
            className="text-[44px] sm:text-[78px] max-w-[760px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, lineHeight: 1.02 }}
          >
            Listings and Marketing. Connected.
          </h2>
          <p
            className="text-white/60 text-[17px] sm:text-[20px] max-w-[760px] mt-5"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.55 }}
          >
            Homegrown Visuals helps agents book more showings with premium real estate photos, video, and social-first content across the Gulf Coast.
          </p>

          <div className="mt-7 max-w-[620px] h-[60px] rounded-full border border-white/15 bg-white/6 p-1.5 flex items-center gap-2">
            <input
              placeholder="Enter your email..."
              className="flex-1 bg-transparent outline-none px-4 text-[16px] text-white placeholder:text-white/40"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
            />
            <button
              className="h-full px-6 rounded-full bg-white text-black hover:bg-[#e8edf5] transition-colors inline-flex items-center gap-2"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
            >
              Book a Demo <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-3">
                <span className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center">
                  <Camera size={20} />
                </span>
                <span className="text-[30px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                  Homegrown Visuals
                </span>
              </div>
              <p className="text-white/60 text-[16px] mt-5 max-w-[360px]">
                Trusted by agents and brokerages from Orange Beach to Navarre.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"><Instagram size={17} /></a>
                <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"><Facebook size={17} /></a>
                <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"><Linkedin size={17} /></a>
                <a className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"><Send size={17} /></a>
              </div>
            </div>

            <div>
              <p className="text-white text-[18px] mb-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Solutions</p>
              <ul className="space-y-2 text-white/65 text-[16px]">
                <li>For Realtors</li>
                <li>For Brokerages</li>
                <li>For Builders</li>
              </ul>
            </div>
            <div>
              <p className="text-white text-[18px] mb-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Company</p>
              <ul className="space-y-2 text-white/65 text-[16px]">
                <li>About us</li>
                <li>Portfolio</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <p className="text-white text-[18px] mb-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Resources</p>
              <ul className="space-y-2 text-white/65 text-[16px]">
                <li>FAQs</li>
                <li>Pricing</li>
                <li>Book now</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-white/50 text-[14px]">
            <p>© Copyright 2026 Homegrown Visuals. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>SOC 2 Inspired Workflows</span>
              <span>HIPAA Aware Handling</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

