import { Play, ChevronRight, MoreVertical } from "lucide-react";
import svgPaths from "../../imports/svg-3p0pq6vdk0";

function VimeoIcon() {
  return (
    <svg width="20" height="17" viewBox="0 0 20.01 17.34" fill="none">
      <path d={svgPaths.p6798180} fill="white" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="52" height="38" viewBox="0 0 52.25 38.5" fill="none">
      <path d={svgPaths.p1390b780} fill="#919191" />
      <path d={svgPaths.p2ed0fc80} fill="#919191" />
    </svg>
  );
}

function UnderlineSVG() {
  return (
    <svg width="371" height="34" viewBox="0 0 371.01 34.0009" fill="none" className="w-[200px] sm:w-[280px] md:w-[371px] h-auto">
      <path
        d={svgPaths.p3b63200}
        stroke="#D2A679"
        strokeLinecap="round"
        strokeWidth="7"
      />
    </svg>
  );
}

interface TestimonialCard {
  id: number;
  name: string;
  role: string;
}

const testimonials: TestimonialCard[] = [
  { id: 1, name: "Sarah Mitchell", role: "RE/MAX Agent, Orange Beach" },
  { id: 2, name: "James Cooper", role: "Coldwell Banker, Destin" },
  { id: 3, name: "Emily Dawson", role: "Keller Williams, Navarre" },
];

function TestimonialCard({ testimonial }: { testimonial: TestimonialCard }) {
  return (
    <div className="bg-white rounded-[15px] flex flex-col overflow-hidden w-full">
      {/* Video thumbnail area */}
      <div className="relative aspect-[402/540] bg-white flex items-center justify-center">
        {/* Dots menu button */}
        <div className="absolute top-3 right-3 bg-[#1F3A5F] rounded-[10px] w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] flex items-center justify-center z-10">
          <MoreVertical size={18} className="text-white" />
        </div>
        {/* Video camera icon placeholder */}
        <div className="opacity-40">
          <VideoIcon />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center gap-2 px-3 sm:px-4 pb-3 sm:pb-4">
        {/* Play button */}
        <button className="bg-[#1F3A5F] rounded-[10px] w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] flex items-center justify-center shrink-0">
          <Play size={16} className="text-white" fill="white" />
        </button>
        {/* Progress bar area */}
        <div className="bg-[#1F3A5F] rounded-[10px] h-[40px] sm:h-[45px] flex-1 flex items-center px-3 sm:px-4 gap-2 sm:gap-3">
          {/* Progress bar */}
          <div className="flex-1 h-[5px] bg-[#7a7a7a] rounded-full">
            <div className="h-full w-0 bg-white rounded-full" />
          </div>
          {/* Arrow */}
          <ChevronRight size={16} className="text-white shrink-0" />
          {/* Vimeo icon */}
          <div className="shrink-0">
            <VimeoIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientVideoTestimonials() {
  return (
    <section id="testimonials" className="bg-[#FDF8F3] py-12 sm:py-16 md:py-20 px-4 sm:px-8">
      <div className="max-w-[1394px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p
            className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase mb-3"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
          >
            What Our Clients Say
          </p>
          <div className="relative inline-block">
            <h2
              className="text-[#1F3A5F] text-[26px] sm:text-[34px] md:text-[44px]"
              style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.2 }}
            >
              Trusted by Agents Across the Gulf Coast.
            </h2>
            {/* Underline decoration */}
            <div className="flex justify-center mt-[-4px] sm:mt-[-6px]">
              <UnderlineSVG />
            </div>
          </div>
        </div>

        {/* Testimonial cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
