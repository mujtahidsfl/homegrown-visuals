import { useState } from "react";
import { MapPin, Tag, Filter, ArrowUpRight } from "lucide-react";
import imgRectangle25 from "../../assets/966c7143b84a2fd1f6e540d7bf2e8592501ff16f.png";
import imgRectangle27 from "../../assets/a99418ba8518254ca2f54f6f1728911ae9527132.png";
import imgRectangle26 from "../../assets/e7961908617500d6b5ca3aab2b698e69dce50c13.png";
import imgRectangle28 from "../../assets/5c8cff31ed10d4cad7d786d2983b561accfb8f81.png";
import imgRectangle29 from "../../assets/a639e95b67aaa5a9beea31ebffd0e5c142d3c03a.png";
import imgRectangle30 from "../../assets/3c10ccba6594e032cf4e797aeb298aca3a147ac2.png";

const projects = [
  {
    image: imgRectangle25,
    title: "Bayshore Estate",
    location: "Orange Beach, AL",
    service: "Photography",
    category: "Photos",
    description: "Full interior & exterior HDR photography for luxury waterfront listing.",
  },
  {
    image: imgRectangle27,
    title: "Sunset Patio Oasis",
    location: "Gulf Shores, AL",
    service: "Photography",
    category: "Photos",
    description: "Twilight shoot highlighting the outdoor entertainment space.",
  },
  {
    image: imgRectangle26,
    title: "Craftsman Cottage",
    location: "Pensacola, FL",
    service: "Video Tour",
    category: "Videos",
    description: "Cinematic walkthrough showcasing charm and curb appeal.",
  },
  {
    image: imgRectangle28,
    title: "Lakefront Retreat",
    location: "Navarre, FL",
    service: "Drone Shots",
    category: "Drone Shots",
    description: "Aerial views capturing the pool, dock, and waterfront setting.",
  },
  {
    image: imgRectangle29,
    title: "Modern Kitchen Reveal",
    location: "Destin, FL",
    service: "Photography",
    category: "Photos",
    description: "Interior photography highlighting a newly renovated gourmet kitchen.",
  },
  {
    image: imgRectangle30,
    title: "Coastal Kitchen Living",
    location: "Perdido Key, FL",
    service: "Video Tour",
    category: "Videos",
    description: "Video tour of an open-concept kitchen with Gulf views.",
  },
];

const filters = ["All", "Photos", "Videos", "Drone Shots"];

export function PortfolioSection() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="work" className="bg-[#F4F6F7] py-20 sm:py-28 px-4 sm:px-8">
      <div className="max-w-[1394px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p
            className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase mb-3"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
          >
            Our Work
          </p>
          <h2
            className="text-[#1F3A5F] text-[32px] sm:text-[40px] md:text-[44px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
          >
            See What We Create.
          </h2>
          <p
            className="text-[#1F3A5F]/70 text-[16px] sm:text-[18px] md:text-[20px] max-w-[700px] mx-auto mt-4"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
          >
            We don't just shoot photos and videos — we create media that generates leads for your listings and grows your brand.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-center mb-10 sm:mb-14">
          <div className="flex items-center bg-[#597eb1] rounded-full p-[6px] gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 sm:px-6 py-3 rounded-full text-[14px] sm:text-[16px] transition-colors ${
                  active === f
                    ? "bg-white text-[#1F3A5F]"
                    : "text-white hover:bg-white/15"
                }`}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              >
                {f}
              </button>
            ))}
            <div className="px-3 py-2 flex items-center rounded-full">
              <Filter size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filtered.map((project) => (
            <div
              key={project.title}
              className="bg-[#f1f5f8] rounded-[24px] sm:rounded-[30px] overflow-hidden group border border-white/80"
              style={{
                boxShadow:
                  "8px 8px 18px rgba(31,58,95,0.08), -6px -6px 16px rgba(255,255,255,0.85), inset 1px 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Image */}
              <div className="p-[6px] sm:p-[7px] pb-0">
                <div className="aspect-[4/3] rounded-[20px] sm:rounded-[26px] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-5 sm:p-6 pt-4">
                <h3
                  className="text-[#1F3A5F] text-[18px] sm:text-[20px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
                >
                  {project.title}
                </h3>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#1F3A5F]/60" />
                    <span
                      className="text-[#1F3A5F]/70 text-[14px] sm:text-[15px]"
                      style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
                    >
                      {project.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag size={14} className="text-[#1F3A5F]/60" />
                    <span
                      className="text-[#1F3A5F]/70 text-[14px] sm:text-[15px]"
                      style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}
                    >
                      {project.service}
                    </span>
                  </div>
                </div>

                <p
                  className="text-[#1F3A5F]/60 text-[14px] sm:text-[15px] mt-3"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
                >
                  {project.description}
                </p>

                {/* See More button */}
                <div className="flex items-center gap-2 mt-4">
                  <div
                    className="w-[32px] h-[32px] rounded-full bg-white flex items-center justify-center"
                    style={{
                      boxShadow:
                        "3px 3px 8px rgba(31,58,95,0.1), -2px -2px 6px rgba(255,255,255,0.9)",
                    }}
                  >
                    <ArrowUpRight size={15} className="text-[#1F3A5F] rotate-45" />
                  </div>
                  <button
                    className="bg-[#1F3A5F] text-white text-[13px] px-5 py-2 rounded-full hover:bg-[#162d4a] transition-colors uppercase tracking-[0.06em]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                  >
                    See More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-14 sm:mt-16">
          <button
            className="bg-[#1F3A5F] text-white text-[13px] sm:text-[14px] px-10 sm:px-14 py-4 rounded-full hover:bg-[#162d4a] transition-colors uppercase tracking-[0.06em]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
          >
            BROWSE ALL CONTENT
          </button>
        </div>
      </div>
    </section>
  );
}
