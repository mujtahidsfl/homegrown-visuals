import { PACKAGE_ADDONS, PACKAGE_DISPLAY, SQFT_TIER_OPTIONS } from "../booking/config";
import { faqItems } from "../components/FAQSection";
import type { ChatAction } from "./assistant";

export type KnowledgeChunk = {
  id: string;
  title: string;
  content: string;
  actions?: ChatAction[];
};

const serviceList = [
  "Real estate photography",
  "Property video tours",
  "Drone and aerial media",
  "Virtual staging",
  "3D tours",
  "Social media content",
];

export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    id: "services",
    title: "Services",
    content: `Homegrown Visuals provides: ${serviceList.join(", ")}.`,
    actions: [{ label: "Tell me about pricing", kind: "ask", prompt: "Show me pricing." }],
  },
  {
    id: "pricing_overview",
    title: "Package Pricing",
    content: `${PACKAGE_DISPLAY.standard.name}: ${PACKAGE_DISPLAY.standard.range}. ${PACKAGE_DISPLAY.zillow_showcase.name}: ${PACKAGE_DISPLAY.zillow_showcase.range}. ${PACKAGE_DISPLAY.luxury.name}: ${PACKAGE_DISPLAY.luxury.range}. Final pricing depends on square footage tier: ${SQFT_TIER_OPTIONS.map((x) => x.label).join(", ")}.`,
    actions: [{ label: "Start Booking", href: "/services", kind: "link" }],
  },
  {
    id: "standard_package",
    title: PACKAGE_DISPLAY.standard.name,
    content: `Includes: ${PACKAGE_DISPLAY.standard.includes.join(", ")}. Subtitle: ${PACKAGE_DISPLAY.standard.subtitle}.`,
    actions: [{ label: "Book Standard", href: "/book/standard", kind: "link" }],
  },
  {
    id: "zillow_package",
    title: PACKAGE_DISPLAY.zillow_showcase.name,
    content: `Includes: ${PACKAGE_DISPLAY.zillow_showcase.includes.join(", ")}. Subtitle: ${PACKAGE_DISPLAY.zillow_showcase.subtitle}.`,
    actions: [{ label: "Book Zillow Showcase", href: "/book/zillow-showcase", kind: "link" }],
  },
  {
    id: "luxury_package",
    title: PACKAGE_DISPLAY.luxury.name,
    content: `Includes: ${PACKAGE_DISPLAY.luxury.includes.join(", ")}. Subtitle: ${PACKAGE_DISPLAY.luxury.subtitle}.`,
    actions: [{ label: "Book Luxury", href: "/book/luxury", kind: "link" }],
  },
  {
    id: "addons",
    title: "Add-ons",
    content: `Add-ons can be selected during booking. Standard package has ${PACKAGE_ADDONS.standard.length} add-on options, Zillow Showcase has ${PACKAGE_ADDONS.zillow_showcase.length}, and Luxury has ${PACKAGE_ADDONS.luxury.length}.`,
    actions: [{ label: "Compare Packages", kind: "ask", prompt: "Compare all three packages." }],
  },
  {
    id: "faq",
    title: "FAQ",
    content: faqItems.map((f) => `${f.q} ${f.a}`).join(" "),
    actions: [{ label: "Service Areas", kind: "ask", prompt: "What areas do you serve?" }],
  },
  {
    id: "areas",
    title: "Service Areas",
    content: "Primary coverage includes Gulf Coast markets from Orange Beach, AL to Navarre, FL.",
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
