import { useEffect, useState, type ReactNode } from "react";
import { MessageCircleMore, Plus, Minus } from "lucide-react";
import { Link, useLocation } from "react-router";

type FAQItem = {
  q: string;
  a: ReactNode;
};

type FAQCategory = {
  title: string;
  items: FAQItem[];
};

export function slugifyFaqQuestion(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BOOKING_LINK = "/services";
const CONTACT_LINK = "/about";
const SOCIAL_MEDIA_BOOKING_LINK = "/services?service=social-media";

export const faqItems = [
  {
    q: "What areas do you service?",
    a: "We are based in Pensacola, FL but have team members up and down the coast so we can provide service from Orange Beach, AL to Destin, FL.",
  },
  {
    q: "How do I book?",
    a: "You should book directly in our online booking system on the Services page.",
  },
  {
    q: "How should I prepare for my shoots?",
    a: "We send you a checklist before every photoshoot, videoshoot, or social media service so we can align on your vision and prepare properly.",
  },
  {
    q: "How do I pay for my order?",
    a: "We send an invoice to your email when we deliver your media.",
  },
  {
    q: "When should I expect delivery?",
    a: "Photography and 3D are typically next-day. Basic walkthroughs are next-day, cinematic videos are 3-4 days, and luxury agent reels are 3-5 days.",
  },
];

export const faqSearchEntries = [
  {
    category: "General Questions",
    q: "What areas do you service?",
    a: "We are based in Pensacola, FL and serve areas from Orange Beach, AL to Destin, FL.",
  },
  {
    category: "General Questions",
    q: "How do I book?",
    a: "Book directly through the online booking system on the Services page.",
  },
  {
    category: "General Questions",
    q: "How should I prepare for my shoots?",
    a: "We send a checklist before every shoot so you know how to prepare the property or yourself.",
  },
  {
    category: "General Questions",
    q: "How do I pay for my order?",
    a: "An invoice is sent to your email when your media is delivered.",
  },
  {
    category: "General Questions",
    q: "What is your reschedule or cancellation policy?",
    a: "Weather-related reschedules do not carry a fee. Reschedules within 24 hours or unprepared properties may incur a $75 fee.",
  },
  {
    category: "General Questions",
    q: "What weather conditions would you recommend a reschedule for?",
    a: "We may recommend rescheduling for thunderstorms, heavy rain, flooding, strong winds, or fog that reduces visibility.",
  },
  {
    category: "Photos",
    q: "What photography services do you provide?",
    a: "We photograph residential and commercial listings, vacant land, and architecture and design.",
  },
  {
    category: "Photos",
    q: "Do you provide 3D and drone services?",
    a: "Yes. We provide Zillow 3D, Matterport 3D, and FAA Part 107 licensed drone photography.",
  },
  {
    category: "Photos",
    q: "What editing services do you provide?",
    a: "We provide sky replacements, grass enhancement, object removal, virtual staging, and more.",
  },
  {
    category: "Photos",
    q: "How far in advance should I book photo services?",
    a: "Typically at least 48 hours in advance, although we try to accommodate sooner requests when possible.",
  },
  {
    category: "Photos",
    q: "When should I expect delivery for photography and 3D services?",
    a: "Photography and 3D media are delivered the next day.",
  },
  {
    category: "Video",
    q: "What videography services do you provide?",
    a: "We provide continuous walkthroughs, cinematic walkthroughs, and luxury agent reels.",
  },
  {
    category: "Video",
    q: "How far in advance should I book video services?",
    a: "Typically at least 4 days in advance, though we may be able to accommodate sooner requests.",
  },
  {
    category: "Video",
    q: "How long does a typical shoot take?",
    a: "Basic walkthroughs take about 15 to 20 minutes, cinematic walkthroughs about an hour to an hour and a half, and luxury agent reels about two hours.",
  },
  {
    category: "Video",
    q: "When should I expect video delivery?",
    a: "Basic walkthroughs are next day, cinematic videos are delivered in 3 to 4 days, and luxury agent reels in 3 to 5 days.",
  },
  {
    category: "Video",
    q: "What if I'm uncomfortable on camera?",
    a: "We provide on-set coaching to help you feel natural and confident on camera.",
  },
  {
    category: "Social Media Marketing",
    q: "What social media marketing services do you provide?",
    a: "We provide social media ads, shorts, skits, podcast-style videos, social media management, and ad management.",
  },
  {
    category: "Social Media Marketing",
    q: "Do you only work with real estate businesses?",
    a: "No. We also work with homebuilders, contractors, insurance companies, organizations, and local businesses.",
  },
  {
    category: "Social Media Marketing",
    q: "What do social media marketing services cost?",
    a: "Pricing is handled case by case because each client has unique needs and scope.",
  },
  {
    category: "Social Media Marketing",
    q: "How can I book social media marketing services?",
    a: "Call, email, or fill out the contact form on the site to receive a custom quote.",
  },
].map((entry) => ({ ...entry, slug: slugifyFaqQuestion(entry.q) }));

const faqCategories: FAQCategory[] = [
  {
    title: "General Questions",
    items: [
      {
        q: "What areas do you service?",
        a: "We are based in Pensacola, FL but have team members up and down the coast so we can provide service from Orange Beach, AL to Destin, FL.",
      },
      {
        q: "How do I book?",
        a: (
          <>
            You should book directly in our online booking system{" "}
            <Link to={BOOKING_LINK} className="text-[#1F3A5F] underline underline-offset-4 hover:opacity-80">
              here
            </Link>
            .
          </>
        ),
      },
      {
        q: "How should I prepare for my shoots?",
        a: "We will always send you a checklist on how to prep whether it's a photoshoot, videoshoot, or social media service. This is to get an idea of your vision, what you want to highlight, and to help you fully prepare a property or yourself for a shoot.",
      },
      {
        q: "How do I pay for my order?",
        a: "We will send an invoice to your email when we deliver media.",
      },
      {
        q: "What is your reschedule/cancellation policy?",
        a: "For any inclement weather related reschedules/cancellations we don't charge a fee and will find the closest date/time to reschedule with you. If you reschedule up to 24 hours of your appointment we don't charge a fee. If you reschedule or cancel within 24 hours or if we arrive and the home or you are not prepared for the shoot then we will charge a $75 cancellation/reschedule fee.",
      },
      {
        q: "What kind of weather conditions would you recommend a reschedule for?",
        a: (
          <>
            <p>We may recommend rescheduling for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Thunderstorms or lightning</li>
              <li>Heavy rain or flooding</li>
              <li>Strong winds that affect drone usage or outdoor staging</li>
              <li>Fog that significantly reduces visibility</li>
            </ul>
            <p className="mt-3">
              Cloudy or overcast skies are not typically cause for rescheduling, as we offer free sky replacements with every shoot. In fact, overcast skies can often create a better shooting environment by diffusing light naturally, what we call Nature&apos;s Softbox, which helps eliminate harsh shadows and creates a more balanced, professional look.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: "Photos",
    items: [
      {
        q: "What photography services do you provide?",
        a: "We offer photography services for residential and commercial listings, vacant land, and architecture and design.",
      },
      {
        q: "Do you provide 3D and drone services?",
        a: "Yes we provide Zillow 3D and Matterport 3D walkthroughs. We do provide drone photography as well and each of our photographers are FAA-Part 107 Licensed.",
      },
      {
        q: "What editing services do you provide?",
        a: "Sky replacements, grass replacement or enhancement, object removal, virtual staging, and more.",
      },
      {
        q: "How far in advance should I book?",
        a: (
          <>
            Typically you should book at least 48 hours in advance to ensure availability, but if you need coverage sooner please contact us directly and we will try our best to accommodate you. Book{" "}
            <Link to={BOOKING_LINK} className="text-[#1F3A5F] underline underline-offset-4 hover:opacity-80">
              here
            </Link>
            .
          </>
        ),
      },
      {
        q: "When should I expect delivery for photography and 3D services?",
        a: "We deliver all photography and 3D media the next day.",
      },
      {
        q: "Do I need to be present during a shoot?",
        a: "No, for real estate photos or 3D you don't need to be there.",
      },
    ],
  },
  {
    title: "Video",
    items: [
      {
        q: "What videography services do you provide?",
        a: "We provide video services from basic continuous walkthroughs, to cinematic walkthroughs, to luxury agent reels.",
      },
      {
        q: "How far in advance should I book?",
        a: (
          <>
            Typically you should book at least 4 days in advance to ensure availability, but if you need coverage sooner please contact us directly and we will try our best to accommodate you. Book{" "}
            <Link to={BOOKING_LINK} className="text-[#1F3A5F] underline underline-offset-4 hover:opacity-80">
              here
            </Link>
            .
          </>
        ),
      },
      {
        q: "How long does a typical shoot take?",
        a: "Basic continuous walkthroughs we only need about 15 to 20 minutes, cinematic walkthroughs about an hour to an hour and a half, luxury agent reels about two hours.",
      },
      {
        q: "When should I expect delivery?",
        a: "A basic walkthrough will be delivered next day, cinematic walkthroughs will be delivered in 3 to 4 days, luxury agent reels in 3 to 5 days.",
      },
      {
        q: "For an agent reel, how long will I need to be there?",
        a: "About 30 to 45 minutes. We'll do the heavy lifting of creating a script, shot list, and everything else so don't worry about that.",
      },
      {
        q: "What if I'm uncomfortable on camera?",
        a: "We provide professional on-set coaching that makes even first-timers look like seasoned pros. Our process is designed to help you feel confident and natural on camera.",
      },
      {
        q: "What makes your videos different?",
        a: "Our whole team is trained on how to not only market the best features of a property but also you and your brand. Every video we create builds your personal brand and doesn't just market the listing.",
      },
    ],
  },
  {
    title: "Social Media Marketing",
    items: [
      {
        q: "What social media marketing services do you provide?",
        a: "We provide social media ads, social media shorts and skits, podcast style videos, and even social media management or social media ad management.",
      },
      {
        q: "Do you provide these services to just real estate businesses?",
        a: "While we did start with real estate brokerages, we have produced social media ads and managed pages for homebuilders, contractors, insurance companies, local organizations, and small local businesses as well.",
      },
      {
        q: "What do these services cost?",
        a: "These services we treat on a case by case basis because each client has different needs. We have provided social media management and social media ads to large businesses covering multiple states, real estate brokerages, small local businesses, and even to individual real estate agents. Each is a unique situation.",
      },
      {
        q: "How can I book these services?",
        a: (
          <>
            Simply call, email, or fill out a contact form{" "}
            <Link to={SOCIAL_MEDIA_BOOKING_LINK} className="text-[#1F3A5F] underline underline-offset-4 hover:opacity-80">
              here
            </Link>
            , and we will create a quote for you.
          </>
        ),
      },
    ],
  },
];

export function FAQSection() {
  const location = useLocation();
  const [openCategory, setOpenCategory] = useState(0);
  const [openQuestion, setOpenQuestion] = useState<Record<number, number>>({ 0: 0 });

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    setOpenQuestion((prev) => ({
      ...prev,
      [categoryIndex]: prev[categoryIndex] === questionIndex ? -1 : questionIndex,
    }));
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const faqSlug = searchParams.get("faq");
    if (!faqSlug) return;

    const match = faqCategories
      .flatMap((category, categoryIndex) =>
        category.items.map((item, questionIndex) => ({
          categoryIndex,
          questionIndex,
          slug: slugifyFaqQuestion(item.q),
        })),
      )
      .find((item) => item.slug === faqSlug);

    if (!match) return;

    setOpenCategory(match.categoryIndex);
    setOpenQuestion((prev) => ({ ...prev, [match.categoryIndex]: match.questionIndex }));

    window.setTimeout(() => {
      document.getElementById(`faq-${faqSlug}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
  }, [location.search]);

  return (
    <section
      id="faq"
      className="px-4 sm:px-8 py-24 sm:py-30"
      style={{
        backgroundColor: "#FFFFFF",
      }}
    >
      <div className="max-w-[1394px] mx-auto grid lg:grid-cols-[0.55fr_1fr] gap-10 lg:gap-16">
        <div>
          <h2
            className="text-[#202620] text-[44px] sm:text-[58px]"
            style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.08 }}
          >
            Frequently asked questions
          </h2>
          <div className="h-px bg-[#d8d8d3] mt-8 mb-8" />
          <p
            className="text-[#3a423b] text-[17px] sm:text-[19px] max-w-[420px]"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}
          >
            Find answers by service type, from general booking details to photos, video, and social media marketing.
          </p>
          <Link
            to={CONTACT_LINK}
            className="mt-7 h-[58px] px-7 rounded-full bg-[#25271f] text-white inline-flex items-center gap-3 hover:bg-[#1f211a] transition-colors"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
          >
            Get in touch <MessageCircleMore size={20} />
          </Link>
        </div>

        <div className="space-y-4">
          {faqCategories.map((category, categoryIndex) => {
            const isCategoryOpen = openCategory === categoryIndex;
            return (
              <div
                key={category.title}
                className="bg-[#f8f8f5] border border-[#e3e3dc] rounded-[28px] p-5 sm:p-7"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 text-left"
                  onClick={() => setOpenCategory(isCategoryOpen ? -1 : categoryIndex)}
                >
                  <p
                    className="text-[#1F3A5F] text-[20px] sm:text-[24px]"
                    style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {category.title}
                  </p>
                  <span className="w-10 h-10 rounded-full bg-[#efefe9] flex items-center justify-center text-[#788175] shrink-0">
                    {isCategoryOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </button>

                {isCategoryOpen && (
                  <div className="mt-5 space-y-3">
                    {category.items.map((item, questionIndex) => {
                      const isQuestionOpen = openQuestion[categoryIndex] === questionIndex;
                      return (
                        <div
                          key={item.q}
                          id={`faq-${slugifyFaqQuestion(item.q)}`}
                          className="rounded-[18px] border border-[#e1e6de] bg-white px-4 sm:px-5 py-4"
                        >
                          <button
                            className="w-full flex items-start justify-between gap-4 text-left"
                            onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          >
                            <p
                              className="text-[#2a2f2a] text-[16px] sm:text-[19px]"
                              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700, lineHeight: 1.35 }}
                            >
                              {item.q}
                            </p>
                            <span className="w-8 h-8 rounded-full bg-[#f2f5ef] flex items-center justify-center text-[#788175] shrink-0 mt-0.5">
                              {isQuestionOpen ? <Minus size={16} /> : <Plus size={16} />}
                            </span>
                          </button>
                          {isQuestionOpen && (
                            <div
                              className="text-[#545c54] text-[15px] sm:text-[17px] mt-3 leading-[1.65]"
                              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                            >
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
