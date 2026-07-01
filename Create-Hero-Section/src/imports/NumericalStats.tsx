function Numbers() {
  return (
    <div className="absolute contents font-['Neue_Montreal:Bold',sans-serif] left-[142px] text-[#f4f6f7] text-[32px] top-[46px]" data-name="NUMBERS">
      <p className="absolute left-[142px] top-[46px]">1000+</p>
      <p className="absolute left-[495px] top-[46px]">500+</p>
      <p className="absolute left-[834px] top-[46px]">60 MIN</p>
      <p className="absolute left-[1198px] top-[46px]">24 HRS</p>
    </div>
  );
}

function Tags() {
  return (
    <div className="absolute contents font-['Neue_Montreal:Regular',sans-serif] left-[81px] text-[#e5e5e5] text-[20px] top-[84px]" data-name="TAGS">
      <p className="absolute left-[81px] top-[84px]">Properties Photographed</p>
      <p className="absolute left-[463px] top-[84px]">Videos Delivered</p>
      <p className="absolute left-[800px] top-[84px]">Average Shoot Time</p>
      <p className="absolute left-[1176px] top-[84px]">Photo Turnaround</p>
    </div>
  );
}

function AnimatedNumerals() {
  return (
    <div className="absolute contents leading-[normal] left-[81px] not-italic top-[46px] whitespace-nowrap" data-name="ANIMATED NUMERALS">
      <Numbers />
      <Tags />
    </div>
  );
}

export default function NumericalStats() {
  return (
    <div className="bg-[#36475e] relative size-full" data-name="NUMERICAL STATS">
      <AnimatedNumerals />
    </div>
  );
}