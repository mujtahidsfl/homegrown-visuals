export type PackageKey = "standard" | "zillow_showcase" | "luxury";

export type SqftTierKey =
  | "under_1500"
  | "1500_2999"
  | "3000_4499"
  | "4500_5999";

export const SQFT_TIER_OPTIONS: Array<{ key: SqftTierKey; label: string }> = [
  { key: "under_1500", label: "Under 1,500 sqft" },
  { key: "1500_2999", label: "1,500 - 2,999 sqft" },
  { key: "3000_4499", label: "3,000 - 4,499 sqft" },
  { key: "4500_5999", label: "4,500 - 5,999 sqft" },
];

// Properties at or above this size take the custom quote path.
export const OVERSIZE_MIN_SQFT = 6000;

export const SQFT_SELECT_OPTIONS = [
  "Under 1500 sq ft",
  "1500-2999 sq ft",
  "3000-4499 sq ft",
  "4500-5999 sq ft",
  "6000+ sq ft",
];

export const isOversizeSqft = (sqft: number) => sqft >= OVERSIZE_MIN_SQFT;

export const getSqftTierKey = (sqft: number): SqftTierKey | "" => {
  if (!sqft || isOversizeSqft(sqft)) return "";
  if (sqft < 1500) return "under_1500";
  if (sqft < 3000) return "1500_2999";
  if (sqft < 4500) return "3000_4499";
  return "4500_5999";
};

export const PACKAGE_ROUTE_MAP: Record<PackageKey, string> = {
  standard: "/book/standard",
  zillow_showcase: "/book/zillow-showcase",
  luxury: "/book/luxury",
};

export const PACKAGE_DISPLAY = {
  standard: {
    key: "standard" as const,
    name: "Standard Package",
    range: "$279-$479",
    subtitle: "Best for clean, high-impact listing launches.",
    includes: [
      "Listing photos",
      "Drone photos",
      "Floorplan",
      "Fast media delivery for active listings",
    ],
  },
  zillow_showcase: {
    key: "zillow_showcase" as const,
    name: "Zillow Showcase Package",
    range: "$399-$599",
    subtitle: "Most booked package for agents who want stronger listing engagement.",
    includes: [
      "Listing photos",
      "Drone photos",
      "Zillow 3D Tour",
      "1 virtual twilight",
    ],
  },
  luxury: {
    key: "luxury" as const,
    name: "Luxury Package",
    range: "$979-$1,179",
    subtitle: "Premium media stack for high-end properties and standout marketing.",
    includes: [
      "Listing photos",
      "Drone photos",
      "Zillow 3D Tour",
      "2 virtual twilights",
      "45-60sec luxury reel",
    ],
  },
};

export type Addon = {
  id: string;
  label: string;
  description?: string;
  category: string;
  pricingType: "flat" | "sqft";
  flatPrice?: number;
  sqftPrices?: Record<SqftTierKey, number>;
};

const SQFT_PRICING = (a: number, b: number, c: number, d: number) => ({
  under_1500: a,
  "1500_2999": b,
  "3000_4499": c,
  "4500_5999": d,
});

