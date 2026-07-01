import { KNOWLEDGE_CHUNKS, getKnowledgeContextText } from "./knowledge";
import { PRICING_SHEET, type SqftTierKey } from "./pricingSheet";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantReply = {
  answer: string;
  actions?: ChatAction[];
  source: "api" | "fallback";
};

export type ChatAction = {
  label: string;
  href?: string;
  kind?: "ask" | "link" | "consent";
  prompt?: string;
  consentChoice?: "yes" | "no";
};

function tokenize(text: string) {
  const stopWords = new Set([
    "about",
    "anything",
    "can",
    "could",
    "does",
    "for",
    "from",
    "have",
    "how",
    "our",
    "should",
    "that",
    "the",
    "their",
    "there",
    "this",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "with",
    "you",
    "your",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function scoreChunk(query: string, body: string) {
  const q = tokenize(query);
  const b = new Set(tokenize(body));
  let score = 0;
  q.forEach((word) => {
    if (b.has(word)) score += 1;
  });
  return score;
}

function normalizeQuery(query: string) {
  const q = query.toLowerCase();
  return q
    .replace(/\bturn\s*around\b/g, "turnaround")
    .replace(/\bservice\s*area(s)?\b/g, "areas")
    .replace(/\bcoverage\b/g, "areas")
    .replace(/\bwhere do you (serve|service)\b/g, "areas")
    .replace(/\bpay(ment)?\b/g, "payment")
    .replace(/\binvoice\b/g, "payment")
    .replace(/\bprep(aration)?\b/g, "prepare")
    .replace(/\bchecklist\b/g, "prepare")
    .replace(/\bbook(ing)?\b/g, "booking")
    .replace(/\bschedule\b/g, "booking");
}

function looksLikeRecommendationRequest(question: string) {
  const q = question.toLowerCase();
  return /\b(recommend|suggest|help me choose|which package|what package|best package|what should i get)\b/.test(q);
}

function extractSqft(question: string): number | null {
  const lower = question.toLowerCase();
  const m =
    lower.match(/(\d[\d,]{2,})\s*(sq\s*ft|sqft|square\s*feet|square\s*foot)\b/) ??
    lower.match(/\b(property\s*size|home|house|listing)\s*(is|:)?\s*(\d[\d,]{2,})\b/);
  if (!m) return null;
  const rawValue = m[3] ?? m[1];
  const value = Number(rawValue.replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

function looksLikePackageChoiceRequest(question: string) {
  const q = question.toLowerCase();
  const hasSqft = extractSqft(question) !== null;
  const hasPackageTerm =
    /\b(package|zillow|showcase|listing|media|photos?|photo|drone|aerial|video|walkthrough|reel|reels|ai|social|twilight|3d)\b/.test(q);

  return hasSqft && hasPackageTerm;
}

function getSqftTier(sqft: number): SqftTierKey {
  if (sqft < 1500) return "0-1499";
  if (sqft < 2500) return "1500-2499";
  if (sqft < 4000) return "2500-3999";
  if (sqft <= 5500) return "4000-5500";
  return "5500+";
}

function formatSinglePrice(price: number | "QUOTE" | undefined) {
  if (!price) return "Quote";
  return price === "QUOTE" ? "Quote" : `$${price}`;
}

function packageChooserReply(question: string): AssistantReply {
  const sqft = extractSqft(question);
  const q = question.toLowerCase();

  if (!sqft) {
    return {
      answer:
        "I can help choose. What’s the property size in sqft, and do you want just listing media or something more premium for marketing?",
      actions: [
        { label: "2,000 sqft", kind: "ask", prompt: "Help me choose a package for a 2,000 sqft home." },
        { label: "Show packages", kind: "ask", prompt: "Show me the real estate packages." },
      ],
      source: "fallback",
    };
  }

  const tier = getSqftTier(sqft);
  const needsCustomSocialQuote = /\b(ai|social|reel|reels)\b/.test(q);
  const recommendation = q.includes("zillow") || q.includes("showcase")
    ? "Zillow Showcase is the right fit here."
    : "I’d usually point you to the Zillow Showcase Package.";
  const packageLines = PRICING_SHEET.packages.map((pkg) => {
    const price = formatSinglePrice(pkg.prices?.[tier]);
    const popularLabel = pkg.name === "Zillow Showcase Package" ? " - most popular" : "";
    return `${pkg.name}${popularLabel}: ${price}\n${pkg.description}`;
  });

  const addOns = [
    PRICING_SHEET.alaCarte.find((item) => item.name === "Cinematic Video (horizontal 45–60secs)"),
    PRICING_SHEET.alaCarte.find((item) => item.name === "60sec Continuous walkthrough video"),
    PRICING_SHEET.alaCarte.find((item) => item.name === "30sec Highlight Reel"),
    PRICING_SHEET.alaCarte.find((item) => item.name === "6 Drone photos"),
    PRICING_SHEET.alaCarte.find((item) => item.name === "12 Drone photos"),
    PRICING_SHEET.alaCarte.find((item) => item.name === "Luxury Reel 45–60seconds"),
  ]
    .filter(Boolean)
    .map((item) => {
      const price = item?.prices ? formatSinglePrice(item.prices[tier]) : formatSinglePrice(item?.flatPrice);
      return `${item?.name}: ${price}`;
    });

  if (needsCustomSocialQuote) {
    addOns.push("AI reels / social media content: custom quote with Dean or the team");
  }

  return {
    answer: [
      `For a ${sqft.toLocaleString()} sqft home, ${recommendation} It’s the most popular option because it includes listing photos, aerial photos, Zillow Showcase, and 1 virtual twilight.`,
      "",
      "Packages:",
      ...packageLines,
      "",
      "Common add-ons:",
      ...addOns,
    ].join("\n"),
    actions: [
      { label: "Book Zillow", kind: "link", href: "/services?package=zillow_showcase" },
      { label: "Compare packages", kind: "link", href: "/services" },
    ],
    source: "fallback",
  };
}

function pricingOverviewReply(): AssistantReply {
  const packageLines = PRICING_SHEET.packages.map((pkg) => `${pkg.name}: ${pkg.description}`);
  const addOns = [
    "Zillow 3D",
    "Cinematic Video (horizontal 45–60secs)",
    "60sec Continuous walkthrough video",
    "30sec Highlight Reel",
    "6 Drone photos",
    "12 Drone photos",
    "Luxury Reel 45–60seconds",
  ];

  return {
    answer: [
      "Here are the main real estate package options:",
      ...packageLines,
      "",
      "Popular add-ons:",
      ...addOns,
      "",
      "Send the property size in sqft and I’ll point you to the best fit.",
    ].join("\n"),
    actions: [{ label: "Help me choose", kind: "ask", prompt: "Help me choose a package for a 2,000 sqft home." }],
    source: "fallback",
  };
}

function unknownReply(): AssistantReply {
  return {
    answer:
      "I can’t help with that one yet. I can answer questions about Homegrown Visuals services, pricing, booking, prep, service areas, delivery timelines, and SMS consent. For anything outside that, Dean or our team can confirm the right answer.",
    actions: [
      { label: "Connect with team", kind: "link", href: "/services?service=social-media" },
      { label: "Email us", kind: "link", href: "mailto:homegrownventuresllc@gmail.com" },
    ],
    source: "fallback",
  };
}

function looksLikeFaqDump(answer: string) {
  const lower = answer.toLowerCase();
  const categoryMentions = ["general questions", "photos", "video", "social media marketing"].filter((section) =>
    lower.includes(section),
  ).length;
  const questionMarks = (answer.match(/\?/g) ?? []).length;
  const lines = answer.split(/\r?\n/).filter((line) => line.trim().length > 0).length;

  return categoryMentions >= 2 || (questionMarks >= 4 && lines >= 4);
}

function fallbackReply(question: string): AssistantReply {
  const q = normalizeQuery(question);

  const directId =
    q.includes("areas") ? "areas" : q.includes("booking") ? "booking" : q.includes("prepare") ? "prep" : q.includes("payment") ? "payment" : q.includes("turnaround") ? "turnaround" : null;

  if (directId) {
    const chunk = KNOWLEDGE_CHUNKS.find((c) => c.id === directId);
    if (chunk) return { answer: chunk.content, actions: chunk.actions, source: "fallback" };
  }

  if (looksLikeRecommendationRequest(question) || looksLikePackageChoiceRequest(question)) {
    return packageChooserReply(question);
  }

  if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("package")) {
    return pricingOverviewReply();
  }

  const ranked = [...KNOWLEDGE_CHUNKS]
    .map((chunk) => ({
      chunk,
      score: scoreChunk(question, `${chunk.title} ${chunk.content}`),
    }))
    .sort((a, b) => b.score - a.score);

  const topMatch = ranked.find((r) => r.score >= 2);
  const top = topMatch?.chunk;

  if (!top) {
    return unknownReply();
  }

  const actions = (top.actions ?? []).slice(0, 2);
  return {
    answer: `${top.title}: ${top.content}`,
    actions,
    source: "fallback",
  };
}

export async function askWebsiteAssistant(question: string, history: ChatTurn[]): Promise<AssistantReply> {
  const endpoint = import.meta.env.VITE_CHATBOT_API_URL as string | undefined;
  const normalizedQuestion = normalizeQuery(question);

  if (looksLikeRecommendationRequest(question) || looksLikePackageChoiceRequest(question)) {
    return packageChooserReply(question);
  }

  if (
    normalizedQuestion.includes("price") ||
    normalizedQuestion.includes("pricing") ||
    normalizedQuestion.includes("cost") ||
    normalizedQuestion.includes("package")
  ) {
    return pricingOverviewReply();
  }

  if (!endpoint) return fallbackReply(question);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        history,
        website_context: getKnowledgeContextText(),
        response_style:
          "You are HGV Assistant for Homegrown Visuals. Be warm, concise, and professional. Use only the provided knowledge context. Answer only the specific question asked, usually in 1-3 short sentences. Never paste the full FAQ, multiple FAQ sections, or the entire knowledge context. If the question does not clearly match the provided knowledge, say: \"I can’t help with that one yet.\" Then offer to connect them with Dean or the Homegrown Visuals team. Never invent pricing, policy details, or generic recommendations unless the user explicitly asks for a recommendation.",
        app_name: "HGV Assistant",
      }),
    });

    if (!response.ok) throw new Error(`AI endpoint failed: ${response.status}`);
    const data = await response.json();

    if (!data?.answer || typeof data.answer !== "string") {
      throw new Error("Invalid AI response format");
    }

    const answer = String(data.answer).trim();

    if (looksLikeFaqDump(answer)) {
      return unknownReply();
    }

    return {
      answer,
      actions: Array.isArray(data.actions) ? data.actions : undefined,
      source: "api",
    };
  } catch {
    return fallbackReply(question);
  }
}
