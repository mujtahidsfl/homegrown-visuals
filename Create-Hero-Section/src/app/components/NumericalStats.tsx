import { useEffect, useRef, useState } from "react";

const stats = [
  { number: 1000, suffix: "+", label: "Properties Photographed" },
  { number: 500, suffix: "+", label: "Videos Delivered" },
  { number: 60, suffix: " MIN", label: "Average Shoot Time" },
  { number: 24, suffix: " HRS", label: "Photo Turnaround" },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return count;
}

function StatItem({ number, suffix, label }: { number: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(number, 1800, visible);

  return (
    <div ref={ref} className="flex sm:flex-row flex-col items-center sm:items-center gap-0 sm:gap-2 shrink-0">
      <span
        className="text-[#1F3A5F] text-[20px] sm:text-[22px]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
      >
        {count}{suffix}
      </span>
      <span
        className="text-[#1F3A5F]/60 text-[12px] sm:text-[15px]"
        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}

export function NumericalStats() {
  return (
    <section className="bg-[#FAF8F2] w-full py-3 sm:py-4 px-4 sm:px-8">
      <div className="max-w-[1429px] w-full mx-auto bg-[#F2EFE5] rounded-[20px] sm:rounded-[30px] py-6 sm:py-5 px-6 sm:px-10 grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-y-5 gap-x-4 sm:gap-6 place-items-center">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center justify-center gap-2 sm:gap-6 shrink-0">
            <StatItem number={stat.number} suffix={stat.suffix} label={stat.label} />
            {i < stats.length - 1 && (
              <span className="hidden sm:inline text-[#1F3A5F]/30 text-[18px] sm:text-[22px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>+</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
