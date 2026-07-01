import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Highly recommend Homegrown Visuals! They have done several photos/videos/drone/video walkthroughs/floor plans for my properties & listings and it’s been excellent every time! Looking forward to continue working together for future listings & Airbnbs as well.",
    author: "Dustin S.",
    role: "Realtor and Vacation Rental Investor",
  },
  {
    quote:
      "They take the time to really understand your goals and put together a thoughtful, strategic approach to help you achieve them. Their work is professional, creative, and intentional. If you’re considering working with Homegrown, get on their calendar while you can—these guys have a very bright future ahead.",
    author: "Jon S.",
    role: "Team Leader and Realtor",
  },
  {
    quote:
      "Dean is great to work with, he is extremely patient, has great ideas to feed off of and makes me comfortable being on video. Highly recommend for those looking to create marketing videos that will stand out",
    author: "Sara D.",
    role: "Top Producing Realtor and Rental Investor",
  },
];

const GOOGLE_REVIEWS_URL = "https://share.google/eJCNlOUVCQ4kqiHkf";
const FACEBOOK_REVIEWS_URL = "https://www.facebook.com/profile.php?id=61571518889534&sk=reviews";

export function ClientTestimonialsSection() {
  return (
    <section className="bg-[#FFFFFF] py-14 sm:py-20 px-4 sm:px-8">
      <div className="max-w-[1394px] mx-auto">
        <p
          className="text-center text-[#C79D52] text-[12px] sm:text-[13px] tracking-[0.18em] uppercase"
          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
        >
          What Clients Say
        </p>

        <h2
          className="text-center text-[#1F2D5A] text-[36px] sm:text-[52px] mt-4"
          style={{
            fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
            fontWeight: 600,
            lineHeight: 1.08,
          }}
        >
          Trusted by Top Agents
        </h2>

        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-full border border-[#d6dceb] text-[#1F2D5A] hover:bg-[#f3f7ff] transition-colors inline-flex items-center"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
          >
            Google Reviews
          </a>
          <a
            href={FACEBOOK_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-full border border-[#d6dceb] text-[#1F2D5A] hover:bg-[#f3f7ff] transition-colors inline-flex items-center"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
          >
            Facebook Reviews
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((item) => (
            <article
              key={item.author}
              className="rounded-[22px] border border-[#e3e8f2] bg-white p-6 sm:p-8 shadow-[0_5px_14px_rgba(20,35,65,0.08)] min-h-[360px] flex flex-col"
            >
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={20} className="text-[#D8A244]" fill="#D8A244" />
                ))}
              </div>

              <p
                className="mt-6 text-[#5E687E] text-[20px] leading-[1.7] flex-1"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              >
                "{item.quote}"
              </p>

              <div className="mt-6">
                <p
                  className="text-[#1F2D5A] text-[34px]"
                  style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.1 }}
                >
                  {item.author}
                </p>
                <p
                  className="text-[#8089A0] text-[16px] mt-2"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                >
                  {item.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
