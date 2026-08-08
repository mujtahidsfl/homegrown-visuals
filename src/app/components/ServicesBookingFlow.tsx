import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router";
import { Check, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import realEstateHero from "../../assets/portfolio/exterior/exterior-01.webp";
import landHero from "../../assets/portfolio/exterior/exterior-05.webp";
import socialHero from "../../assets/portfolio/interior/014.jpg";
import standardPackageImage from "../../assets/portfolio/exterior/exterior-02.webp";
import zillowPackageImage from "../../assets/portfolio/exterior/exterior-03.jpg";
import luxuryPackageImage from "../../assets/portfolio/exterior/exterior-04.jpg";
import {
  BASE_PRICES,
  PACKAGE_DISPLAY,
  PACKAGE_WEBHOOK_URLS,
  SQFT_TIER_OPTIONS,
  type PackageKey,
  type SqftTierKey,
} from "../booking/config";
import {
  sendBackupEmailFromFormData,
  sendBackupEmailFromPayload,
  sendBackupEmailFromPayloadKeepalive,
  sendGoogleSheetsFromFormData,
  sendGoogleSheetsFromPayload,
  sendGoogleSheetsFromPayloadKeepalive,
} from "../backupEmail";
import { AddressAutocompleteInput } from "./AddressAutocompleteInput";
import { LeadConnectorScheduler, type SchedulerOption } from "./LeadConnectorScheduler";

const SOCIAL_MEDIA_WEBHOOK_URL = "https://hook.us2.make.com/im0m5469kvkslku9bfqqudvymgs1nq6x";
const SERVICE_CARD_IMAGES = {
  real_estate: realEstateHero,
  vacant_land: landHero,
  social_media: socialHero,
};
const PACKAGE_CARD_IMAGES: Record<PackageKey, string> = {
  standard: standardPackageImage,
  zillow_showcase: zillowPackageImage,
  luxury: luxuryPackageImage,
};

const currency = (value: number) => {
  const absoluteValue = Math.abs(value);
  return `${value < 0 ? "-" : ""}$${absoluteValue.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
};
const VIDEO_ORDER_DISCOUNT_RATE = 0.1;
const DISCOUNT_CODES: Record<string, number> = {
  "2%LOYALTYHGV": 0.02,
  "5%GOLDHGV%": 0.05,
  "10%PARTNERHGV%": 0.1,
};
const roundCurrency = (value: number) => Math.round(value * 100) / 100;
const getDiscountCodeRate = (code: string) => DISCOUNT_CODES[code.trim().toUpperCase()] ?? 0;

type SectionShellProps = {
  children: ReactNode;
  className?: string;
};

const SECTION_SHELL_BASE =
  "bg-white border border-[#e7e9ee] rounded-[28px] p-6 sm:p-8 shadow-[0_22px_56px_rgba(15,23,42,0.08)]";
const FORM_INPUT_BASE =
  "h-12 px-4 rounded-[14px] border border-[#e3e6eb] bg-white outline-none focus:border-[#111111] focus:ring-2 focus:ring-black/10 transition";
const CARD_BASE =
  "rounded-[20px] border border-[#e7e9ee] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.06)]";
const PRIMARY_BUTTON =
  "h-11 px-6 rounded-full bg-[#111111] text-white text-[13px] font-semibold hover:bg-black transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
const SECONDARY_BUTTON =
  "h-11 px-5 rounded-full border border-[#d9dce3] bg-white text-[#111111] text-[13px] font-semibold hover:bg-[#f5f6f8] transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
const SOFT_PILL =
  "h-11 px-5 rounded-full border border-[#e3e6eb] bg-[#f6f7fb] text-[#1f2937] text-[13px] font-semibold hover:bg-white transition-colors";
const REQUIRED_FIELD_MESSAGE = "mt-1.5 text-[12px] leading-4 text-[#c84848] font-semibold";

const SectionShell = ({ children, className }: SectionShellProps) => (
  <div className={`${SECTION_SHELL_BASE}${className ? ` ${className}` : ""}`}>{children}</div>
);

const RequiredMessage = ({ show }: { show: boolean }) =>
  show ? <p className={REQUIRED_FIELD_MESSAGE}>Required</p> : null;

type StepTimelineProps = {
  steps: string[];
  activeStep: number;
};

const StepTimeline = ({ steps, activeStep }: StepTimelineProps) => (
  <div className="w-full overflow-x-auto pb-2">
    <div className="flex items-center gap-3 min-w-[520px] sm:min-w-0">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;
        const isComplete = stepNumber < activeStep;
        return (
          <div key={step} className="flex items-center gap-3 flex-1 min-w-[110px] sm:min-w-0">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                isComplete ? "bg-[#111111] text-white" : isActive ? "border border-[#111111] text-[#111111] bg-white" : "border border-[#d9dce3] text-[#6b7280] bg-white"
              }`}
            >
              {stepNumber}
            </div>
            <span
              className={`text-[12px] sm:text-[13px] whitespace-nowrap ${isActive ? "text-[#111111]" : "text-[#6b7280]"}`}
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: isActive ? 600 : 500 }}
            >
              {step}
            </span>
            {index < steps.length - 1 && <span className="flex-1 h-px bg-[#e5e7eb] min-w-[24px]" />}
          </div>
        );
      })}
    </div>
  </div>
);

type MediaPanelProps = {
  image: string;
  label: string;
  title: string;
  subtitle?: string;
};

const MediaPanel = ({ image, label, title, subtitle }: MediaPanelProps) => (
  <div className="relative overflow-hidden rounded-[26px] border border-[#e7e9ee] shadow-[0_18px_50px_rgba(15,23,42,0.12)] min-h-[260px] lg:min-h-[360px] bg-[#edf1f6]">
    <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
    <div className="absolute left-5 bottom-5 text-white max-w-[80%]">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">{label}</p>
      <p className="mt-2 text-[22px] sm:text-[26px] font-semibold leading-tight">{title}</p>
      {subtitle && <p className="mt-2 text-[13px] text-white/80">{subtitle}</p>}
    </div>
  </div>
);

const REAL_ESTATE_PHOTO_ITEMS = [
  {
    id: "re_listing_photos",
    label: "Listing Photos",
    pricingType: "tier" as const,
    prices: { under_1500: 189, "1500_2499": 229, "2500_3999": 299, "4000_5500": 349 },
  },
  {
    id: "re_zillow_3d",
    label: "Zillow 3D",
    pricingType: "tier" as const,
    prices: { under_1500: 149, "1500_2499": 179, "2500_3999": 199, "4000_5500": 219 },
  },
];

const REAL_ESTATE_DRONE_ITEMS = [
  { id: "re_drone_6", label: "6 Drone Photos", pricingType: "flat" as const, price: 129 },
  { id: "re_drone_12", label: "12 Drone Photos", pricingType: "flat" as const, price: 199 },
];

const REAL_ESTATE_TWILIGHT_OPTIONS = [
  { id: "re_twilight_1", label: "1 Photo", price: 29 },
  { id: "re_twilight_2", label: "2 Photos", price: 49 },
  { id: "re_twilight_4", label: "4 Photos", price: 89 },
];

const REAL_ESTATE_VIRTUAL_STAGING_OPTIONS = [
  { id: "re_stage_1", label: "1 Room", price: 30 },
  { id: "re_stage_2", label: "2 Rooms", price: 60 },
  { id: "re_stage_5", label: "5 Rooms", price: 125 },
];

const REAL_ESTATE_VIDEO_ITEMS = [
  {
    id: "re_cinematic_video",
    label: "Cinematic Video 45–60sec",
    description: "intentionally crafted, luxury property showcase (no agent on-camera)",
    pricingType: "tier" as const,
    prices: { under_1500: 379, "1500_2499": 409, "2500_3999": 459, "4000_5500": 509 },
  },
  {
    id: "re_walkthrough_60",
    label: "60sec Continuous Walkthrough",
    description: "our basic video walking through the property (no agent on-camera)",
    pricingType: "tier" as const,
    prices: { under_1500: 149, "1500_2499": 175, "2500_3999": 199, "4000_5500": 229 },
  },
];

const REAL_ESTATE_HIGHLIGHT_REEL_OPTIONS = [
  {
    id: "re_highlight_30",
    label: "30sec Highlight Reel",
    description: "same as the cinematic video but only property highlights (no agent on-camera)",
    pricingType: "flat" as const,
    price: 289,
  },
  {
    id: "re_highlight_30_ai",
    label: "Highlight Reel + AI",
    description: "30sec property highlight reel with AI-enhanced visuals",
    pricingType: "flat" as const,
    price: 389,
  },
];

const HIGHLIGHT_REEL_IDS = new Set(REAL_ESTATE_HIGHLIGHT_REEL_OPTIONS.map((option) => option.id));

const REAL_ESTATE_VIDEO_FLAT_ITEMS = [
  {
    id: "re_drone_video_30",
    label: "30sec Drone Only Video",
    description: "showcasing surrounding area and exterior of property (no agent on-camera)",
    pricingType: "flat" as const,
    price: 249,
  },
];

const REAL_ESTATE_LUXURY_REEL_OPTIONS = [
  { id: "re_luxury_base", label: "Base Luxury Reel", price: 649 },
  { id: "re_luxury_area", label: "Luxury Reel + Surrounding Area Video", price: 749 },
  { id: "re_luxury_ai", label: "Luxury Reel + AI Video", price: 749 },
  { id: "re_luxury_day_night", label: "Luxury Reel + Day-to-Night", price: 949 },
];

const REAL_ESTATE_SOCIAL_REEL_OPTIONS = [
  { id: "re_sm_1", label: "1 x 15–30sec Reel", price: 389 },
  { id: "re_sm_1_ai", label: "1 x 15–30sec Reel + AI", price: 449 },
  { id: "re_sm_2", label: "2 x 15–30sec Reels", price: 699 },
  { id: "re_sm_3", label: "3 x 15–30sec Reels", price: 979 },
  { id: "re_sm_5", label: "5 x 15–30sec Reels", price: 1499 },
];

const REAL_ESTATE_AMENITY_PRICE = 54;

const REAL_ESTATE_DETAIL_OPTIONS = [
  { id: "re_detail_5", label: "5 Photos", price: 39 },
  { id: "re_detail_10", label: "10 Photos", price: 59 },
  { id: "re_detail_20", label: "20 Photos", price: 109 },
];

const REAL_ESTATE_LANDMARK_OPTIONS = [
  { id: "re_landmark_1", label: "1 Photo", price: 30 },
  { id: "re_landmark_2", label: "2 Photos", price: 55 },
];

const REAL_ESTATE_DRONE_CLIP_OPTIONS = [
  { id: "re_drone_clip_1", label: "1 Drone Clip", price: 25 },
  { id: "re_drone_clip_2", label: "2 Drone Clips", price: 50 },
  { id: "re_drone_clip_3", label: "3 Drone Clips", price: 75 },
  { id: "re_drone_clip_4", label: "4 Drone Clips", price: 100 },
  { id: "re_drone_clip_5", label: "5 Drone Clips", price: 125 },
];

const REAL_ESTATE_TWILIGHT_SESSION_ID = "re_twilight_session";
const REAL_ESTATE_TWILIGHT_SESSION_PRICE = 289;

type InvoiceLineItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit_amount: number;
  amount: number;
};

const TIER_DURATION_MINUTES: Record<
  string,
  Partial<Record<SqftTierKey, number>>
> = {
  standard: { under_1500: 75, "1500_2499": 90, "2500_3999": 120, "4000_5500": 135 },
  zillow_showcase: { under_1500: 105, "1500_2499": 120, "2500_3999": 150, "4000_5500": 165 },
  luxury: { under_1500: 105, "1500_2499": 120, "2500_3999": 150, "4000_5500": 165 },
  re_zillow_3d: { under_1500: 30, "1500_2499": 45, "2500_3999": 60, "4000_5500": 90 },
  re_listing_photos: { under_1500: 45, "1500_2499": 75, "2500_3999": 105, "4000_5500": 120 },
  re_cinematic_video: { under_1500: 60, "1500_2499": 75, "2500_3999": 90, "4000_5500": 90 },
  re_walkthrough_60: { under_1500: 10, "1500_2499": 15, "2500_3999": 20, "4000_5500": 30 },
  re_highlight_30: { under_1500: 30, "1500_2499": 35, "2500_3999": 45, "4000_5500": 45 },
  re_highlight_30_ai: { under_1500: 30, "1500_2499": 35, "2500_3999": 45, "4000_5500": 45 },
};

const FLAT_DURATION_MINUTES: Record<string, number> = {
  re_drone_6: 15,
  re_drone_12: 25,
  re_drone_video_30: 0,
  re_luxury_base: 120,
  re_luxury_area: 120,
  re_luxury_ai: 120,
  re_luxury_day_night: 120,
  re_sm_1: 60,
  re_sm_1_ai: 60,
  re_sm_2: 105,
  re_sm_3: 150,
  re_sm_5: 180,
  re_detail_5: 0,
  re_detail_10: 0,
  re_detail_20: 0,
  re_twilight_1: 0,
  re_twilight_2: 0,
  re_twilight_4: 0,
  re_stage_1: 0,
  re_stage_2: 0,
  re_stage_5: 0,
  re_landmark_1: 0,
  re_landmark_2: 0,
  re_drone_clip_1: 0,
  re_drone_clip_2: 0,
  re_drone_clip_3: 0,
  re_drone_clip_4: 0,
  re_drone_clip_5: 0,
  re_amenity_photos: 0,
  [REAL_ESTATE_TWILIGHT_SESSION_ID]: 30,
  land_package: 75,
  land_photos_12: 30,
  land_photos_20: 45,
};

const BRAIDEN_RESTRICTED_SERVICE_IDS = new Set<string>([
  "luxury",
  "re_luxury_base",
  "re_luxury_area",
  "re_luxury_ai",
  "re_luxury_day_night",
  "re_sm_1",
  "re_sm_1_ai",
  "re_sm_2",
  "re_sm_3",
  "re_sm_5",
]);

