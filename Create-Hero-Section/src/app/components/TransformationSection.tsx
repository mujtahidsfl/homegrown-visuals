import { useState } from "react";
import { Check } from "lucide-react";
import { PACKAGE_DISPLAY, type PackageKey } from "../booking/config";
import { BookingIntentModal } from "./booking/BookingIntentModal";

const cards = [
  PACKAGE_DISPLAY.standard,
  PACKAGE_DISPLAY.zillow_showcase,
  PACKAGE_DISPLAY.luxury,
] as const;

export function TransformationSection() {
  const [activePackage, setActivePackage] = useState<PackageKey | null>(null);

  return (
    <section
      id="pricing"
      className="px-2 sm:px-4 py-18 sm:py-24 bg-[#eaf5ff]"
    >
      <div
        className="max-w-[1620px] mx-auto rounded-[24px] px-4 sm:px-8 py-12 sm:py-14 border border-white/80"
        style={{
          backgroundColor: "#eaf5ff",
          backgroundImage: "radial-gradient(#c4dced 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <div className="text-center mb-10 sm:mb-12">
          <p
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#1F3A5F]/10 text-[#1F3A5F] text-[12px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
          >
            Pricing
          </p>
          <h2
            className="text-[#1F2D5A] text-[34px] sm:text-[50px] mt-5"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            Capture Every Angle.
          </h2>
          <p
            className="text-[#46506b] text-[16px] sm:text-[18px] max-w-[760px] mx-auto mt-4"
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 400,
              lineHeight: 1.65,
            }}
          >
            Professional listing photos, drone shots, virtual twilights, and
            more delivered within 24 hours. Choose the package that fits your
            listing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {cards.map((pkg) => (
            <article
              key={pkg.key}
              className="rounded-[24px] border p-6 sm:p-7 flex flex-col min-h-0 lg:min-h-[540px] bg-white border-[#e4e6ef] shadow-[0_4px_16px_rgba(31,58,95,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <p
                  className="text-[28px] sm:text-[32px] text-[#3a4257]"
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {pkg.name}
                </p>
                {pkg.key === "zillow_showcase" && (
                  <span
                    className="px-4 py-1.5 rounded-full bg-[#1F2D5A] text-white text-[13px] whitespace-nowrap"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                  >
                    Most Popular
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end gap-2">
                <p
                  className="text-[32px] sm:text-[36px] text-[#1F2D5A]"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {pkg.range}
                </p>
                <p
                  className="text-[15px] sm:text-[16px] mb-1.5 text-[#4a5269]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                >
                  /range
                </p>
              </div>

              <p
                className="mt-4 text-[15px] sm:text-[16px] text-[#525b71]"
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontWeight: 400,
                  lineHeight: 1.55,
                }}
              >
                {pkg.subtitle}
              </p>

              <button
                type="button"
                onClick={() => setActivePackage(pkg.key)}
                className={`mt-6 h-12 rounded-full border flex items-center justify-center text-[14px] transition-colors ${
                  pkg.key === "zillow_showcase"
                    ? "bg-[#1F2D5A] text-white border-[#1F2D5A] hover:bg-[#162249]"
                    : "bg-white text-[#424b62] border-[#e4e6ef] hover:bg-[#f7f8fc]"
                }`}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Book this package
              </button>

              <div className="mt-7 pt-6 border-t border-[#e4e6ef]">
                <p
                  className="text-[16px] text-[#3f4760]"
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Package includes
                </p>
                <div className="mt-4 space-y-3">
                  {pkg.includes.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <Check size={16} className="text-[#2f3f66] mt-1" />
                      <span
                        className="text-[14px] text-[#4b556c]"
                        style={{
                          fontFamily: "'Satoshi', sans-serif",
                          fontWeight: 500,
                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-9">
          <p
            className="text-[#555f76] text-[16px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
          >
            Read more about each plan's features
          </p>
          <button
            className="mt-4 h-11 px-7 rounded-full bg-[#1F2D5A] text-white text-[14px] hover:bg-[#17254d] transition-colors"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
          >
            Compare plans
          </button>
        </div>
      </div>

      <BookingIntentModal
        packageKey={activePackage}
        onClose={() => setActivePackage(null)}
      />
    </section>
  );
}
