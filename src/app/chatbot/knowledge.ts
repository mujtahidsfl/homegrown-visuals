import type { ChatAction } from "./assistant";
import { PRICING_SHEET, formatTieredPrices } from "./pricingSheet";

export type KnowledgeChunk = {
  id: string;
  title: string;
  content: string;
  actions?: ChatAction[];
};

export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: "services",
    title: "Services",
    content:
      "We offer real estate photo packages, Zillow Showcase, luxury packages, and ala carte add-ons (drone, videos, walkthroughs, highlight reels, and more). Tell me what you need and the property size (sqft) and I’ll point you to the right option.",
    actions: [
      { label: "Pricing", kind: "ask", prompt: "Show me pricing." },
      { label: "Recommendations", kind: "ask", prompt: "Help me choose a package for a 2,300 sqft home." },
    ],
  },
  {
    id: "pricing_overview",
    title: "Package Pricing",
    content: [
      ...PRICING_SHEET.packages.map(
        (p) => `${p.name} — ${p.description ?? ""} (${p.prices ? formatTieredPrices(p.prices) : "Ask for pricing"})`.trim()
      ),
      "",
      "Ala carte (high level):",
      ...PRICING_SHEET.alaCarte
        .filter((x) => x.prices || x.flatPrice)
        .slice(0, 8)
        .map((x) => (x.prices ? `${x.name}: ${formatTieredPrices(x.prices)}` : `${x.name}: $${x.flatPrice}`)),
      "",
      `${PRICING_SHEET.landPackage.name}: $${PRICING_SHEET.landPackage.flatPrice} — ${PRICING_SHEET.landPackage.description}`,
    ].join("\n"),
    actions: [{ label: "Help me choose", kind: "ask", prompt: "Help me choose a package. My home is 1,900 sqft." }],
  },
  {
    id: "areas",
    title: "Service Areas",
    content:
      "We are based in Pensacola, FL but have team members up and down the coast so we can provide service from Orange Beach, AL to Destin, FL.",
  },
  {
    id: "booking",
    title: "How To Book",
    content: "You should book directly in our online booking system on the Services page.",
  },
  {
    id: "prep",
    title: "How To Prepare",
    content:
      "We send you a checklist before every photoshoot, videoshoot, or social media service so we can align on your vision and prepare properly.",
  },
  {
    id: "payment",
    title: "How Payment Works",
    content: "We send an invoice to your email when we deliver your media.",
  },
  {
    id: "turnaround",
    title: "Delivery Timelines",
    content:
      "Photography and 3D are typically next-day. Basic walkthroughs are next-day, cinematic videos are 3-4 days, and luxury agent reels are 3-5 days.",
  },
  {
    id: "sms_policy",
    title: "SMS and A2P",
    content:
      "SMS consent is optional in booking forms. STOP and HELP instructions are provided. Mobile opt-in/consent data is not shared with third parties for marketing.",
    actions: [{ label: "How does SMS consent work?", kind: "ask", prompt: "Explain SMS consent and STOP/HELP instructions." }],
  },
];

export function getKnowledgeContextText() {
  return KNOWLEDGE_CHUNKS.map((k) => `[${k.title}] ${k.content}`).join("\n\n");
}