const getOptionLabel = <T extends { id: string; label: string }>(options: T[], id: string) =>
  options.find((option) => option.id === id)?.label ?? id;

const formatSelectionLabel = (groupLabel: string, valueLabel: string) =>
  `${groupLabel} - ${valueLabel}`;

const getTierDurationMinutes = (serviceId: string, tier: SqftTierKey | "") => {
  if (!tier) return 0;
  return TIER_DURATION_MINUTES[serviceId]?.[tier] ?? 0;
};

const formatDurationMinutes = (minutes: number) => {
  if (!minutes) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours && remainder) return `${hours}h ${remainder}m`;
  if (hours) return `${hours}h`;
  return `${remainder}m`;
};

const getRoundedDurationBucket = (minutes: number) => {
  if (minutes <= 0) return 30;
  return DURATION_BUCKETS.find((bucket) => minutes <= bucket) ?? null;
};

const getServiceDurationMinutes = (serviceId: string, tier: SqftTierKey | "") =>
  Math.max(getTierDurationMinutes(serviceId, tier), FLAT_DURATION_MINUTES[serviceId] ?? 0);

const getRealEstateSelection = (id: string) => {
  const flatItems = [
    ...REAL_ESTATE_DRONE_ITEMS,
    ...REAL_ESTATE_HIGHLIGHT_REEL_OPTIONS,
    ...REAL_ESTATE_VIDEO_FLAT_ITEMS,
    { id: REAL_ESTATE_TWILIGHT_SESSION_ID, label: "Twilight Photo Session", pricingType: "flat" as const, price: REAL_ESTATE_TWILIGHT_SESSION_PRICE },
  ];
  const tierItems = [...REAL_ESTATE_PHOTO_ITEMS, ...REAL_ESTATE_VIDEO_ITEMS];

  const flatMatch = flatItems.find((item) => item.id === id);
  if (flatMatch) return { label: flatMatch.label, pricingType: "flat" as const, price: flatMatch.price };

  const tierMatch = tierItems.find((item) => item.id === id);
  if (tierMatch) return { label: tierMatch.label, pricingType: "tier" as const, prices: tierMatch.prices };

  return null;
};

const getRealEstatePayloadSelections = ({
  realEstateSelections,
  detailOption,
  twilightOption,
  stagingOption,
  landmarkOption,
  droneClipOption,
  amenityPhotos,
  luxuryReelOption,
  socialReelOption,
}: {
  realEstateSelections: string[];
  detailOption: string;
  twilightOption: string;
  stagingOption: string;
  landmarkOption: string;
  droneClipOption: string;
  amenityPhotos: boolean;
  luxuryReelOption: string;
  socialReelOption: string;
}) => ({
  a_la_carte: realEstateSelections
    .map((id) => getRealEstateSelection(id)?.label ?? id),
  detail_option: detailOption
    ? formatSelectionLabel("Detail Photos", getOptionLabel(REAL_ESTATE_DETAIL_OPTIONS, detailOption))
    : "",
  twilight_option: twilightOption
    ? formatSelectionLabel("Virtual Twilight Photos", getOptionLabel(REAL_ESTATE_TWILIGHT_OPTIONS, twilightOption))
    : "",
  staging_option: stagingOption
    ? formatSelectionLabel("Virtual Staging", getOptionLabel(REAL_ESTATE_VIRTUAL_STAGING_OPTIONS, stagingOption))
    : "",
  landmark_option: landmarkOption
    ? formatSelectionLabel("Landmarks", getOptionLabel(REAL_ESTATE_LANDMARK_OPTIONS, landmarkOption))
    : "",
  drone_clip_option: droneClipOption
    ? formatSelectionLabel("Drone Clips", getOptionLabel(REAL_ESTATE_DRONE_CLIP_OPTIONS, droneClipOption))
    : "",
  community_amenity_photos: amenityPhotos,
  luxury_reel_option: luxuryReelOption
    ? formatSelectionLabel("Luxury Reel 45-60sec", getOptionLabel(REAL_ESTATE_LUXURY_REEL_OPTIONS, luxuryReelOption))
    : "",
  social_reel_option: socialReelOption
    ? formatSelectionLabel("Social Media Reel", getOptionLabel(REAL_ESTATE_SOCIAL_REEL_OPTIONS, socialReelOption))
    : "",
});

const getRealEstateLineItems = ({
  realEstatePackage,
  realEstateSqftTier,
  realEstateSelections,
  detailOption,
  twilightOption,
  stagingOption,
  landmarkOption,
  droneClipOption,
  amenityPhotos,
  luxuryReelOption,
  socialReelOption,
}: {
  realEstatePackage: PackageKey | null;
  realEstateSqftTier: SqftTierKey | "";
  realEstateSelections: string[];
  detailOption: string;
  twilightOption: string;
  stagingOption: string;
  landmarkOption: string;
  droneClipOption: string;
  amenityPhotos: boolean;
  luxuryReelOption: string;
  socialReelOption: string;
}) => {
  const lineItems: InvoiceLineItem[] = [];

  if (realEstatePackage && realEstateSqftTier) {
    lineItems.push(
      buildLineItem(
        realEstatePackage,
        PACKAGE_DISPLAY[realEstatePackage].name,
        "Package",
        BASE_PRICES[realEstatePackage][realEstateSqftTier],
      ),
    );
  }

  realEstateSelections.forEach((id) => {
    const selection = getRealEstateSelection(id);
    if (!selection) return;
    const amount =
      selection.pricingType === "flat"
        ? selection.price
        : realEstateSqftTier
          ? selection.prices[realEstateSqftTier]
          : 0;
    if (!amount) return;
    lineItems.push(buildLineItem(id, selection.label, "A La Carte", amount));
  });

  const detail = REAL_ESTATE_DETAIL_OPTIONS.find((option) => option.id === detailOption);
  if (detail) lineItems.push(buildLineItem(detail.id, formatSelectionLabel("Detail Photos", detail.label), "Add-Ons", detail.price));

  const twilight = REAL_ESTATE_TWILIGHT_OPTIONS.find((option) => option.id === twilightOption);
  if (twilight) lineItems.push(buildLineItem(twilight.id, formatSelectionLabel("Virtual Twilight Photos", twilight.label), "Add-Ons", twilight.price));

  const staging = REAL_ESTATE_VIRTUAL_STAGING_OPTIONS.find((option) => option.id === stagingOption);
  if (staging) lineItems.push(buildLineItem(staging.id, formatSelectionLabel("Virtual Staging", staging.label), "Add-Ons", staging.price));

  const landmark = REAL_ESTATE_LANDMARK_OPTIONS.find((option) => option.id === landmarkOption);
  if (landmark) lineItems.push(buildLineItem(landmark.id, formatSelectionLabel("Landmarks", landmark.label), "Add-Ons", landmark.price));

  const droneClip = REAL_ESTATE_DRONE_CLIP_OPTIONS.find((option) => option.id === droneClipOption);
  if (droneClip) lineItems.push(buildLineItem(droneClip.id, formatSelectionLabel("Drone Clips", droneClip.label), "Add-Ons", droneClip.price));

  if (amenityPhotos) {
    lineItems.push(buildLineItem("re_amenity_photos", "Community Amenity Photos", "Add-Ons", REAL_ESTATE_AMENITY_PRICE));
  }

  const luxury = REAL_ESTATE_LUXURY_REEL_OPTIONS.find((option) => option.id === luxuryReelOption);
  if (luxury) lineItems.push(buildLineItem(luxury.id, formatSelectionLabel("Luxury Reel 45-60sec", luxury.label), "A La Carte", luxury.price));

  const social = REAL_ESTATE_SOCIAL_REEL_OPTIONS.find((option) => option.id === socialReelOption);
  if (social) lineItems.push(buildLineItem(social.id, formatSelectionLabel("Social Media Reel", social.label), "A La Carte", social.price));

  return lineItems;
};

const buildLineItem = (
  id: string,
  name: string,
  category: string,
  amount: number,
): InvoiceLineItem => ({
  id,
  name,
  category,
  quantity: 1,
  unit_amount: amount,
  amount,
});

const formatInvoiceLineItem = (item: InvoiceLineItem) =>
  `${item.name} - ${currency(item.amount)}`;

const getInvoiceLineItemsText = (lineItems: InvoiceLineItem[]) =>
  lineItems.map(formatInvoiceLineItem).join("\n");

const getStripeInvoiceLinesBody = (lineItems: InvoiceLineItem[]) => {
  const params = new URLSearchParams();
  lineItems.forEach((item, index) => {
    params.append(`lines[${index}][amount]`, String(Math.round(item.amount * 100)));
    params.append(`lines[${index}][description]`, item.name);
  });
  return params.toString();
};

const getInvoiceSummary = (
  lineItems: InvoiceLineItem[],
  total: number,
  propertyAddress: string,
) =>
  [
    getInvoiceLineItemsText(lineItems),
    `Total - ${currency(total)}`,
    propertyAddress ? `Property Address - ${propertyAddress}` : "",
  ]
    .filter(Boolean)
    .join("\n");

const getDiscountLineItems = ({
  videoDiscount,
  promoCode,
  promoDiscount,
}: {
  videoDiscount: number;
  promoCode: string;
  promoDiscount: number;
}) => {
  const lineItems: InvoiceLineItem[] = [];
  if (videoDiscount > 0) {
    lineItems.push(buildLineItem("video_order_discount", "10% Video Order Discount", "Discount", -videoDiscount));
  }
  const normalizedPromoCode = promoCode.trim();
  if (promoDiscount > 0 && normalizedPromoCode) {
    lineItems.push(buildLineItem("discount_code", `Discount Code (${normalizedPromoCode})`, "Discount", -promoDiscount));
  }
  return lineItems;
};

const VACANT_LAND_ITEMS = [
  { id: "land_photos_12", label: "12 Photos (mix of aerial + ground)", price: 199 },
  { id: "land_photos_20", label: "20 Photos (mix of aerial + ground)", price: 279 },
  {
    id: "land_package",
    label: "Vacant Land Package",
    price: 349,
    description: "Includes 10 drone photos, aerial video, and lot lines.",
  },
];

const TODAY = new Date().toISOString().split("T")[0];
const SERVICES_DRAFT_STORAGE_KEY = "hgv_services_booking_draft_v1";
const DURATION_BUCKETS = [30, 60, 90, 120, 150, 180, 240, 300, 360] as const;

const DEAN_BUCKET_CALENDARS: Record<number, SchedulerOption> = {
  30: {
    key: "dean-30",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/2ShQm1bADqe7dru4aYBx",
    iframeId: "2ShQm1bADqe7dru4aYBx_1776856338750",
  },
  60: {
    key: "dean-60",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/XUbE5uf8Im9c5746ZRus",
    iframeId: "XUbE5uf8Im9c5746ZRus_1776856449698",
  },
  90: {
    key: "dean-90",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/nnnA7kmkDvcnUp6JMo32",
    iframeId: "nnnA7kmkDvcnUp6JMo32_1776856622048",
  },
  120: {
    key: "dean-120",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/D2pCJAgDLylzfXFCzkxH",
    iframeId: "D2pCJAgDLylzfXFCzkxH_1776856746869",
  },
  150: {
    key: "dean-150",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/4ZtW10x59FIwBD4UJPeM",
    iframeId: "4ZtW10x59FIwBD4UJPeM_1776856843578",
  },
  180: {
    key: "dean-180",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/V6J170tMMqltADDAZYbZ",
    iframeId: "V6J170tMMqltADDAZYbZ_1776856888071",
  },
  240: {
    key: "dean-240",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/DonrOjglvoeIgsmcdnZr",
    iframeId: "DonrOjglvoeIgsmcdnZr_1776857087839",
  },
  300: {
    key: "dean-300",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/S4BQEQC3FSVIZveHVxrP",
    iframeId: "S4BQEQC3FSVIZveHVxrP_1776857174121",
  },
  360: {
    key: "dean-360",
    name: "Dean",
    role: "Dean Only",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/etyEO3oacR7QrE0sMcyX",
    iframeId: "etyEO3oacR7QrE0sMcyX_1776857220556",
  },
};

const ROUND_ROBIN_BUCKET_CALENDARS: Record<number, SchedulerOption> = {
  30: {
    key: "db-30",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/soYosjYfHO0sA0QAcSFx",
    iframeId: "soYosjYfHO0sA0QAcSFx_1776859645328",
  },
  60: {
    key: "db-60",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/oTcmJ62JHyAeqAbL5in3",
    iframeId: "oTcmJ62JHyAeqAbL5in3_1776860015326",
  },
  90: {
    key: "db-90",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/z3Z206M8bu6mu73WS2Az",
    iframeId: "z3Z206M8bu6mu73WS2Az_1776861372973",
  },
  120: {
    key: "db-120",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/8rsj2UGk2h7YI1Nfm1Ct",
    iframeId: "8rsj2UGk2h7YI1Nfm1Ct_1776861657661",
  },
  150: {
    key: "db-150",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/EK6ts0AJGfKWXKQy8oEX",
    iframeId: "EK6ts0AJGfKWXKQy8oEX_1776861631627",
  },
  180: {
    key: "db-180",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/QuU72RBp3THvTfucylPa",
    iframeId: "QuU72RBp3THvTfucylPa_1776861982971",
  },
  240: {
    key: "db-240",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/ha4qGeTnDdhEIS2RdYGw",
    iframeId: "ha4qGeTnDdhEIS2RdYGw_1776861856020",
  },
  300: {
    key: "db-300",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/0G4ghLpXimxHzk9LRyxg",
    iframeId: "0G4ghLpXimxHzk9LRyxg_1776862072957",
  },
  360: {
    key: "db-360",
    name: "Dean + Brayden",
    role: "Round Robin",
    bookingUrl: "https://api.leadconnectorhq.com/widget/booking/eS4f0kYLJRRpBNbeqNz2",
    iframeId: "eS4f0kYLJRRpBNbeqNz2_1776862132239",
  },
};

const createDraftId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `draft-${Date.now()}`;
  }
};

const ServiceType = {
  REAL_ESTATE: "real_estate",
  VACANT_LAND: "vacant_land",
  SOCIAL_MEDIA: "social_media",
} as const;