const STANDARD_ADDONS: Addon[] = [
  { id: "drone_6", label: "6 Drone Photos", category: "Drone & Aerial", pricingType: "flat", flatPrice: 129 },
  { id: "drone_12", label: "12 Drone Photos", category: "Drone & Aerial", pricingType: "flat", flatPrice: 199 },
  { id: "drone_video_30", label: "30sec Drone-Only Video", category: "Drone & Aerial", pricingType: "flat", flatPrice: 249 },
  { id: "drone_clip_1", label: "1 Drone Clip", category: "Drone Clips", pricingType: "flat", flatPrice: 25 },
  { id: "drone_clip_2", label: "2 Drone Clips", category: "Drone Clips", pricingType: "flat", flatPrice: 50 },
  { id: "drone_clip_3", label: "3 Drone Clips", category: "Drone Clips", pricingType: "flat", flatPrice: 75 },
  { id: "drone_clip_4", label: "4 Drone Clips", category: "Drone Clips", pricingType: "flat", flatPrice: 100 },
  { id: "drone_clip_5", label: "5 Drone Clips", category: "Drone Clips", pricingType: "flat", flatPrice: 125 },
  { id: "twilight_1", label: "1 Virtual Twilight Photo", category: "Virtual Twilight", pricingType: "flat", flatPrice: 29 },
  { id: "twilight_2", label: "2 Virtual Twilight Photos", category: "Virtual Twilight", pricingType: "flat", flatPrice: 49 },
  { id: "twilight_4", label: "4 Virtual Twilight Photos", category: "Virtual Twilight", pricingType: "flat", flatPrice: 89 },
  { id: "detail_5", label: "Detail Photos (5)", category: "Detail Photos", pricingType: "flat", flatPrice: 39 },
  { id: "detail_10", label: "Detail Photos (10)", category: "Detail Photos", pricingType: "flat", flatPrice: 59 },
  { id: "detail_20", label: "Detail Photos (20)", category: "Detail Photos", pricingType: "flat", flatPrice: 109 },
  { id: "sm_reel_1", label: "15-30sec Social Media Reel", category: "Video / Reels", pricingType: "flat", flatPrice: 389 },
  { id: "sm_reel_2", label: "Two 15-30sec SM Reels", category: "Video / Reels", pricingType: "flat", flatPrice: 699 },
  { id: "stage_1", label: "Virtual Staging - 1 Room", category: "Virtual Staging", pricingType: "flat", flatPrice: 30 },
  { id: "stage_2", label: "Virtual Staging - 2 Rooms", category: "Virtual Staging", pricingType: "flat", flatPrice: 60 },
  { id: "stage_5", label: "Virtual Staging - 5 Rooms", category: "Virtual Staging", pricingType: "flat", flatPrice: 125 },
  { id: "zillow_3d", label: "Zillow 3D Tour", description: "3D walkthrough tour of home", category: "3D Tour", pricingType: "sqft", sqftPrices: SQFT_PRICING(149, 179, 199, 219) },
];

const ZILLOW_ONLY: Addon[] = [
  { id: "cinematic_video", label: "Cinematic Video (45-60sec)", category: "Cinematic Video", pricingType: "sqft", sqftPrices: SQFT_PRICING(379, 409, 459, 509) },
  { id: "twilight_session_photo", label: "Twilight Photo Session", category: "Twilight Sessions", pricingType: "flat", flatPrice: 289 },
  { id: "twilight_session_full", label: "Twilight Session", category: "Twilight Sessions", pricingType: "flat", flatPrice: 299 },
  { id: "community_amenities", label: "Community Amenity Photos", category: "Specialty", pricingType: "flat", flatPrice: 54 },
];

const LUXURY_ONLY: Addon[] = [
  { id: "luxury_area", label: "Luxury Reel + Surrounding Area", category: "Luxury Reel Upgrades", pricingType: "flat", flatPrice: 749 },
  { id: "luxury_ai", label: "Luxury Reel + AI", category: "Luxury Reel Upgrades", pricingType: "flat", flatPrice: 749 },
  { id: "luxury_day_night", label: "Luxury Reel + Day-to-Night", category: "Luxury Reel Upgrades", pricingType: "flat", flatPrice: 949 },
  { id: "sm_reel_3", label: "Three 15-30sec SM Reels", category: "Additional Reels", pricingType: "flat", flatPrice: 979 },
  { id: "sm_reel_5", label: "Five 15-30sec SM Reels", category: "Additional Reels", pricingType: "flat", flatPrice: 1499 },
  { id: "landmarks", label: "Landmarks", category: "Specialty", pricingType: "flat", flatPrice: 30 },
];

const ALL_ADDONS: Addon[] = [...STANDARD_ADDONS, ...ZILLOW_ONLY, ...LUXURY_ONLY];

export const BASE_PRICES: Record<PackageKey, Record<SqftTierKey, number>> = {
  standard: SQFT_PRICING(279, 349, 399, 479),
  zillow_showcase: SQFT_PRICING(399, 479, 529, 599),
  luxury: SQFT_PRICING(979, 1059, 1119, 1179),
};

export const PACKAGE_ADDONS: Record<PackageKey, Addon[]> = {
  standard: ALL_ADDONS,
  zillow_showcase: ALL_ADDONS,
  luxury: ALL_ADDONS,
};

export const PACKAGE_WEBHOOK_URLS: Record<PackageKey, string> = {
  standard: "https://hook.us2.make.com/86llcwx4hch7ffpyerkb88rmy7r2186a",
  zillow_showcase: "https://hook.us2.make.com/l7h4j6j8o29nu7rpdrpum7xr1km3efot",
  luxury: "https://hook.us2.make.com/kkr2i079e8ukfdfa8wrm4812bpunc587",
};
