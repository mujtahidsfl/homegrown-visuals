import { useState } from "react";
import { MessageCircleMore, Plus, Minus } from "lucide-react";

const faqItems = [
  {
    q: "How quickly do you deliver the final media?",
    a: "Most standard photo projects are delivered within 24 hours. Video and larger media sets are delivered on a fast, pre-confirmed timeline.",
  },
  {
    q: "Do you offer drone photos and virtual twilight?",
    a: "Yes. We offer drone media, virtual twilight edits, Zillow Showcase, and multiple add-ons based on your selected package.",
  },
  {
    q: "Can I customize what is included in my package?",
    a: "Absolutely. Every package can be customized with add-ons so you can match your listing goals and marketing strategy.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve the Gulf Coast from Orange Beach, AL to Navarre, FL.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="faq"
      className="px-4 sm:px-8 py-24 sm:py-30"
      style={{
        background: "linear-gradient(180deg, #eaf5ff 0%, #edf1ec 58%, #e5e9e2 100%)",
      }}
    >
      <div className="max-w-[1394px] mx-auto grid lg:grid-cols-[0.55fr_1fr] gap-10 lg:gap-16">
        <div>
          <h2
            className="text-[#202620] text-[44px] sm:text-[58px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, lineHeight: 1.08 }}
          >
            Frequently asked questions
          </h2>
          <div className="h-px bg-[#d8d8d3] mt-8 mb-8" />
          <p
            className="text-[#3a423b] text-[17px] sm:text-[19px] max-w-[420px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}
          >
            Can't find the answer you're looking for? We're here to help.
          </p>
          <button
            className="mt-7 h-[58px] px-7 rounded-full bg-[#25271f] text-white inline-flex items-center gap-3 hover:bg-[#1f211a] transition-colors"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
          >
            Get in touch <MessageCircleMore size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={item.q}
                className="bg-[#f8f8f5] border border-[#e3e3dc] rounded-[28px] p-5 sm:p-7"
              >
                <button
                  className="w-full flex items-start justify-between gap-4 text-left"
                  onClick={() => setOpen(isOpen ? -1 : idx)}
                >
                  <p
                    className="text-[#2a2f2a] text-[18px] sm:text-[22px]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.35 }}
                  >
                    {item.q}
                  </p>
                  <span className="w-10 h-10 rounded-full bg-[#efefe9] flex items-center justify-center text-[#788175] shrink-0">
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </button>
                {isOpen && (
                  <p
                    className="text-[#545c54] text-[16px] sm:text-[18px] mt-4 max-w-[96%]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.6 }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
