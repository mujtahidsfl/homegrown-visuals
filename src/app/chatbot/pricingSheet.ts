export type SqftTierKey = "0-1499" | "1500-2999" | "3000-4499" | "4500-5999" | "6000+";

export type TieredPrice = Partial<Record<SqftTierKey, number | "QUOTE">>;

export type PricingItem = {
  name: string;
  description?: string;
  prices?: TieredPrice;
  flatPrice?: number;
};

export const SQFT_TIERS: { key: SqftTierKey; label: string }[] = [
  { key: "0-1499", label: "0–1,499 sqft" },
  { key: "1500-2999", label: "1,500–2,999 sqft" },
  { key: "3000-4499", label: "3,000–4,499 sqft" },
  { key: "4500-5999", label: "4,500–5,999 sqft" },
  { key: "6000+", label: "6,000+ sqft" },
];

export function getSqftTier(sqft: number): SqftTierKey {
  if (sqft < 1500) return "0-1499";
  if (sqft < 3000) return "1500-2999";
  if (sqft < 4500) return "3000-4499";
  if (sqft < 6000) return "4500-5999";
  return "6000+";
}

export const PRICING_SHEET = {
  packages: [
    {
      name: "Standard Package",
      description: "Listing + drone photos + floorplan",
      prices: {
        "0-1499": 279,
        "1500-2999": 349,
        "3000-4499": 399,
        "4500-5999": 479,
        "6000+": "QUOTE",
      } satisfies TieredPrice,
    },
    {
      name: "Zillow Showcase Package",
      description: "Listing + drone photos + Zillow 3D Tour + 1 virtual twilight",
      prices: {
        "0-1499": 399,
        "1500-2999": 479,
        "3000-4499": 529,
        "4500-5999": 599,
      } satisfies TieredPrice,
    },
    {
      name: "Luxury Package",
      description: "Listing + drone photos + Zillow 3D Tour + 2 virtual twilights + 45–60sec Luxury Reel",
      prices: {
        "0-1499": 979,
        "1500-2999": 1059,
        "3000-4499": 1119,
        "4500-5999": 1179,
      } satisfies TieredPrice,
    },
  ] satisfies PricingItem[],
  alaCarte: [
    {
      name: "Listing photos",
      prices: {
        "0-1499": 189,
        "1500-2999": 229,
        "3000-4499": 299,
        "4500-5999": 349,
      } satisfies TieredPrice,
    },
    {
      name: "Zillow 3D",
      prices: {
        "0-1499": 149,
        "1500-2999": 179,
        "3000-4499": 199,
        "4500-5999": 219,
      } satisfies TieredPrice,
    },
    {
      name: "Cinematic Video (horizontal 45–60secs)",
      prices: {
        "0-1499": 379,
        "1500-2999": 409,
        "3000-4499": 459,
        "4500-5999": 509,
      } satisfies TieredPrice,
    },
    {
      name: "60sec Continuous walkthrough video",
      prices: {
        "0-1499": 149,
        "1500-2999": 175,
        "3000-4499": 199,
        "4500-5999": 229,
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

