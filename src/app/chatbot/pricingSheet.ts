export type SqftTierKey = "0-1499" | "1500-2499" | "2500-3999" | "4000-5500" | "5500+";

export type TieredPrice = Partial<Record<SqftTierKey, number | "QUOTE">>;

export type PricingItem = {
  name: string;
  description?: string;
  prices?: TieredPrice;
  flatPrice?: number;
};

export const SQFT_TIERS: { key: SqftTierKey; label: string }[] = [
  { key: "0-1499", label: "0–1,499 sqft" },
  { key: "1500-2499", label: "1,500–2,499 sqft" },
  { key: "2500-3999", label: "2,500–3,999 sqft" },
  { key: "4000-5500", label: "4,000–5,500 sqft" },
  { key: "5500+", label: "5,500+ sqft" },
];

export const PRICING_SHEET = {
  packages: [
    {
      name: "Standard Package",
      description: "Listing + drone photos + floorplan",
      prices: {
        "0-1499": 279,
        "1500-2499": 349,
        "2500-3999": 399,
        "4000-5500": 479,
        "5500+": "QUOTE",
      } satisfies TieredPrice,
    },
    {
      name: "Zillow Showcase Package",
      description: "Listing + drone photos + Zillow 3D Tour + 1 virtual twilight",
      prices: {
        "0-1499": 399,
        "1500-2499": 479,
        "2500-3999": 529,
        "4000-5500": 599,
      } satisfies TieredPrice,
    },
    {
      name: "Luxury Package",
      description: "Listing + drone photos + Zillow 3D Tour + 2 virtual twilights + 45–60sec Luxury Reel",
      prices: {
        "0-1499": 979,
        "1500-2499": 1059,
        "2500-3999": 1119,
        "4000-5500": 1179,
      } satisfies TieredPrice,
    },
  ] satisfies PricingItem[],
  alaCarte: [
    {
      name: "Listing photos",
      prices: {
        "0-1499": 189,
        "1500-2499": 229,
        "2500-3999": 299,
        "4000-5500": 349,
      } satisfies TieredPrice,
    },
    {
      name: "Zillow 3D",
      prices: {
        "0-1499": 149,
        "1500-2499": 179,
        "2500-3999": 199,
        "4000-5500": 219,
      } satisfies TieredPrice,
    },
    {
      name: "Cinematic Video (horizontal 45–60secs)",
      prices: {
        "0-1499": 379,
        "1500-2499": 409,
        "2500-3999": 459,
        "4000-5500": 509,
      } satisfies TieredPrice,
    },
    {
      name: "60sec Continuous walkthrough video",
      prices: {
        "0-1499": 149,
        "1500-2499": 175,
        "2500-3999": 199,
        "4000-5500": 229,
      } satisfies TieredPrice,
    },
    { name: "30sec Highlight Reel", flatPrice: 289 },
    { name: "6 Drone photos", flatPrice: 129 },
    { name: "12 Drone photos", flatPrice: 199 },
    {
      name: "Luxury Reel 45–60seconds",
      flatPrice: 649,
      description:
        "Our premier agent on-camera reel. Perfect for luxury properties or when you're ready to take your marketing to the next level.",
    },
    { name: "Luxury Reel add surrounding area footage", flatPrice: 749 },
  ] satisfies PricingItem[],
  landPackage: {
    name: "Land Package",
    flatPrice: 409,
    description: "25 ground + drone photos, 30-sec aerial video, and approximate survey line overlay with landmarks.",
  } satisfies PricingItem,
};

function formatPrice(price: number | "QUOTE") {
  if (price === "QUOTE") return "QUOTE";
  return `$${price}`;
}

export function formatTieredPrices(prices: TieredPrice) {
  const parts = SQFT_TIERS.map((tier) => {
    const value = prices[tier.key];
    if (!value) return null;
    return `${tier.label}: ${formatPrice(value)}`;
  }).filter(Boolean) as string[];

  return parts.join(" · ");
}

