import { faqSearchEntries } from "./FAQSection";
import { portfolioProjects } from "./PortfolioSection";

export type SmartSearchResult = {
  id: string;
  type: "faq" | "portfolio" | "page";
  title: string;
  snippet: string;
  href: string;
  badge: string;
  score: number;
};

export const suggestedSearches = [
  "How do I book?",
  "When should I expect delivery?",
  "What areas do you service?",
  "Virtual twilight examples",
  "Natural twilight photos",
  "Interior photos",
  "Architectural detail photos",
  "Luxury agent reels",
  "Social media ads",
  "How long does a typical shoot take?",
];

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function scoreTextMatch(query: string, text: string): number {
  const normalizedQuery = normalize(query);
  const normalizedText = normalize(text);

  if (!normalizedQuery || !normalizedText) return 0;

  let score = 0;
  if (normalizedText.includes(normalizedQuery)) score += 12;

  const tokens = normalizedQuery.split(" ").filter((token) => token.length > 1);
  for (const token of tokens) {
    if (normalizedText.includes(token)) score += 2;
  }

  return score;
}

function dedupeSuggestions(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function getRotatingSuggestions(previous: string[] = [], count = 3): string[] {
  const available = suggestedSearches.filter((item) => !previous.includes(item));
  const source = available.length >= count ? available : suggestedSearches;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return dedupeSuggestions(shuffled).slice(0, count);
}

export function searchSite(query: string): SmartSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const faqResults: SmartSearchResult[] = faqSearchEntries
    .map((entry) => {
      const score =
        scoreTextMatch(normalizedQuery, entry.q) * 2 +
        scoreTextMatch(normalizedQuery, `${entry.category} ${entry.a}`);

      return {
        id: `faq-${entry.slug}`,
        type: "faq" as const,
        title: entry.q,
        snippet: entry.a,
        href: `/?faq=${encodeURIComponent(entry.slug)}#faq`,
        badge: "FAQ",
        score,
      };
    })
    .filter((entry) => entry.score > 0);

  const portfolioResults: SmartSearchResult[] = portfolioProjects
    .map((project) => {
      const searchText = [
        project.title,
        project.category,
        project.service,
        project.description,
        project.hoverTag ?? "",
        project.location,
      ].join(" ");

      const score =
        scoreTextMatch(normalizedQuery, `${project.title} ${project.category}`) * 2 +
        scoreTextMatch(normalizedQuery, searchText);

      return {
        id: `portfolio-${project.id}`,
        type: "portfolio" as const,
        title: project.title,
        snippet: `${project.category} · ${project.description}`,
        href: `/portfolio?category=${encodeURIComponent(project.category)}&highlight=${encodeURIComponent(project.id)}`,
        badge: "Portfolio",
        score,
      };
    })
    .filter((entry) => entry.score > 0);

  const pageResults: SmartSearchResult[] = [
    {
      id: "page-services",
      type: "page",
      title: "Services",
      snippet: "Book real estate, vacant land, and marketing services.",
      href: "/services",
      badge: "Page",
      score: scoreTextMatch(normalizedQuery, "services pricing booking package add-ons"),
    },
    {
      id: "page-portfolio",
      type: "page",
      title: "Portfolio",
      snippet: "Browse photo galleries, reels, twilight work, and ads.",
      href: "/portfolio",
      badge: "Page",
      score: scoreTextMatch(normalizedQuery, "portfolio work gallery reels photos twilight interior exterior"),
    },
    {
      id: "page-about",
      type: "page",
      title: "About",
      snippet: "Learn more about Homegrown Visuals and the team.",
      href: "/about",
      badge: "Page",
      score: scoreTextMatch(normalizedQuery, "about team homegrown visuals"),
    },
  ].filter((entry) => entry.score > 0);

  return [...faqResults, ...portfolioResults, ...pageResults]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
