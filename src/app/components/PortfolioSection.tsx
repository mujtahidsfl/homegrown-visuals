import { useState } from "react";
import { MapPin, Tag, Filter, ArrowUpRight } from "lucide-react";

type PortfolioProject = {
  id: string;
  image: string;
  title: string;
  location: string;
  service: string;
  category: string;
  description: string;
};

const architecturalImages = import.meta.glob("../../assets/portfolio/architectural-detail/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const interiorImages = import.meta.glob("../../assets/portfolio/interior/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function fileStem(path: string): string {
  return decodeURIComponent(path.split("/").pop()?.replace(/\.[^/.]+$/, "") ?? "");
}

function sortImageEntries(images: Record<string, string>): Array<[string, string]> {
  return Object.entries(images).sort((a, b) =>
    fileStem(a[0]).localeCompare(fileStem(b[0]), undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

const architecturalProjects: PortfolioProject[] = sortImageEntries(architecturalImages).map(([path, image], index) => ({
  id: `architectural-${fileStem(path)}`,
  image,
  title: `Architectural Detail ${String(index + 1).padStart(2, "0")}`,
  location: "Gulf Coast",
  service: "Architectural/Detail Photos",
  category: "Architectural/Detail Photos",
  description: "Architectural composition highlighting structure, materials, and premium design details.",
}));

const interiorProjects: PortfolioProject[] = sortImageEntries(interiorImages).map(([path, image], index) => ({
  id: `interior-${fileStem(path)}`,
  image,
  title: `Interior Photo ${String(index + 1).padStart(2, "0")}`,
  location: "Gulf Coast",
  service: "Interior Photos",
  category: "Interior Photos",
  description: "Interior photo capturing layout, natural light, and high-impact room presentation.",
}));

const projects: PortfolioProject[] = [...architecturalProjects, ...interiorProjects];

const filters = [
  "All",
  "Exterior Photos",
  "Natural Twilight",
  "Virtual Twilight",
  "Interior Photos",
  "Architectural/Detail Photos",
  "Cinematic Property Videos",
  "Luxury Agent Reels",
  "AI Videos",
];

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
            style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}
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
              key={project.id}
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
                  style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700 }}
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