const toSqftNumber = (value: string) => {
  if (!value) return 0;
  const normalized = value.toLowerCase().trim();
  if (normalized.includes("under")) {
    const base = Number(normalized.replace(/[^\d]/g, ""));
    return Number.isFinite(base) && base > 0 ? base - 1 : 0;
  }
  if (normalized.includes("+")) {
    const base = Number(normalized.replace(/[^\d]/g, ""));
    return Number.isFinite(base) && base > 0 ? base + 1 : 0;
  }
  if (normalized.includes("-")) {
    const parts = normalized.split("-");
    const upper = Number(parts[1]?.replace(/[^\d]/g, ""));
    return Number.isFinite(upper) ? upper : 0;
  }
  const parsed = Number(normalized.replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getSqftTierKey = (sqft: number): SqftTierKey | "" => {
  if (!sqft) return "";
  if (sqft <= 1499) return "under_1500";
  if (sqft <= 2499) return "1500_2499";
  if (sqft <= 3999) return "2500_3999";
  if (sqft <= 5499) return "4000_5500";
  return "";
};

type ServiceTypeKey = (typeof ServiceType)[keyof typeof ServiceType];

type ContactFields = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

type SimpleContactFields = {
  fullName: string;
  email: string;
  phone: string;
  servicesNeeded: string;
};

type PropertyAccess = {
  vacancy: string;
  access: string;
  lockbox: string;
  gateCode: string;
  termsAccepted: boolean;
  smsMarketing: boolean;
  smsTransactional: boolean;
};

export function ServicesBookingFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const flowTopRef = useRef<HTMLDivElement | null>(null);
  const servicesDraftRestoredRef = useRef(false);
  const servicesSubmissionFinalizedRef = useRef(false);
  const servicesAbandonmentSentRef = useRef(false);
  const servicesDraftIdRef = useRef(createDraftId());
  const [draftDecisionOpen, setDraftDecisionOpen] = useState(false);
  const [pendingServicesDraft, setPendingServicesDraft] = useState<Record<string, any> | null>(null);
  const [serviceType, setServiceType] = useState<ServiceTypeKey | null>(null);
  const [realEstateStep, setRealEstateStep] = useState(1);
  const [landStep, setLandStep] = useState(1);

  const [realEstateProperty, setRealEstateProperty] = useState({
    address: "",
    sqft: "",
  });
  const [realEstatePackage, setRealEstatePackage] = useState<PackageKey | null>(null);
  const [realEstateSelections, setRealEstateSelections] = useState<string[]>([]);
  const [detailOption, setDetailOption] = useState<string>("");
  const [twilightOption, setTwilightOption] = useState<string>("");
  const [stagingOption, setStagingOption] = useState<string>("");
  const [landmarkOption, setLandmarkOption] = useState<string>("");
  const [droneClipOption, setDroneClipOption] = useState<string>("");
  const [amenityPhotos, setAmenityPhotos] = useState(false);
  const [luxuryReelOption, setLuxuryReelOption] = useState<string>("");
  const [socialReelOption, setSocialReelOption] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [videoQuestions, setVideoQuestions] = useState({
    highlights: "",
    music: "",
    vibe: "",
  });
  const [realEstateSchedule, setRealEstateSchedule] = useState({
    preferredDate: "",
    preferredTime: "",
    schedulerKey: "dean",
    schedulerName: "Dean",
    schedulerUrl: "https://api.leadconnectorhq.com/widget/booking/V6J170tMMqltADDAZYbZ",
  });
  const [realEstateAccess, setRealEstateAccess] = useState<PropertyAccess>({
    vacancy: "",
    access: "",
    lockbox: "",
    gateCode: "",
    termsAccepted: false,
    smsMarketing: false,
    smsTransactional: false,
  });
  const [realEstateContact, setRealEstateContact] = useState<SimpleContactFields>({
    fullName: "",
    email: "",
    phone: "",
    servicesNeeded: "",
  });
  const [realEstateOversizeContact, setRealEstateOversizeContact] = useState<SimpleContactFields>({
    fullName: "",
    email: "",
    phone: "",
    servicesNeeded: "",
  });
  const [realEstateSubmitting, setRealEstateSubmitting] = useState(false);
  const [realEstateError, setRealEstateError] = useState<string | null>(null);
  const [realEstateDetailsSaved, setRealEstateDetailsSaved] = useState(false);

  const [landProperty, setLandProperty] = useState({ address: "" });
  const [landSelection, setLandSelection] = useState<string>("");
  const [landSchedule, setLandSchedule] = useState({
    preferredDate: "",
    preferredTime: "",
    schedulerKey: "dean",
    schedulerName: "Dean",
    schedulerUrl: "https://api.leadconnectorhq.com/widget/booking/V6J170tMMqltADDAZYbZ",
  });
  const [landAccess, setLandAccess] = useState<PropertyAccess>({
    vacancy: "",
    access: "",
    lockbox: "",
    gateCode: "",
    termsAccepted: false,
    smsMarketing: false,
    smsTransactional: false,
  });
  const [landSubmitting, setLandSubmitting] = useState(false);
  const [landError, setLandError] = useState<string | null>(null);
  const [landDetailsSaved, setLandDetailsSaved] = useState(false);
  const [landContact, setLandContact] = useState<SimpleContactFields>({
    fullName: "",
    email: "",
    phone: "",
    servicesNeeded: "",
  });

  const [socialContact, setSocialContact] = useState<ContactFields>({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [realEstateDiscountCode, setRealEstateDiscountCode] = useState("");

  useEffect(() => {
    if (servicesDraftRestoredRef.current) return;
    if (serviceType) return;

    const params = new URLSearchParams(location.search);
    const serviceParam = params.get("service")?.toLowerCase();
    if (!serviceParam) return;

    if (serviceParam === "social-media" || serviceParam === "social_media" || serviceParam === "social") {
      setServiceType(ServiceType.SOCIAL_MEDIA);
      return;
    }

    if (serviceParam === "real-estate" || serviceParam === "real_estate" || serviceParam === "realestate") {
      setServiceType(ServiceType.REAL_ESTATE);
      return;
    }

    if (serviceParam === "vacant-land" || serviceParam === "vacant_land" || serviceParam === "land") {
      setServiceType(ServiceType.VACANT_LAND);
    }
  }, [location.search, serviceType]);

  const realEstateSqftValue = useMemo(() => toSqftNumber(realEstateProperty.sqft), [realEstateProperty.sqft]);
  const realEstateSqftTier = useMemo(() => getSqftTierKey(realEstateSqftValue), [realEstateSqftValue]);
  const isOversize = realEstateSqftValue > 5500;
  const realEstateContactComplete = Boolean(
    realEstateContact.fullName.trim() &&
      realEstateContact.email.trim() &&
      realEstateContact.phone.trim()
  );
  const landContactComplete = Boolean(
    landContact.fullName.trim() &&
      landContact.email.trim() &&
      landContact.phone.trim()
  );

  const videoSelectionIds = useMemo(() => {
    return new Set<string>([
      ...REAL_ESTATE_VIDEO_ITEMS.map((item) => item.id),
      ...REAL_ESTATE_HIGHLIGHT_REEL_OPTIONS.map((item) => item.id),
      ...REAL_ESTATE_VIDEO_FLAT_ITEMS.map((item) => item.id),
    ]);
  }, []);

  const requiresVideoQuestions = Boolean(
    realEstatePackage === "luxury" ||
      luxuryReelOption ||
      socialReelOption ||
      realEstateSelections.some((id) => videoSelectionIds.has(id))
  );
  const realEstateHasVideo = requiresVideoQuestions;
  const realEstateVideoDetailsComplete = Boolean(
    !requiresVideoQuestions ||
      (videoQuestions.highlights.trim() &&
        videoQuestions.music.trim() &&
        videoQuestions.vibe.trim())
  );
  const realEstateAccessComplete = Boolean(
    realEstateAccess.vacancy.trim() &&
      realEstateAccess.access.trim() &&
      realEstateAccess.lockbox.trim() &&
      realEstateAccess.gateCode.trim()
  );
  const realEstateNotesComplete = Boolean(specialRequests.trim() && additionalInfo.trim());
  const realEstateSubmissionDetailsComplete = Boolean(
    realEstateContactComplete &&
      realEstateVideoDetailsComplete &&
      realEstateAccessComplete &&
      realEstateNotesComplete
  );
  const realEstatePackageOrAlaCarteSelected = Boolean(
    realEstatePackage ||
      realEstateSelections.length > 0 ||
      luxuryReelOption ||
      socialReelOption
  );

  const realEstateSelectedServiceIds = useMemo(() => {
    const ids = [...realEstateSelections];
    if (realEstatePackage) ids.push(realEstatePackage);
    if (luxuryReelOption) ids.push(luxuryReelOption);
    if (socialReelOption) ids.push(socialReelOption);
    if (detailOption) ids.push(detailOption);
    if (twilightOption) ids.push(twilightOption);
    if (stagingOption) ids.push(stagingOption);
    if (landmarkOption) ids.push(landmarkOption);
    if (droneClipOption) ids.push(droneClipOption);
    if (amenityPhotos) ids.push("re_amenity_photos");
    return ids;
  }, [
    amenityPhotos,
    detailOption,
    droneClipOption,
    landmarkOption,
    luxuryReelOption,
    realEstatePackage,
    realEstateSelections,
    socialReelOption,
    stagingOption,
    twilightOption,
  ]);

  const realEstateEstimatedDurationMinutes = useMemo(() => {
    const selectedDurations = [
      realEstatePackage ? getServiceDurationMinutes(realEstatePackage, realEstateSqftTier) : 0,
      ...realEstateSelections.map((serviceId) => getServiceDurationMinutes(serviceId, realEstateSqftTier)),
      luxuryReelOption ? getServiceDurationMinutes(luxuryReelOption, realEstateSqftTier) : 0,
      socialReelOption ? getServiceDurationMinutes(socialReelOption, realEstateSqftTier) : 0,
      detailOption ? getServiceDurationMinutes(detailOption, realEstateSqftTier) : 0,
      twilightOption ? getServiceDurationMinutes(twilightOption, realEstateSqftTier) : 0,
      stagingOption ? getServiceDurationMinutes(stagingOption, realEstateSqftTier) : 0,
      landmarkOption ? getServiceDurationMinutes(landmarkOption, realEstateSqftTier) : 0,
      droneClipOption ? getServiceDurationMinutes(droneClipOption, realEstateSqftTier) : 0,
      amenityPhotos ? getServiceDurationMinutes("re_amenity_photos", realEstateSqftTier) : 0,
    ];

    return Math.max(...selectedDurations, 0);
  }, [
    amenityPhotos,
    detailOption,
    droneClipOption,
    landmarkOption,
    luxuryReelOption,
    realEstatePackage,
    realEstateSelections,
    realEstateSqftTier,
    socialReelOption,
    stagingOption,
    twilightOption,
  ]);

  const realEstateEstimatedDurationLabel = useMemo(
    () => formatDurationMinutes(realEstateEstimatedDurationMinutes),
    [realEstateEstimatedDurationMinutes],
  );
  const realEstateDurationBucket = useMemo(
    () => getRoundedDurationBucket(realEstateEstimatedDurationMinutes),
    [realEstateEstimatedDurationMinutes],
  );

  const braidenCanHandleRealEstate = useMemo(
    () => realEstateSelectedServiceIds.every((serviceId) => !BRAIDEN_RESTRICTED_SERVICE_IDS.has(serviceId)),
    [realEstateSelectedServiceIds],
  );

  const availableRealEstateSchedulers = useMemo(
    () => {
      if (!realEstateDurationBucket) return [];
      const deanOption = DEAN_BUCKET_CALENDARS[realEstateDurationBucket];
      const roundRobinOption = ROUND_ROBIN_BUCKET_CALENDARS[realEstateDurationBucket];
      if (!braidenCanHandleRealEstate) {
        return deanOption ? [deanOption] : [];
      }
      return roundRobinOption ? [roundRobinOption] : [];
    },
    [braidenCanHandleRealEstate, realEstateDurationBucket],
  );

  const landEstimatedDurationMinutes = useMemo(
    () => (landSelection ? FLAT_DURATION_MINUTES[landSelection] ?? 0 : 0),
    [landSelection],
  );

  const landEstimatedDurationLabel = useMemo(
    () => formatDurationMinutes(landEstimatedDurationMinutes),
    [landEstimatedDurationMinutes],
  );

  const landDurationBucket = useMemo(
    () => getRoundedDurationBucket(landEstimatedDurationMinutes),
    [landEstimatedDurationMinutes],
  );

  const availableLandSchedulers = useMemo(
    () => {
      if (!landDurationBucket) return [];
      const roundRobinOption = ROUND_ROBIN_BUCKET_CALENDARS[landDurationBucket];
      return roundRobinOption ? [roundRobinOption] : [];
    },
    [landDurationBucket],
  );

  const toggleSelection = (id: string, set: Dispatch<SetStateAction<string[]>>) => {
    set((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const highlightReelOption = REAL_ESTATE_HIGHLIGHT_REEL_OPTIONS.find((option) => realEstateSelections.includes(option.id))?.id ?? "";
  const setHighlightReelOption = (id: string) => {
    setRealEstateSelections((prev) => [
      ...prev.filter((item) => !HIGHLIGHT_REEL_IDS.has(item)),
      ...(id ? [id] : []),
    ]);
  };

  const realEstateBase = useMemo(() => {
    if (!realEstatePackage || !realEstateSqftTier) return 0;
    return BASE_PRICES[realEstatePackage][realEstateSqftTier];
  }, [realEstatePackage, realEstateSqftTier]);

  const realEstateAlaCarteTotal = useMemo(() => {
    let total = 0;
    const tier = realEstateSqftTier;

    REAL_ESTATE_PHOTO_ITEMS.forEach((item) => {
      if (!realEstateSelections.includes(item.id)) return;
      if (item.pricingType === "flat") total += item.price;
      if (item.pricingType === "tier" && tier) total += item.prices[tier];
    });

    REAL_ESTATE_DRONE_ITEMS.forEach((item) => {
      if (!realEstateSelections.includes(item.id)) return;
      total += item.price;
    });

    REAL_ESTATE_VIDEO_ITEMS.forEach((item) => {
      if (!realEstateSelections.includes(item.id)) return;
      if (item.pricingType === "flat") total += item.price;
      if (item.pricingType === "tier" && tier) total += item.prices[tier];
    });

    REAL_ESTATE_HIGHLIGHT_REEL_OPTIONS.forEach((item) => {
      if (!realEstateSelections.includes(item.id)) return;
      total += item.price;
    });

    REAL_ESTATE_VIDEO_FLAT_ITEMS.forEach((item) => {
      if (!realEstateSelections.includes(item.id)) return;
      total += item.price;
    });

    if (realEstateSelections.includes(REAL_ESTATE_TWILIGHT_SESSION_ID)) {
      total += REAL_ESTATE_TWILIGHT_SESSION_PRICE;
    }

    const luxury = REAL_ESTATE_LUXURY_REEL_OPTIONS.find((option) => option.id === luxuryReelOption);
    if (luxury) total += luxury.price;
    const social = REAL_ESTATE_SOCIAL_REEL_OPTIONS.find((option) => option.id === socialReelOption);
    if (social) total += social.price;

    return total;
  }, [
    luxuryReelOption,
    realEstateSqftTier,
    realEstateSelections,
    socialReelOption,
  ]);

  const realEstateEditingTotal = useMemo(() => {
    let total = 0;
    const detail = REAL_ESTATE_DETAIL_OPTIONS.find((option) => option.id === detailOption);
    if (detail) total += detail.price;
    const twilight = REAL_ESTATE_TWILIGHT_OPTIONS.find((option) => option.id === twilightOption);
    if (twilight) total += twilight.price;
    const staging = REAL_ESTATE_VIRTUAL_STAGING_OPTIONS.find((option) => option.id === stagingOption);
    if (staging) total += staging.price;
    const landmark = REAL_ESTATE_LANDMARK_OPTIONS.find((option) => option.id === landmarkOption);
    if (landmark) total += landmark.price;
    const droneClip = REAL_ESTATE_DRONE_CLIP_OPTIONS.find((option) => option.id === droneClipOption);
    if (droneClip) total += droneClip.price;
    if (amenityPhotos) total += REAL_ESTATE_AMENITY_PRICE;
    return total;
  }, [amenityPhotos, detailOption, droneClipOption, landmarkOption, stagingOption, twilightOption]);

  const realEstateSummaryLineItems = useMemo(() => getRealEstateLineItems({
    realEstatePackage,
    realEstateSqftTier,
    realEstateSelections,
    detailOption,
    twilightOption,
    stagingOption,
    landmarkOption,
    droneClipOption,
    amenityPhotos,
    luxuryReelOption,
    socialReelOption,
  }), [
    amenityPhotos,
    detailOption,
    droneClipOption,
    landmarkOption,
    luxuryReelOption,
    realEstatePackage,
    realEstateSelections,
    realEstateSqftTier,
    socialReelOption,
    stagingOption,
    twilightOption,
  ]);

  const realEstateSubtotal = realEstateBase + realEstateAlaCarteTotal + realEstateEditingTotal;
  const realEstateVideoDiscount = realEstateHasVideo ? roundCurrency(realEstateSubtotal * VIDEO_ORDER_DISCOUNT_RATE) : 0;
  const realEstateDiscountCodeRate = getDiscountCodeRate(realEstateDiscountCode);
  const realEstateDiscountCodeAmount = realEstateDiscountCodeRate
    ? roundCurrency(realEstateSubtotal * realEstateDiscountCodeRate)
    : 0;
  const realEstateTotal = Math.max(0, roundCurrency(realEstateSubtotal - realEstateVideoDiscount - realEstateDiscountCodeAmount));

  const landTotal = useMemo(() => {
    const item = VACANT_LAND_ITEMS.find((option) => option.id === landSelection);
    return item ? item.price : 0;
  }, [landSelection]);

  useEffect(() => {
    if (!availableRealEstateSchedulers.some((option) => option.key === realEstateSchedule.schedulerKey)) {
      const fallbackScheduler = availableRealEstateSchedulers[0];
      if (!fallbackScheduler) return;
      setRealEstateSchedule((prev) => ({
        ...prev,
        schedulerKey: fallbackScheduler.key,
        schedulerName: fallbackScheduler.name,
        schedulerUrl: fallbackScheduler.bookingUrl,
      }));
    }
  }, [availableRealEstateSchedulers, realEstateSchedule.schedulerKey]);

  useEffect(() => {
    if (!availableLandSchedulers.some((option) => option.key === landSchedule.schedulerKey)) {
      const fallbackScheduler = availableLandSchedulers[0];
      if (!fallbackScheduler) return;
      setLandSchedule((prev) => ({
        ...prev,
        schedulerKey: fallbackScheduler.key,
        schedulerName: fallbackScheduler.name,
        schedulerUrl: fallbackScheduler.bookingUrl,
      }));
    }
  }, [availableLandSchedulers, landSchedule.schedulerKey]);

  useEffect(() => {
    setRealEstateDetailsSaved(false);
  }, [
    additionalInfo,
    realEstateAccess,
    realEstateContact,
    realEstateDiscountCode,
    realEstateSchedule.schedulerKey,
    specialRequests,
    videoQuestions,
  ]);

  useEffect(() => {
    setLandDetailsSaved(false);
  }, [landAccess, landContact, landSchedule.schedulerKey]);

  const clearServicesDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SERVICES_DRAFT_STORAGE_KEY);
    }
    servicesAbandonmentSentRef.current = false;
    servicesDraftIdRef.current = createDraftId();
  };

  const buildServicesAbandonmentPayload = () => {
    if (!serviceType) return null;

    const basePayload = {
      form_type: "abandoned_booking_draft",
      abandonment_status: "incomplete",
      draft_id: servicesDraftIdRef.current,
      service_type: serviceType,
      current_step:
        serviceType === ServiceType.REAL_ESTATE
          ? realEstateStep
          : serviceType === ServiceType.VACANT_LAND
            ? landStep
            : 1,
      submitted_at: new Date().toISOString(),
      source_page: window.location.href,
    };

    if (serviceType === ServiceType.REAL_ESTATE) {
      return {
        ...basePayload,
        booking_path: isOversize ? "real_estate_oversize" : "real_estate",
        package: realEstatePackage ? PACKAGE_DISPLAY[realEstatePackage].name : "A La Carte",
        property: realEstateProperty,
        selections: getRealEstatePayloadSelections({
          realEstateSelections,
          detailOption,
          twilightOption,
          stagingOption,
          landmarkOption,
          droneClipOption,
          amenityPhotos,
          luxuryReelOption,
          socialReelOption,
        }),
        line_items: getRealEstateLineItems({
          realEstatePackage,
          realEstateSqftTier,
          realEstateSelections,
          detailOption,
          twilightOption,
          stagingOption,
          landmarkOption,
          droneClipOption,
          amenityPhotos,
          luxuryReelOption,
          socialReelOption,
        }),
        raw_a_la_carte: realEstateSelections,
        video_questions: videoQuestions,
        schedule: realEstateSchedule,
        access: realEstateAccess,
        contact: realEstateContact,
        oversize_contact: realEstateOversizeContact,
        discount_code: realEstateDiscountCode,
        special_requests: specialRequests,
        additional_info: additionalInfo,
        subtotal: realEstateSubtotal,
        estimated_total: realEstateTotal,
        estimated_shoot_duration_minutes: realEstateEstimatedDurationMinutes,
        estimated_shoot_duration_label: realEstateEstimatedDurationLabel,
      };
    }

    if (serviceType === ServiceType.VACANT_LAND) {
      return {
        ...basePayload,
        booking_path: "vacant_land",
        property: landProperty,
        selected_package: VACANT_LAND_ITEMS.find((item) => item.id === landSelection)?.label ?? "",
        selections: landSelection ? [landSelection] : [],
        schedule: landSchedule,
        access: landAccess,
        contact: landContact,
        estimated_total: landTotal,
        estimated_shoot_duration_minutes: landEstimatedDurationMinutes,
        estimated_shoot_duration_label: landEstimatedDurationLabel,
      };
    }

    return {
      ...basePayload,
      booking_path: "social_media",
      contact: socialContact,
    };
  };

  const realEstateCanAdvance = () => {
    if (realEstateStep === 1) {
      return Boolean(realEstateProperty.address.trim() && realEstateSqftTier && !isOversize);
    }
    if (realEstateStep === 2) {
      return realEstatePackageOrAlaCarteSelected;
    }
    if (realEstateStep === 4) {
      const hasSchedule = Boolean(realEstateSchedule.schedulerKey && realEstateSchedule.schedulerUrl);
      if (!hasSchedule) return false;
      if (!requiresVideoQuestions) return true;
      return Boolean(
        videoQuestions.highlights.trim() &&
          videoQuestions.music.trim() &&
          videoQuestions.vibe.trim()
      );
    }
    return true;
  };

  const landCanAdvance = () => {
    if (landStep === 1) {
      return Boolean(landProperty.address.trim());
    }
    if (landStep === 2) {
      return Boolean(landSelection);
    }
    return true;
  };

  const applyServicesDraft = (draft: Record<string, any>) => {
    if (draft.draft_id) {
      servicesDraftIdRef.current = draft.draft_id;
    }
    if (draft.serviceType) {
      setServiceType(draft.serviceType as ServiceTypeKey);
    }
    if (typeof draft.realEstateStep === "number") {
      setRealEstateStep(draft.realEstateStep);
    }
    if (typeof draft.landStep === "number") {
      setLandStep(draft.landStep);
    }
    if (draft.realEstateProperty) {
      setRealEstateProperty(draft.realEstateProperty);
    }
    if (draft.realEstatePackage) {
      setRealEstatePackage(draft.realEstatePackage as PackageKey);
    }
    if (Array.isArray(draft.realEstateSelections)) {
      setRealEstateSelections(draft.realEstateSelections);
    }
    if (typeof draft.detailOption === "string") setDetailOption(draft.detailOption);
    if (typeof draft.twilightOption === "string") setTwilightOption(draft.twilightOption);
    if (typeof draft.stagingOption === "string") setStagingOption(draft.stagingOption);
    if (typeof draft.landmarkOption === "string") setLandmarkOption(draft.landmarkOption);
    if (typeof draft.droneClipOption === "string") setDroneClipOption(draft.droneClipOption);
    if (typeof draft.amenityPhotos === "boolean") setAmenityPhotos(draft.amenityPhotos);
    if (typeof draft.luxuryReelOption === "string") setLuxuryReelOption(draft.luxuryReelOption);
    if (typeof draft.socialReelOption === "string") setSocialReelOption(draft.socialReelOption);
    if (typeof draft.specialRequests === "string") setSpecialRequests(draft.specialRequests);
    if (typeof draft.additionalInfo === "string") setAdditionalInfo(draft.additionalInfo);
    if (draft.videoQuestions) setVideoQuestions(draft.videoQuestions);
    if (draft.realEstateSchedule) {
      setRealEstateSchedule(draft.realEstateSchedule);
    }
    if (draft.realEstateAccess) setRealEstateAccess(draft.realEstateAccess);
    if (draft.realEstateContact) setRealEstateContact(draft.realEstateContact);
    if (draft.realEstateOversizeContact) setRealEstateOversizeContact(draft.realEstateOversizeContact);
    if (typeof draft.realEstateDiscountCode === "string") setRealEstateDiscountCode(draft.realEstateDiscountCode);
    if (typeof draft.realEstateDetailsSaved === "boolean") setRealEstateDetailsSaved(draft.realEstateDetailsSaved);
    if (draft.landProperty) setLandProperty(draft.landProperty);
    if (typeof draft.landSelection === "string") setLandSelection(draft.landSelection);
    if (draft.landSchedule) {
      setLandSchedule(draft.landSchedule);
    }
    if (draft.landAccess) setLandAccess(draft.landAccess);
    if (draft.landContact) setLandContact(draft.landContact);
    if (typeof draft.landDetailsSaved === "boolean") setLandDetailsSaved(draft.landDetailsSaved);
    if (draft.socialContact) setSocialContact(draft.socialContact);
  };

  useEffect(() => {
    if (typeof window === "undefined" || servicesDraftRestoredRef.current) return;

    const rawDraft = localStorage.getItem(SERVICES_DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      servicesDraftRestoredRef.current = true;
      return;
    }

    try {
      const draft = JSON.parse(rawDraft) as Record<string, any>;
      setPendingServicesDraft(draft);
      setDraftDecisionOpen(true);
    } catch {
      localStorage.removeItem(SERVICES_DRAFT_STORAGE_KEY);
      servicesDraftRestoredRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !servicesDraftRestoredRef.current) return;

    if (!serviceType) {
      localStorage.removeItem(SERVICES_DRAFT_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      SERVICES_DRAFT_STORAGE_KEY,
      JSON.stringify({
        draft_id: servicesDraftIdRef.current,
        saved_at: new Date().toISOString(),
        serviceType,
        realEstateStep,
        landStep,
        realEstateProperty,
        realEstatePackage,
        realEstateSelections,
        detailOption,
        twilightOption,
        stagingOption,
        landmarkOption,
        droneClipOption,
        amenityPhotos,
        luxuryReelOption,
        socialReelOption,
        specialRequests,
        additionalInfo,
        videoQuestions,
        realEstateSchedule,
        realEstateAccess,
        realEstateContact,
        realEstateOversizeContact,
        realEstateDiscountCode,
        realEstateDetailsSaved,
        landProperty,
        landSelection,
        landSchedule,
        landAccess,
        landContact,
        landDetailsSaved,
        socialContact,
      }),
    );

    servicesAbandonmentSentRef.current = false;
  }, [
    additionalInfo,
    amenityPhotos,
    detailOption,
    droneClipOption,
    landmarkOption,
    landAccess,
    landContact,
    landProperty,
    landSchedule,
    landSelection,
    landStep,
    luxuryReelOption,
    realEstateAccess,
    realEstateContact,
    realEstateDiscountCode,
    realEstateOversizeContact,
    realEstatePackage,
    realEstateProperty,
    realEstateSchedule,
    realEstateSelections,
    realEstateStep,
    realEstateDetailsSaved,
    serviceType,
    socialContact,
    socialReelOption,
    specialRequests,
    stagingOption,
    twilightOption,
    videoQuestions,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDraftAbandonment = () => {
      if (
        servicesSubmissionFinalizedRef.current ||
        servicesAbandonmentSentRef.current ||
        !serviceType
      ) {
        return;
      }

      const payload = buildServicesAbandonmentPayload();
      if (!payload) return;

      servicesAbandonmentSentRef.current = true;
      sendBackupEmailFromPayloadKeepalive(payload, {
        source: "services_booking_flow_abandoned",
        subject: "Abandoned Booking Draft",
      });
      sendGoogleSheetsFromPayloadKeepalive(payload, "services_booking_flow_abandoned");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleDraftAbandonment();
      }
    };

    window.addEventListener("pagehide", handleDraftAbandonment);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handleDraftAbandonment);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    additionalInfo,
    amenityPhotos,
    detailOption,
    droneClipOption,
    isOversize,
    landmarkOption,
    landAccess,
    landContact,
    landProperty,
    landSchedule,
    landSelection,
    landStep,
    landDetailsSaved,
    landTotal,
    luxuryReelOption,
    realEstateAccess,
    realEstateContact,
    realEstateOversizeContact,
    realEstatePackage,
    realEstateProperty,
    realEstateSchedule,
    realEstateSelections,
    realEstateStep,
    realEstateTotal,
    serviceType,
    socialContact,
    socialReelOption,
    specialRequests,
    stagingOption,
    twilightOption,
    videoQuestions,
  ]);

  useEffect(() => {
    if (!serviceType || !flowTopRef.current) return;

    const node = flowTopRef.current;

    requestAnimationFrame(() => {
      const targetTop = node.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    });
  }, [serviceType, realEstateStep, landStep]);

  const resetRealEstate = () => {
    setRealEstateStep(1);
    setRealEstateProperty({ address: "", sqft: "" });
    setRealEstatePackage(null);
    setRealEstateSelections([]);
    setDetailOption("");
    setTwilightOption("");
    setStagingOption("");
    setLandmarkOption("");
    setDroneClipOption("");
    setAmenityPhotos(false);
    setLuxuryReelOption("");
    setSocialReelOption("");
    setSpecialRequests("");
    setAdditionalInfo("");
    setVideoQuestions({ highlights: "", music: "", vibe: "" });
    setRealEstateSchedule({
      preferredDate: "",
      preferredTime: "",
      schedulerKey: "dean",
      schedulerName: "Dean",
      schedulerUrl: "https://api.leadconnectorhq.com/widget/booking/V6J170tMMqltADDAZYbZ",
    });
    setRealEstateAccess({
      vacancy: "",
      access: "",
      lockbox: "",
      gateCode: "",
      termsAccepted: false,
      smsMarketing: false,
      smsTransactional: false,
    });
    setRealEstateContact({ fullName: "", email: "", phone: "", servicesNeeded: "" });
    setRealEstateOversizeContact({ fullName: "", email: "", phone: "", servicesNeeded: "" });
    setRealEstateDiscountCode("");
    setRealEstateDetailsSaved(false);
    setRealEstateError(null);
  };

  const resetLand = () => {
    setLandStep(1);
    setLandProperty({ address: "" });
    setLandSelection("");
    setLandSchedule({
      preferredDate: "",
      preferredTime: "",
      schedulerKey: "dean",
      schedulerName: "Dean",
      schedulerUrl: "https://api.leadconnectorhq.com/widget/booking/V6J170tMMqltADDAZYbZ",
    });
    setLandAccess({
      vacancy: "",
      access: "",
      lockbox: "",
      gateCode: "",
      termsAccepted: false,
      smsMarketing: false,
      smsTransactional: false,
    });
    setLandContact({ fullName: "", email: "", phone: "", servicesNeeded: "" });
    setLandDetailsSaved(false);
    setLandError(null);
  };

  const handleResumeDraft = () => {
    if (pendingServicesDraft) {
      applyServicesDraft(pendingServicesDraft);
    }
    setPendingServicesDraft(null);
    setDraftDecisionOpen(false);
    servicesDraftRestoredRef.current = true;
  };

  const handleStartOverDraft = () => {
    clearServicesDraft();
    setPendingServicesDraft(null);
    setDraftDecisionOpen(false);
    setServiceType(null);
    resetRealEstate();
    resetLand();
    setSocialContact({ fullName: "", email: "", phone: "", message: "" });
    servicesDraftRestoredRef.current = true;
  };

  const submitBooking = async (payload: Record<string, unknown>, webhookUrl: string, setError: (message: string | null) => void, setSubmitting: (value: boolean) => void) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch(webhookUrl, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
      return true;
    } catch {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          keepalive: true,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(payload),
        });
        return true;
      } catch {
        const ok = navigator.sendBeacon(webhookUrl, JSON.stringify(payload));
        if (!ok) {
          setError("We couldn't submit the form right now. Please try again.");
          return false;
        }
        return true;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const saveRealEstateDetails = async () => {
    if (!realEstateSubmissionDetailsComplete) {
      setRealEstateError("Please complete every required field before continuing to the booking calendar.");
      return;
    }
    if (!realEstateAccess.termsAccepted) {
      setRealEstateError("Please agree to the terms before continuing to the booking calendar.");
      return;
    }
    const webhookUrl = realEstatePackage ? PACKAGE_WEBHOOK_URLS[realEstatePackage] : PACKAGE_WEBHOOK_URLS.standard;
    const selections = getRealEstatePayloadSelections({
      realEstateSelections,
      detailOption,
      twilightOption,
      stagingOption,
      landmarkOption,
      droneClipOption,
      amenityPhotos,
      luxuryReelOption,
      socialReelOption,
    });
    const baseLineItems = getRealEstateLineItems({
      realEstatePackage,
      realEstateSqftTier,
      realEstateSelections,
      detailOption,
      twilightOption,
      stagingOption,
      landmarkOption,
      droneClipOption,
      amenityPhotos,
      luxuryReelOption,
      socialReelOption,
    });
    const discountLineItems = getDiscountLineItems({
      videoDiscount: realEstateVideoDiscount,
      promoCode: realEstateDiscountCode,
      promoDiscount: realEstateDiscountCodeAmount,
    });
    const lineItems = [...baseLineItems, ...discountLineItems];
    const payload = {
      form_type: "booking",
      website_booking_id: servicesDraftIdRef.current,
      booking_path: "real_estate",
      package: realEstatePackage ? PACKAGE_DISPLAY[realEstatePackage].name : "A La Carte",
      sqft: realEstateSqftValue,
      sqft_tier: realEstateSqftTier || null,
      property_address: realEstateProperty.address,
      selections,
      subtotal: realEstateSubtotal,
      discounts: {
        video_order_discount: {
          applied: realEstateVideoDiscount > 0,
          rate: VIDEO_ORDER_DISCOUNT_RATE,
          amount: realEstateVideoDiscount,
        },
        promo_code: {
          code: realEstateDiscountCode.trim(),
          applied: realEstateDiscountCodeAmount > 0,
          rate: realEstateDiscountCodeRate,
          amount: realEstateDiscountCodeAmount,
        },
      },
      line_items: lineItems,
      invoice_line_items: lineItems,
      invoice_line_items_json: JSON.stringify(lineItems),
      invoice_line_items_stripe_form: getStripeInvoiceLinesBody(lineItems),
      invoice_line_items_text: getInvoiceLineItemsText(lineItems),
      invoice_summary: getInvoiceSummary(lineItems, realEstateTotal, realEstateProperty.address),
      invoice_total_label: currency(realEstateTotal),
      video_questions: videoQuestions,
      schedule: realEstateSchedule,
      access: {
        vacancy: realEstateAccess.vacancy,
        access: realEstateAccess.access,
        lockbox: realEstateAccess.lockbox,
        gate_code: realEstateAccess.gateCode,
      },
      contact: realEstateContact,
      estimated_shoot_duration_minutes: realEstateEstimatedDurationMinutes,
      estimated_shoot_duration_label: realEstateEstimatedDurationLabel,
      special_requests: specialRequests,
      additional_info: additionalInfo,
      sms_consents: {
        marketing: realEstateAccess.smsMarketing,
        transactional: realEstateAccess.smsTransactional,
      },
      estimated_total: realEstateTotal,
      submitted_at: new Date().toISOString(),
      source_page: window.location.href,
    };

    const ok = await submitBooking(payload, webhookUrl, setRealEstateError, setRealEstateSubmitting);
    if (ok) {
      sendBackupEmailFromPayload(payload, {
        source: "services_real_estate_booking_flow",
        subject: `Backup Copy - ${realEstatePackage ? PACKAGE_DISPLAY[realEstatePackage].name : "A La Carte"} Booking`,
      });
      sendGoogleSheetsFromPayload(payload, "services_real_estate_booking_flow");
      localStorage.setItem("hgv_lead_name", realEstateContact.fullName);
      localStorage.setItem("hgv_lead_email", realEstateContact.email);
      localStorage.setItem("hgv_lead_phone", realEstateContact.phone);
      localStorage.setItem(
        "hgv_booking_summary",
        JSON.stringify({
          package_name: realEstatePackage ? PACKAGE_DISPLAY[realEstatePackage].name : "A La Carte",
          address: realEstateProperty.address,
          shoot_date: realEstateSchedule.preferredDate,
          shoot_time: realEstateSchedule.preferredTime,
          estimated_total: realEstateTotal,
        }),
      );
      servicesSubmissionFinalizedRef.current = true;
      clearServicesDraft();
      setRealEstateDetailsSaved(true);
      setRealEstateStep(5);
    }
  };

  const handleOversizeSubmit = async () => {
    if (!realEstateOversizeContact.fullName || !realEstateOversizeContact.email || !realEstateOversizeContact.phone) {
      setRealEstateError("Please provide your name, email, and phone number for a quote.");
      return;
    }
    const payload = {
      form_type: "quote_request",
      website_booking_id: servicesDraftIdRef.current,
      booking_path: "real_estate_oversize",
      sqft: realEstateSqftValue,
      property_address: realEstateProperty.address,
      contact: realEstateOversizeContact,
      submitted_at: new Date().toISOString(),
      source_page: window.location.href,
    };
    sendBackupEmailFromPayload(payload, {
      source: "services_real_estate_oversize_quote",
      subject: "Backup Copy - Oversize Property Quote Request",
    });
    sendGoogleSheetsFromPayload(payload, "services_real_estate_oversize_quote");
    const ok = await submitBooking(
      payload,
      "https://hook.us2.make.com/djesf139g8ta197lajuxabzyyumlmiti",
      setRealEstateError,
      setRealEstateSubmitting,
    );
    if (ok) {
      servicesSubmissionFinalizedRef.current = true;
      clearServicesDraft();
      localStorage.setItem("hgv_lead_email", realEstateOversizeContact.email);
      localStorage.setItem(
        "hgv_booking_summary",
        JSON.stringify({
          package_name: "Custom Quote (5,500+ sqft)",
          address: realEstateProperty.address,
          shoot_date: "",
          shoot_time: "",
          estimated_total: 0,
        }),
      );
      navigate("/confirmation");
    }
  };

  const saveLandDetails = async () => {
    if (!landAccess.termsAccepted) {
      setLandError("Please agree to the terms before continuing to the booking calendar.");
      return;
    }
    const webhookUrl =
      landSelection === "land_package"
        ? "https://hook.us2.make.com/aysxphkcy7v9vmbhye2rexq2u42xxxit"
        : PACKAGE_WEBHOOK_URLS.standard;
    const landItem = VACANT_LAND_ITEMS.find((item) => item.id === landSelection);
    const payload = {
      form_type: "booking",
      website_booking_id: servicesDraftIdRef.current,
      booking_path: "vacant_land",
      property_address: landProperty.address,
      selections: landSelection ? [landSelection] : [],
      package: landItem?.label ?? null,
      schedule: landSchedule,
      contact: landContact,
      estimated_shoot_duration_minutes: landEstimatedDurationMinutes,
      estimated_shoot_duration_label: landEstimatedDurationLabel,
      sms_consents: {
        marketing: landAccess.smsMarketing,
        transactional: landAccess.smsTransactional,
      },
      estimated_total: landTotal,
      submitted_at: new Date().toISOString(),
      source_page: window.location.href,
    };

    const ok = await submitBooking(payload, webhookUrl, setLandError, setLandSubmitting);
    if (ok) {
      sendBackupEmailFromPayload(payload, {
        source: "services_vacant_land_booking_flow",
        subject: `Backup Copy - ${landItem?.label ?? "Vacant Land"} Booking`,
      });
      sendGoogleSheetsFromPayload(payload, "services_vacant_land_booking_flow");
      localStorage.setItem("hgv_lead_name", landContact.fullName);
      localStorage.setItem("hgv_lead_email", landContact.email);
      localStorage.setItem("hgv_lead_phone", landContact.phone);
      localStorage.setItem(
        "hgv_booking_summary",
        JSON.stringify({
          package_name: landItem?.label ?? "Vacant Land",
          address: landProperty.address,
          shoot_date: landSchedule.preferredDate,
          shoot_time: landSchedule.preferredTime,
          estimated_total: landTotal,
        }),
      );
      servicesSubmissionFinalizedRef.current = true;
      clearServicesDraft();
      setLandDetailsSaved(true);
    }
  };

  return (
    <section id="services" className="px-2 sm:px-4 pt-14 pb-18 sm:pt-20 sm:pb-24 bg-white">
      {draftDecisionOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#08101f]/58 px-4 backdrop-blur-[3px]">
          <div className="w-full max-w-[520px] rounded-[30px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,250,255,0.96)_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:p-8">
            <p
              className="text-[#2FA4A9] text-[12px] tracking-[0.18em] uppercase"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
            >
              Saved draft found
            </p>
            <h3
              className="mt-3 text-[#1F2D5A] text-[28px] sm:text-[34px]"
              style={{
                fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
                fontWeight: 600,
                lineHeight: 1.05,
              }}
            >
              Resume where you left off?
            </h3>
            <p
              className="mt-4 text-[#51607b] text-[15px] sm:text-[16px]"
              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.7 }}
            >
              We found a saved booking draft on this device. You can pick up where you left off or start over with a fresh form.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleResumeDraft}
                className="flex-1 h-12 rounded-full bg-[#1F3A5F] px-6 text-[14px] text-white shadow-[0_18px_34px_rgba(31,58,95,0.18)] transition hover:bg-[#162846]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Resume draft
              </button>
              <button
                type="button"
                onClick={handleStartOverDraft}
                className="flex-1 h-12 rounded-full border border-[#d7e1ee] bg-white px-6 text-[14px] text-[#1F3A5F] transition hover:bg-[#f5f8fc]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      )}
      <div ref={flowTopRef} className="max-w-[1620px] mx-auto rounded-[32px] px-4 sm:px-8 py-12 sm:py-14 border border-[#eef1f6] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
        <div className="text-center mb-10 sm:mb-12">
          <p
            className="text-[#2FA4A9] text-[12px] tracking-[0.08em] mb-3"
            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
          >
            Services
          </p>
          <h2
            className="text-[#1F3A5F] text-[32px] sm:text-[40px] md:text-[44px]"
            style={{
              fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
              fontWeight: 700,
            }}
          >
            Outstanding media produces results.
          </h2>
          <p
            className="text-[#1F3A5F]/70 text-[16px] sm:text-[18px] md:text-[20px] max-w-[700px] mx-auto mt-4"
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Strategic content that closes deals faster, keeps your calendar packed, and makes your name impossible to ignore.
          </p>
        </div>

        {!serviceType && (
          <SectionShell>
            <div className="text-center">
              <p
                className="text-[#1F3A5F] text-[13px] tracking-[0.08em]"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
              >
                Step 1
              </p>
              <h3
                className="text-[#1F2D5A] text-[28px] sm:text-[36px] mt-3"
                style={{
                  fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif",
                  fontWeight: 600,
                }}
              >
                Select a service type
              </h3>
              <p
                className="text-[#51607b] text-[15px] sm:text-[16px] max-w-[540px] mx-auto mt-3"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
              >
                Nothing else shows on this page. Choose where you’d like to start, and we’ll guide you through the booking flow.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  key: ServiceType.REAL_ESTATE,
                  label: "Real Estate",
                  detail: "Full listing media for residential and commercial properties.",
                  cta: "Select real estate",
                  image: SERVICE_CARD_IMAGES.real_estate,
                },
                {
                  key: ServiceType.VACANT_LAND,
                  label: "Vacant Land",
                  detail: "Drone + ground coverage that sells location and acreage.",
                  cta: "Select vacant land",
                  image: SERVICE_CARD_IMAGES.vacant_land,
                },
                {
                  key: ServiceType.SOCIAL_MEDIA,
                  label: "Social Media Marketing",
                  detail: "Scroll-stopping content and strategy to grow your brand.",
                  cta: "Select social media",
                  image: SERVICE_CARD_IMAGES.social_media,
                },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setServiceType(option.key)}
                  className="text-left rounded-[24px] border border-[#e6ebf2] bg-white p-6 sm:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className="h-36 sm:h-40 rounded-[18px] bg-cover bg-center mb-5"
                    style={{ backgroundImage: `url(${option.image})` }}
                  />
                  <p
                    className="text-[24px] text-[#3a4257]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {option.label}
                  </p>
                  <p
                    className="mt-3 text-[14px] text-[#525b71]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
                  >
                    {option.detail}
                  </p>
                  <span
                    className="mt-6 h-11 w-full rounded-full border border-[#e2e8f0] bg-white text-[#424b62] text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#f4f6fb] transition-colors"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                  >
                    {option.cta}
                    <ChevronRight size={16} />
                  </span>
                </button>
              ))}
            </div>
          </SectionShell>
        )}

        {serviceType === ServiceType.SOCIAL_MEDIA && (
          <SectionShell>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[#1F3A5F] text-[13px] tracking-[0.08em]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>Social media marketing</p>
                <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px] mt-2" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Tell us what you’re looking for</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearServicesDraft();
                  setServiceType(null);
                  resetRealEstate();
                  resetLand();
                }}
                className="text-[#1F3A5F] text-[13px] font-semibold underline"
              >
                Start over
              </button>
            </div>
            <p className="text-[#51607b] text-[15px] sm:text-[16px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.6 }}>
              Share a few details and Dean will follow up personally. No pricing or calendar required for this path.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const payload = new URLSearchParams();
                const formData = new FormData(event.currentTarget);
                sendBackupEmailFromFormData(formData, {
                  source: "services_social_media_marketing_flow",
                  subject: "Backup Copy - Social Media Marketing Inquiry",
                });
                sendGoogleSheetsFromFormData(formData, "services_social_media_marketing_flow");
                formData.forEach((value, key) => {
                  if (typeof value === "string") payload.append(key, value);
                });
                payload.append("source", "services_social_media_marketing_flow");
                payload.append("submitted_at", new Date().toISOString());

                fetch("https://formsubmit.co/homegrownventuresllc@gmail.com", {
                  method: "POST",
                  mode: "no-cors",
                  headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                  body: payload.toString(),
                  keepalive: true,
                }).catch(() => undefined);

                if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
                  const blob = new Blob([payload.toString()], { type: "application/x-www-form-urlencoded;charset=UTF-8" });
                  navigator.sendBeacon(SOCIAL_MEDIA_WEBHOOK_URL, blob);
                } else {
                  fetch(SOCIAL_MEDIA_WEBHOOK_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                    body: payload.toString(),
                    keepalive: true,
                  }).catch(() => undefined);
                }

                servicesSubmissionFinalizedRef.current = true;
                clearServicesDraft();
                localStorage.setItem("hgv_lead_email", socialContact.email);
                localStorage.setItem(
                  "hgv_booking_summary",
                  JSON.stringify({
                    package_name: "Social Media Marketing",
                    address: "",
                    shoot_date: "",
                    shoot_time: "",
                    estimated_total: 0,
                  }),
                );
                navigate("/confirmation");
              }}
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <input type="hidden" name="_subject" value="New Social Media Marketing Inquiry" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input
                name="full_name"
                required
                value={socialContact.fullName}
                onChange={(e) => setSocialContact((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full Name"
                className={FORM_INPUT_BASE}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <input
                type="email"
                name="email"
                required
                value={socialContact.email}
                onChange={(e) => setSocialContact((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email Address"
                className={FORM_INPUT_BASE}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <input
                name="phone"
                required
                value={socialContact.phone}
                onChange={(e) => setSocialContact((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone Number"
                className={FORM_INPUT_BASE}
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <textarea
                name="message"
                required
                value={socialContact.message}
                onChange={(e) => setSocialContact((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Message / What are you looking for?"
                rows={4}
                className="sm:col-span-2 px-4 py-3 rounded-[14px] border border-[#d7e7f2] bg-white/95 outline-none focus:border-[#2FA4A9] focus:ring-2 focus:ring-[#a9e1e4]/40 transition resize-y"
                style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
              />
              <div className="sm:col-span-2">
                <button type="submit" className={PRIMARY_BUTTON} style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                  Submit inquiry
                </button>
              </div>
            </form>
          </SectionShell>
        )}

        {serviceType === ServiceType.VACANT_LAND && (
          <div className="space-y-6">
            <SectionShell>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[#111111] text-[13px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                  Vacant Land
                </p>
                <p className="text-[#6b7280] text-[13px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
                  Step {landStep} of 3
                </p>
              </div>
              <div className="mt-4">
                <StepTimeline steps={["Property", "Package", "Book"]} activeStep={landStep} />
              </div>
            </SectionShell>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  clearServicesDraft();
                  setServiceType(null);
                  resetRealEstate();
                  resetLand();
                }}
                className="text-[#1F3A5F] text-[13px] font-semibold underline"
              >
                Start over
              </button>
            </div>

            {landStep === 1 && (
              <SectionShell>
                <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Property details</h3>
                <p className="text-[#51607b] text-[15px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>Enter the address and we’ll take it from there.</p>
                <AddressAutocompleteInput
                  value={landProperty.address}
                  onChange={(value) => setLandProperty({ address: value })}
                  placeholder="Property Address"
                  className={`mt-5 w-full ${FORM_INPUT_BASE}`}
                />
              </SectionShell>
            )}

            {landStep === 2 && (
              <SectionShell>
                <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Select services</h3>
                <p className="text-[#51607b] text-[15px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                  Vacant land pricing is flat-rate. Choose a package below to continue.
                </p>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {VACANT_LAND_ITEMS.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start justify-between gap-3 px-4 py-4 ${CARD_BASE} ${landSelection === item.id ? "border-[#1F2D5A]" : ""}`}
                    >
                      <span className="flex items-start gap-2 text-[15px] text-[#1F2D5A]">
                        <input
                          type="radio"
                          name="land-package"
                          checked={landSelection === item.id}
                          onChange={() => setLandSelection(item.id)}
                        />
                        <span>
                          <span className="font-semibold">{item.label}</span>
                          {item.description && (
                            <span className="block text-[12px] text-[#6b768c] mt-1">{item.description}</span>
                          )}
                        </span>
                      </span>
                      <span className="text-[#1F2D5A] font-semibold whitespace-nowrap">{currency(item.price)}</span>
                    </label>
                  ))}
                </div>
                {landSelection === "land_package" && (
                  <p
                    className="mt-4 text-[12px] text-[#5a6b86]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                  >
                    This package submits through our dedicated Vacant Land pipeline for faster turnaround.
                  </p>
                )}
              </SectionShell>
            )}

            {landStep === 3 && (
              <SectionShell>
                <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Finalize details &amp; book</h3>
                <p className="text-[#51607b] text-[15px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                  Submit your property details first. Once the webhook accepts them, the booking calendar appears right here as the final step.
                </p>

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <input
                    value={landContact.fullName}
                    onChange={(e) => setLandContact((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Full Name"
                    className={FORM_INPUT_BASE}
                  />
                  <input
                    type="email"
                    value={landContact.email}
                    onChange={(e) => setLandContact((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email Address"
                    className={FORM_INPUT_BASE}
                  />
                  <input
                    value={landContact.phone}
                    onChange={(e) => setLandContact((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone Number"
                    className={FORM_INPUT_BASE}
                  />
                  <input
                    value={landContact.servicesNeeded}
                    onChange={(e) => setLandContact((prev) => ({ ...prev, servicesNeeded: e.target.value }))}
                    placeholder="Services Needed (optional)"
                    className={FORM_INPUT_BASE}
                  />
                </div>

                <div className={`mt-6 p-4 text-[14px] text-[#43526d] ${CARD_BASE}`}>
                  <p className="font-semibold text-[#1F2D5A]">Order summary</p>
                  <ul className="mt-2 space-y-1">
                    {landSelection ? (
                      (() => {
                        const item = VACANT_LAND_ITEMS.find((x) => x.id === landSelection);
                        if (!item) return <li>No package selected yet.</li>;
                        return (
                          <li className="flex justify-between">
                            <span>{item.label}</span>
                            <span className="font-semibold">{currency(item.price)}</span>
                          </li>
                        );
                      })()
                    ) : (
                      <li>No package selected yet.</li>
                    )}
                    <li className="flex justify-between">
                      <span>Calendar</span>
                      <span className="font-semibold">{landSchedule.schedulerName || "Not selected"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Estimated shoot time</span>
                      <span className="font-semibold">{landEstimatedDurationLabel}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Rounded booking bucket</span>
                      <span className="font-semibold">{landDurationBucket ? `${landDurationBucket} min` : "Unavailable"}</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-[#1F2D5A] font-semibold">Total: {currency(landTotal)}</p>
                </div>

                <div className="mt-5 space-y-3 text-[13px] text-[#41516b]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}>
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={landAccess.smsMarketing}
                      onChange={(e) => setLandAccess({ ...landAccess, smsMarketing: e.target.checked })}
                    />
                    <span>
                      I consent to receive marketing text messages about special offers, discounts, and service updates. Message frequency may vary. Msg &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={landAccess.smsTransactional}
                      onChange={(e) => setLandAccess({ ...landAccess, smsTransactional: e.target.checked })}
                    />
                    <span>
                      I consent to receive non-marketing texts about booking confirmations, reminders, and delivery updates. Message frequency may vary. Msg &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={landAccess.termsAccepted}
                      onChange={(e) => setLandAccess({ ...landAccess, termsAccepted: e.target.checked })}
                    />
                    <span>
                      I agree to the <a href="/terms-of-service" target="_blank" rel="noreferrer" className="underline">Terms &amp; Conditions</a>.
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={landSubmitting || !landAccess.termsAccepted || !landContactComplete}
                    onClick={saveLandDetails}
                    className={PRIMARY_BUTTON}
                  >
                    {landSubmitting ? "Submitting..." : landDetailsSaved ? "Details submitted" : "Submit details & continue to booking"}
                  </button>
                </div>

                {landDetailsSaved && (
                  <div className="mt-6">
                    <LeadConnectorScheduler
                      label="Book your time"
                      description="Your project details are submitted. Choose your preferred time below and our team will reach out to confirm exact time shortly."
                      options={availableLandSchedulers}
                      selectedKey={landSchedule.schedulerKey}
                      assignmentMode="auto"
                      prefillContact={landContact}
                      onSelect={(option) =>
                        setLandSchedule((prev) => ({
                          ...prev,
                          schedulerKey: option.key,
                          schedulerName: option.name,
                          schedulerUrl: option.bookingUrl,
                        }))
                      }
                    />
                  </div>
                )}

                {landError && <p className="text-[#c84848] mt-3">{landError}</p>}
              </SectionShell>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setLandStep((prev) => Math.max(1, prev - 1))}
                disabled={landStep === 1 || landSubmitting}
                className={SECONDARY_BUTTON}
              >
                Back
              </button>
              {landStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!landCanAdvance()) return;
                    setLandStep((prev) => Math.min(3, prev + 1));
                  }}
                  disabled={!landCanAdvance()}
                  className={PRIMARY_BUTTON}
                >
                  Next
                </button>
              ) : null}
            </div>
            <div className="flex justify-end">
              <p className="text-[#111111] text-[15px] font-semibold">
                Running total: {currency(landTotal)}
              </p>
            </div>
          </div>
        )}

        {serviceType === ServiceType.REAL_ESTATE && (
          <div className="space-y-6">
            <SectionShell>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[#111111] text-[13px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>
                  Real Estate
                </p>
                <p className="text-[#6b7280] text-[13px]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}>
                  Step {realEstateStep} of 5
                </p>
              </div>
              <div className="mt-4">
                <StepTimeline
                  steps={["Property", "Packages", "Add-ons", "Details", "Book"]}
                  activeStep={realEstateStep}
                />
              </div>
            </SectionShell>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  clearServicesDraft();
                  setServiceType(null);
                  resetRealEstate();
                  resetLand();
                }}
                className="text-[#1F3A5F] text-[13px] font-semibold underline"
              >
                Start over
              </button>
            </div>

            {realEstateStep === 1 && (
              <SectionShell>
                <div className="grid md:grid-cols-[0.85fr_1.15fr] lg:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
                  <MediaPanel
                    image={realEstateHero}
                    label="Step 01"
                    title="Tell us about the property"
                    subtitle="Address + size keeps pricing accurate."
                  />
                  <div>
                    <h3 className="text-[#111111] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>
                      Property details
                    </h3>
                    <p className="text-[#51607b] text-[15px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                      Square footage drives all pricing on the next page.
                    </p>
                    <div className="mt-5 grid sm:grid-cols-2 gap-4">
                      <AddressAutocompleteInput
                        value={realEstateProperty.address}
                        onChange={(value) => setRealEstateProperty((prev) => ({ ...prev, address: value }))}
                        placeholder="Property Address"
                        className={`sm:col-span-2 w-full ${FORM_INPUT_BASE}`}
                      />
                      <select
                        value={realEstateProperty.sqft}
                        onChange={(e) => setRealEstateProperty((prev) => ({ ...prev, sqft: e.target.value }))}
                        className={FORM_INPUT_BASE}
                      >
                        <option value="">Property Size</option>
                        <option value="Under 1500 sq ft">Under 1500 sq ft</option>
                        <option value="1500-2499 sqft">1500-2499 sqft</option>
                        <option value="2500-3999 sqft">2500-3999 sqft</option>
                        <option value="4000-5499 sqft">4000-5499 sqft</option>
                        <option value="5500+ sqft">5500+ sqft</option>
                      </select>
                    </div>
                    {isOversize && (
                      <div className="mt-6 rounded-[18px] border border-[#f4d6b1] bg-[#fff7ee] p-5">
                        <p className="text-[#8c5a1e] text-[14px] font-semibold" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Any property over 5,500 sqft we create a quote for.
                        </p>
                        <p className="text-[#7b6a57] text-[13px] mt-2" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                          Share your details and we’ll follow up with a custom quote.
                        </p>
                        <div className="mt-4 grid sm:grid-cols-2 gap-3">
                          <input
                            value={realEstateOversizeContact.fullName}
                            onChange={(e) => setRealEstateOversizeContact((prev) => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Full Name"
                            className={FORM_INPUT_BASE}
                          />
                          <input
                            type="email"
                            value={realEstateOversizeContact.email}
                            onChange={(e) => setRealEstateOversizeContact((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="Email Address"
                            className={FORM_INPUT_BASE}
                          />
                          <input
                            value={realEstateOversizeContact.phone}
                            onChange={(e) => setRealEstateOversizeContact((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="Phone Number"
                            className={FORM_INPUT_BASE}
                          />
                          <input
                            value={realEstateOversizeContact.servicesNeeded}
                            onChange={(e) => setRealEstateOversizeContact((prev) => ({ ...prev, servicesNeeded: e.target.value }))}
                            placeholder="Services Needed"
                            className={FORM_INPUT_BASE}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleOversizeSubmit}
                          disabled={realEstateSubmitting}
                          className={`mt-4 w-full ${PRIMARY_BUTTON}`}
                        >
                          {realEstateSubmitting ? "Submitting..." : "Request a quote"}
                        </button>
                        {realEstateError && <p className="text-[#c84848] mt-3">{realEstateError}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </SectionShell>
            )}

            {realEstateStep === 2 && (
              <SectionShell>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Packages &amp; A La Carte</h3>
                  <button
                    type="button"
                    onClick={() => setRealEstatePackage(null)}
                    className="text-[13px] text-[#1F3A5F] underline"
                  >
                    Skip packages
                  </button>
                </div>
                {!realEstatePackageOrAlaCarteSelected && (
                  <p className="mt-4 text-[13px] leading-5 text-[#c84848] font-semibold">
                    Required: select a package or at least one A La Carte item to continue.
                  </p>
                )}
                <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {(Object.keys(PACKAGE_DISPLAY) as PackageKey[]).map((key) => {
                    const pkg = PACKAGE_DISPLAY[key];
                    const isActive = realEstatePackage === key;
                    const price = realEstateSqftTier ? BASE_PRICES[key][realEstateSqftTier] : null;
                    return (
                      <button
                        key={pkg.key}
                        type="button"
                        onClick={() => setRealEstatePackage((current) => (current === key ? null : key))}
                        className={`text-left rounded-[24px] border p-6 sm:p-7 transition-all bg-white/95 ${isActive ? "border-[#1F2D5A] shadow-[0_12px_26px_rgba(31,58,95,0.16)]" : "border-[#e4e6ef] shadow-[0_4px_16px_rgba(31,58,95,0.06)]"}`}
                      >
                        <div
                          className="h-36 md:h-40 xl:h-44 rounded-[18px] bg-cover bg-center mb-5"
                          style={{ backgroundImage: `url(${PACKAGE_CARD_IMAGES[key]})` }}
                        />
                        <div className="flex items-start justify-between gap-4">
                          <p
                            className="text-[24px] text-[#3a4257]"
                            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600, lineHeight: 1.2 }}
                          >
                            {pkg.name}
                          </p>
                          {pkg.key === "zillow_showcase" && (
                            <span
                              className="px-4 py-1.5 rounded-full bg-[#1F2D5A] text-white text-[12px] whitespace-nowrap"
                              style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                            >
                              Most Popular
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex items-end gap-2">
                          <p
                            className="text-[28px] text-[#1F2D5A]"
                            style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1 }}
                          >
                            {price ? currency(price) : "Enter sqft"}
                          </p>
                          <p
                            className="text-[14px] mb-1 text-[#4a5269]"
                            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500 }}
                          >
                            /property size
                          </p>
                        </div>

                        <p
                          className="mt-4 text-[14px] text-[#525b71]"
                          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400, lineHeight: 1.55 }}
                        >
                          {pkg.subtitle}
                        </p>

                        <button
                          type="button"
                          className={`mt-6 h-11 w-full rounded-full border flex items-center justify-center text-[13px] transition-colors ${
                            isActive
                              ? "bg-[#1F2D5A] text-white border-[#1F2D5A] hover:bg-[#162249]"
                              : "bg-white text-[#424b62] border-[#e4e6ef] hover:bg-[#f7f8fc]"
                          }`}
                          style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                        >
                          {isActive ? "Deselect package" : "Select package"}
                        </button>

                        <div className="mt-6 pt-5 border-t border-[#e4e6ef]">
                          <p
                            className="text-[14px] text-[#3f4760]"
                            style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                          >
                            Package includes
                          </p>
                          <div className="mt-3 space-y-2">
                            {pkg.includes.map((item) => (
                              <div key={item} className="flex items-start gap-2.5">
                                <Check size={14} className="text-[#2f3f66] mt-1" />
                                <span
                                  className="text-[13px] text-[#4b556c]"
                                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}
                                >
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border-t border-[#e1e8f0] pt-6">
                  <p className="text-[#1F3A5F] text-[14px] uppercase tracking-[0.15em]" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}>A La Carte</p>
                  <div className="mt-5 space-y-6">
                    <div>
                      <p className="text-[#1F2D5A] font-semibold">Video</p>
                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <div className={`px-4 py-3 ${CARD_BASE}`}>
                          <p className="text-[#1F2D5A] text-[14px] font-semibold">30sec Highlight Reel</p>
                          <select value={highlightReelOption} onChange={(e) => setHighlightReelOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                            <option value="">Select an option</option>
                            {REAL_ESTATE_HIGHLIGHT_REEL_OPTIONS.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label} · {currency(option.price)}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-[12px] leading-5 text-[#6b768c]">same as the cinematic video but only property highlights (no agent on-camera)</p>
                        </div>
                        {[...REAL_ESTATE_VIDEO_ITEMS, ...REAL_ESTATE_VIDEO_FLAT_ITEMS].map((item) => (
                          <label key={item.id} className={`flex items-start justify-between gap-3 px-4 py-3 ${CARD_BASE}`}>
                            <span className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1" checked={realEstateSelections.includes(item.id)} onChange={() => toggleSelection(item.id, setRealEstateSelections)} />
                              <span>
                                <span className="block">{item.label}</span>
                                {"description" in item && item.description ? (
                                  <span className="mt-1 block text-[12px] leading-5 text-[#6b768c]">{item.description}</span>
                                ) : null}
                              </span>
                            </span>
                            <span className="font-semibold text-[#1F2D5A]">
                              {item.pricingType === "flat"
                                ? currency(item.price)
                                : realEstateSqftTier
                                ? currency(item.prices[realEstateSqftTier])
                                : "Enter sqft"}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <div className={`px-4 py-3 ${CARD_BASE}`}>
                          <p className="text-[#1F2D5A] text-[14px] font-semibold">Luxury Reel 45–60sec</p>
                          <select value={luxuryReelOption} onChange={(e) => setLuxuryReelOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                            <option value="">Select an option</option>
                            {REAL_ESTATE_LUXURY_REEL_OPTIONS.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label} · {currency(option.price)}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-[12px] text-[#6b768c]">cinematic video with agent on-camera</p>
                        </div>
                        <div className={`px-4 py-3 ${CARD_BASE}`}>
                          <p className="text-[#1F2D5A] text-[14px] font-semibold">Social Media Reel</p>
                          <select value={socialReelOption} onChange={(e) => setSocialReelOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                            <option value="">Select an option</option>
                            {REAL_ESTATE_SOCIAL_REEL_OPTIONS.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label} · {currency(option.price)}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-[12px] text-[#6b768c]">highlight reel with agent on-camera</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#1F2D5A] font-semibold">Photography</p>
                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        {REAL_ESTATE_PHOTO_ITEMS.map((item) => (
                          <label key={item.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${CARD_BASE}`}>
                            <span className="flex items-center gap-2">
                              <input type="checkbox" checked={realEstateSelections.includes(item.id)} onChange={() => toggleSelection(item.id, setRealEstateSelections)} />
                              {item.label}
                            </span>
                            <span className="font-semibold text-[#1F2D5A]">
                              {item.pricingType === "flat"
                                ? currency(item.price)
                                : realEstateSqftTier
                                ? currency(item.prices[realEstateSqftTier])
                                : "Enter sqft"}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[#1F2D5A] font-semibold">Drone</p>
                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        {REAL_ESTATE_DRONE_ITEMS.map((item) => (
                          <label key={item.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${CARD_BASE}`}>
                            <span className="flex items-center gap-2">
                              <input type="checkbox" checked={realEstateSelections.includes(item.id)} onChange={() => toggleSelection(item.id, setRealEstateSelections)} />
                              {item.label}
                            </span>
                            <span className="font-semibold text-[#1F2D5A]">{currency(item.price)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[#1F2D5A] font-semibold">Twilight Photo Session</p>
                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <label className={`flex items-start justify-between gap-3 px-4 py-3 ${CARD_BASE}`}>
                          <span className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" checked={realEstateSelections.includes(REAL_ESTATE_TWILIGHT_SESSION_ID)} onChange={() => toggleSelection(REAL_ESTATE_TWILIGHT_SESSION_ID, setRealEstateSelections)} />
                            <span>
                              <span className="block">Twilight Photo Session</span>
                              <span className="mt-1 block text-[12px] leading-5 text-[#6b768c]">We arrive ~30 minutes before sunset for aerial and ground twilight coverage.</span>
                            </span>
                          </span>
                          <span className="font-semibold text-[#1F2D5A]">{currency(REAL_ESTATE_TWILIGHT_SESSION_PRICE)}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionShell>
            )}

            {realEstateStep === 3 && (
              <SectionShell>
                <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Add-Ons</h3>
                <p className="text-[#51607b] text-[15px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                  Select any editing or photo upgrades you want us to apply after the shoot.
                </p>

                <div className="mt-5 grid md:grid-cols-2 gap-4">
                  <div className={`px-4 py-3 ${CARD_BASE}`}>
                    <p className="text-[#1F2D5A] text-[14px] font-semibold">Virtual Twilight Photos</p>
                    <select value={twilightOption} onChange={(e) => setTwilightOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                      <option value="">Select quantity</option>
                      {REAL_ESTATE_TWILIGHT_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} · {currency(option.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`px-4 py-3 ${CARD_BASE}`}>
                    <p className="text-[#1F2D5A] text-[14px] font-semibold">Detail Photos</p>
                    <select value={detailOption} onChange={(e) => setDetailOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                      <option value="">Select quantity</option>
                      {REAL_ESTATE_DETAIL_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} · {currency(option.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`px-4 py-3 ${CARD_BASE}`}>
                    <p className="text-[#1F2D5A] text-[14px] font-semibold">Landmarks</p>
                    <select value={landmarkOption} onChange={(e) => setLandmarkOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                      <option value="">Select quantity</option>
                      {REAL_ESTATE_LANDMARK_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} · {currency(option.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`px-4 py-3 ${CARD_BASE}`}>
                    <p className="text-[#1F2D5A] text-[14px] font-semibold">Virtual Staging</p>
                    <select value={stagingOption} onChange={(e) => setStagingOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                      <option value="">Select quantity</option>
                      {REAL_ESTATE_VIRTUAL_STAGING_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} · {currency(option.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className={`flex items-center justify-between gap-3 px-4 py-3 ${CARD_BASE}`}>
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={amenityPhotos} onChange={(e) => setAmenityPhotos(e.target.checked)} />
                      Community Amenity Photos
                    </span>
                    <span className="font-semibold text-[#1F2D5A]">{currency(REAL_ESTATE_AMENITY_PRICE)}</span>
                  </label>
                  <div className={`px-4 py-3 ${CARD_BASE}`}>
                    <p className="text-[#1F2D5A] text-[14px] font-semibold">Drone Clips</p>
                    <select value={droneClipOption} onChange={(e) => setDroneClipOption(e.target.value)} className="mt-2 w-full h-10 px-3 rounded-[10px] border border-[#dbe7ef]">
                      <option value="">Select quantity</option>
                      {REAL_ESTATE_DRONE_CLIP_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} · {currency(option.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </SectionShell>
            )}

            {realEstateStep === 4 && (
              <SectionShell>
                <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Finalize details</h3>
                <p className="text-[#51607b] text-[15px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                  Submit your contact, property access, notes, and consent here first. Once the webhook accepts everything, the booking calendar becomes the final step.
                </p>
                <div className="mt-5 rounded-[18px] border border-[#dbe7ef] bg-[#f8fbff] p-5">
                  <p className="text-[#1F2D5A] font-semibold">Review before scheduling</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-[14px] text-[#51607b]">
                    <div className="rounded-[14px] border border-[#dbe7ef] bg-white px-4 py-3">
                      <p className="text-[12px] uppercase tracking-[0.16em] text-[#2FA4A9]">Estimated shoot time</p>
                      <p className="mt-1 text-[24px] text-[#1F2D5A] font-semibold">{realEstateEstimatedDurationLabel}</p>
                    </div>
                    <div className="rounded-[14px] border border-[#dbe7ef] bg-white px-4 py-3">
                      <p className="text-[12px] uppercase tracking-[0.16em] text-[#2FA4A9]">Estimated total</p>
                      <p className="mt-1 text-[24px] text-[#1F2D5A] font-semibold">{currency(realEstateTotal)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <input value={realEstateContact.fullName} onChange={(e) => setRealEstateContact((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Full Name" className={`${FORM_INPUT_BASE} w-full`} required />
                    <RequiredMessage show={!realEstateContact.fullName.trim()} />
                  </div>
                  <div>
                    <input type="email" value={realEstateContact.email} onChange={(e) => setRealEstateContact((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email Address" className={`${FORM_INPUT_BASE} w-full`} required />
                    <RequiredMessage show={!realEstateContact.email.trim()} />
                  </div>
                  <div>
                    <input value={realEstateContact.phone} onChange={(e) => setRealEstateContact((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone Number" className={`${FORM_INPUT_BASE} w-full`} required />
                    <RequiredMessage show={!realEstateContact.phone.trim()} />
                  </div>
                </div>
                {requiresVideoQuestions && (
                  <div className="mt-5 rounded-[18px] border border-[#2FA4A9]/35 bg-[#effbfb] p-5">
                    <p className="text-[#1F2D5A] font-semibold">Video details (required)</p>
                    <div className="mt-4 grid gap-3">
                      <div>
                        <textarea
                          placeholder="What specific shots would you like? (areas to highlight or avoid)"
                          value={videoQuestions.highlights}
                          onChange={(e) => setVideoQuestions({ ...videoQuestions, highlights: e.target.value })}
                          className="min-h-[90px] w-full p-3 rounded-[14px] border border-[#cde5ea] bg-white/95"
                          required
                        />
                        <RequiredMessage show={!videoQuestions.highlights.trim()} />
                      </div>
                      <div>
                        <input
                          placeholder="Do you have a specific song? If not, what genre?"
                          value={videoQuestions.music}
                          onChange={(e) => setVideoQuestions({ ...videoQuestions, music: e.target.value })}
                          className={`${FORM_INPUT_BASE} w-full`}
                          required
                        />
                        <RequiredMessage show={!videoQuestions.music.trim()} />
                      </div>
                      <div>
                        <input
                          placeholder="Any video or editing styles to emulate? Share links if possible."
                          value={videoQuestions.vibe}
                          onChange={(e) => setVideoQuestions({ ...videoQuestions, vibe: e.target.value })}
                          className={`${FORM_INPUT_BASE} w-full`}
                          required
                        />
                        <RequiredMessage show={!videoQuestions.vibe.trim()} />
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div>
                    <select value={realEstateAccess.vacancy} onChange={(e) => setRealEstateAccess((prev) => ({ ...prev, vacancy: e.target.value }))} className={`${FORM_INPUT_BASE} w-full`} required>
                      <option value="">Vacant or occupied?</option>
                      <option>Vacant</option>
                      <option>Occupied</option>
                    </select>
                    <RequiredMessage show={!realEstateAccess.vacancy.trim()} />
                  </div>
                  <div>
                    <select value={realEstateAccess.access} onChange={(e) => setRealEstateAccess((prev) => ({ ...prev, access: e.target.value }))} className={`${FORM_INPUT_BASE} w-full`} required>
                      <option value="">How will the photographer gain access?</option>
                      <option>Supra lockbox</option>
                      <option>Other lockbox</option>
                      <option>Agent onsite</option>
                      <option>Sellers onsite</option>
                    </select>
                    <RequiredMessage show={!realEstateAccess.access.trim()} />
                  </div>
                  <div>
                    <div className="relative">
                      <input value={realEstateAccess.lockbox} onChange={(e) => setRealEstateAccess((prev) => ({ ...prev, lockbox: e.target.value }))} placeholder="Lockbox code (or N/A)" className={`${FORM_INPUT_BASE} w-full pr-16`} required />
                      <button type="button" onClick={() => setRealEstateAccess((prev) => ({ ...prev, lockbox: "N/A" }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#1F3A5F] font-semibold">
                        Set N/A
                      </button>
                    </div>
                    <RequiredMessage show={!realEstateAccess.lockbox.trim()} />
                  </div>
                  <div>
                    <div className="relative">
                      <input value={realEstateAccess.gateCode} onChange={(e) => setRealEstateAccess((prev) => ({ ...prev, gateCode: e.target.value }))} placeholder="Community gate code (or N/A)" className={`${FORM_INPUT_BASE} w-full pr-16`} required />
                      <button type="button" onClick={() => setRealEstateAccess((prev) => ({ ...prev, gateCode: "N/A" }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#1F3A5F] font-semibold">
                        Set N/A
                      </button>
                    </div>
                    <RequiredMessage show={!realEstateAccess.gateCode.trim()} />
                  </div>
                </div>
                <div className="mt-4 grid gap-4">
                  <div>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Please list any special requests for your property (specific spaces to highlight or avoid). PLEASE BE SPECIFIC."
                      className="min-h-[100px] w-full p-3 rounded-[14px] border border-[#d7e7f2] bg-white/95 outline-none focus:border-[#2FA4A9] focus:ring-2 focus:ring-[#a9e1e4]/40 transition"
                      required
                    />
                    <RequiredMessage show={!specialRequests.trim()} />
                  </div>
                  <div>
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Additional info for your photographer"
                      className="min-h-[90px] w-full p-3 rounded-[14px] border border-[#d7e7f2] bg-white/95 outline-none focus:border-[#2FA4A9] focus:ring-2 focus:ring-[#a9e1e4]/40 transition"
                      required
                    />
                    <RequiredMessage show={!additionalInfo.trim()} />
                  </div>
                </div>

                <div className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
                  <div className={`p-4 text-[14px] text-[#43526d] ${CARD_BASE}`}>
                    <p className="font-semibold text-[#1F2D5A]">Order summary</p>
                    <div className="mt-2 space-y-1">
                      {realEstateSummaryLineItems.length ? (
                        realEstateSummaryLineItems.map((item) => (
                          <div key={item.id} className="flex justify-between gap-4">
                            <span>{item.name}</span>
                            <span className="font-semibold">{currency(item.amount)}</span>
                          </div>
                        ))
                      ) : (
                        <p>No package selected.</p>
                      )}
                      <div className="flex justify-between">
                        <span>Estimated shoot time</span>
                        <span className="font-semibold">{realEstateEstimatedDurationLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rounded booking bucket</span>
                        <span className="font-semibold">{realEstateDurationBucket ? `${realEstateDurationBucket} min` : "Unavailable"}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-[#e4e6ef]">
                        <label className="block text-[12px] font-semibold text-[#1F2D5A]">Discount code</label>
                        <input
                          value={realEstateDiscountCode}
                          onChange={(e) => setRealEstateDiscountCode(e.target.value)}
                          placeholder="Enter discount code"
                          className={`${FORM_INPUT_BASE} mt-1 w-full h-10 rounded-[12px]`}
                        />
                        {realEstateDiscountCode.trim() && !realEstateDiscountCodeRate ? (
                          <p className="mt-1 text-[12px] text-[#c84848]">Code not recognized.</p>
                        ) : null}
                      </div>
                      {realEstateSubtotal !== realEstateTotal ? (
                        <div className="pt-3 mt-3 border-t border-[#e4e6ef] space-y-1">
                          <div className="flex justify-between gap-4">
                            <span>Subtotal</span>
                            <span className="font-semibold">{currency(realEstateSubtotal)}</span>
                          </div>
                          {realEstateVideoDiscount > 0 ? (
                            <div className="flex justify-between gap-4 text-[#1f7a4d]">
                              <span>10% video order discount</span>
                              <span className="font-semibold">{currency(-realEstateVideoDiscount)}</span>
                            </div>
                          ) : null}
                          {realEstateDiscountCodeAmount > 0 ? (
                            <div className="flex justify-between gap-4 text-[#1f7a4d]">
                              <span>Discount code</span>
                              <span className="font-semibold">{currency(-realEstateDiscountCodeAmount)}</span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <p className="mt-3 text-[#1F2D5A] font-semibold">Total: {currency(realEstateTotal)}</p>
                  </div>
                  <div className={`p-4 text-[13px] text-[#41516b] ${CARD_BASE}`} style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.5 }}>
                    <p className="text-[#1F2D5A] font-semibold">Terms &amp; consent</p>
                    <label className="flex items-start gap-2.5 mt-3">
                      <input type="checkbox" className="mt-1" checked={realEstateAccess.smsMarketing} onChange={(e) => setRealEstateAccess({ ...realEstateAccess, smsMarketing: e.target.checked })} />
                      <span>I consent to receive marketing text messages about special offers, discounts, and service updates. Message frequency may vary. Msg &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.</span>
                    </label>
                    <label className="flex items-start gap-2.5 mt-3">
                      <input type="checkbox" className="mt-1" checked={realEstateAccess.smsTransactional} onChange={(e) => setRealEstateAccess({ ...realEstateAccess, smsTransactional: e.target.checked })} />
                      <span>I consent to receive non-marketing texts about booking confirmations, reminders, and delivery updates. Message frequency may vary. Msg &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.</span>
                    </label>
                    <label className="flex items-start gap-2.5 mt-3">
                      <input type="checkbox" className="mt-1" checked={realEstateAccess.termsAccepted} onChange={(e) => setRealEstateAccess({ ...realEstateAccess, termsAccepted: e.target.checked })} required />
                      <span>I agree to the <a href="/terms-of-service" target="_blank" rel="noreferrer" className="underline">Terms &amp; Conditions</a>.</span>
                    </label>
                    <RequiredMessage show={!realEstateAccess.termsAccepted} />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={realEstateSubmitting || !realEstateAccess.termsAccepted || !realEstateSubmissionDetailsComplete}
                    onClick={saveRealEstateDetails}
                    className="h-11 px-6 rounded-full bg-[#1F3A5F] text-white disabled:opacity-50"
                  >
                    {realEstateSubmitting ? "Submitting..." : realEstateDetailsSaved ? "Details submitted" : "Submit details & continue to booking"}
                  </button>
                </div>

                {realEstateError && <p className="text-[#c84848] mt-3">{realEstateError}</p>}
              </SectionShell>
            )}

            {realEstateStep === 5 && (
              <SectionShell>
                <h3 className="text-[#1F2D5A] text-[28px] sm:text-[34px]" style={{ fontFamily: "'PP Neue Montreal', 'Montserrat', 'Satoshi', sans-serif", fontWeight: 600 }}>Book your time</h3>
                <p className="text-[#51607b] text-[15px] mt-3" style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 400 }}>
                  Your project details are already submitted. Pick a time below to finish the booking, then you'll land on the booking confirmation page.
                </p>
                <div className="mt-6">
                  <LeadConnectorScheduler
                    label="Booking Calendar"
                    description="Your project details are submitted. Choose your preferred time below and our team will reach out to confirm exact time shortly."
                    options={availableRealEstateSchedulers}
                    selectedKey={realEstateSchedule.schedulerKey}
                    assignmentMode="auto"
                    prefillContact={realEstateContact}
                    onSelect={(option) =>
                      setRealEstateSchedule((prev) => ({
                        ...prev,
                        schedulerKey: option.key,
                        schedulerName: option.name,
                        schedulerUrl: option.bookingUrl,
                      }))
                    }
                  />
                </div>
              </SectionShell>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setRealEstateStep((prev) => Math.max(1, prev - 1))}
                disabled={realEstateStep === 1 || realEstateSubmitting}
                className="h-11 px-5 rounded-full border border-[#ccd5e3] disabled:opacity-40"
              >
                Back
              </button>
              {realEstateStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!realEstateCanAdvance()) return;
                    setRealEstateStep((prev) => Math.min(4, prev + 1));
                  }}
                  disabled={!realEstateCanAdvance()}
                  className="h-11 px-6 rounded-full bg-[#1F3A5F] text-white flex items-center gap-2 disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : null}
            </div>
            <div className="flex justify-end">
              <p className="text-[#1F2D5A] text-[15px] font-semibold">
                Running total: {currency(realEstateTotal)}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
