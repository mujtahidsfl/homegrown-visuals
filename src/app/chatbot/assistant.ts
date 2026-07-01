import { KNOWLEDGE_CHUNKS, getKnowledgeContextText } from "./knowledge";

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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
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

function fallbackReply(question: string): AssistantReply {
  const q = question.toLowerCase();

  if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("package")) {
    const pricing = KNOWLEDGE_CHUNKS.find((c) => c.id === "pricing_overview");
    return {
      answer: pricing
        ? pricing.content
        : "Standard: $279-$479. Zillow Showcase: $399-$599. Luxury: $979-$1,179. Final price varies by square footage.",
      actions: [{ label: "Start Booking", href: "/services", kind: "link" }],
      source: "fallback",
    };
  }

  if (q.includes("add-on") || q.includes("addon")) {
    const addons = KNOWLEDGE_CHUNKS.find((c) => c.id === "addons");
    return {
      answer: addons ? addons.content : "Add-ons are available in all packages and selectable during booking.",
      actions: [{ label: "Compare Packages", kind: "ask", prompt: "Compare the three packages." }],
      source: "fallback",
    };
  }

  if (q.includes("book") || q.includes("schedule")) {
    return {
      answer: "You can start booking from the pricing page, choose a package, and complete the booking form in a few steps.",
      actions: [{ label: "Start Booking", href: "/services", kind: "link" }],
      source: "fallback",
    };
  }

  if (q.includes("faq")) {
    return {
      answer: "FAQ topics include delivery timelines, drone/virtual twilight availability, customization options, and service areas.",
      actions: [{ label: "Show service areas", kind: "ask", prompt: "What areas do you serve?" }],
      source: "fallback",
    };
  }

  const ranked = [...KNOWLEDGE_CHUNKS]
    .map((chunk) => ({
      chunk,
      score: scoreChunk(question, `${chunk.title} ${chunk.content}`),
    }))
    .sort((a, b) => b.score - a.score);

  const top = ranked.find((r) => r.score > 0)?.chunk;

  if (!top) {
    return {
      answer: "Ask me about services, packages, pricing, add-ons, FAQs, or booking.",
      actions: [
        { label: "Pricing", kind: "ask", prompt: "Show me pricing." },
        { label: "Start Booking", href: "/services", kind: "link" },
      ],
      source: "fallback",
    };
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
          "Answer only the user's exact question. Be concise. Do not add unrelated details. If asked about pricing, provide pricing directly in-chat.",
        app_name: "Homegrown Visuals Website Assistant",
      }),
    });

    if (!response.ok) throw new Error(`AI endpoint failed: ${response.status}`);
    const data = await response.json();

    if (!data?.answer || typeof data.answer !== "string") {
      throw new Error("Invalid AI response format");
    }

    return {
      answer: String(data.answer).trim(),
      actions: Array.isArray(data.actions) ? data.actions : undefined,
      source: "api",
    };
  } catch {
    return fallbackReply(question);
  }
}
