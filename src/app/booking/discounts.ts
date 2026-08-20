export const VIDEO_ORDER_DISCOUNT_RATE = 0.1;

export const VIDEO_ORDER_DISCOUNT_NOTE =
  "When ordering a package + video, the video is discounted 10%.";

export const DISCOUNT_CODES: Record<string, number> = {
  "2%LOYALTYHGV": 0.02,
  "5%GOLDHGV%": 0.05,
  "10%PARTNERHGV%": 0.1,
};

export const getDiscountCodeRate = (code: string) => DISCOUNT_CODES[code.trim().toUpperCase()] ?? 0;

export const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export type VideoDiscountItem = { id: string; price: number };

// Fixed discounts that take precedence over the 10% calculation. The 30sec
// drone video is quoted at a flat $20 off rather than 10% of its list price.
export const VIDEO_DISCOUNT_OVERRIDES: Record<string, number> = {
  re_drone_video_30: 20,
  drone_video_30: 20,
};

// Video discounts always round up to the next whole dollar.
export const videoItemDiscount = ({ id, price }: VideoDiscountItem) => {
  const override = VIDEO_DISCOUNT_OVERRIDES[id];
  if (override !== undefined) return override;
  return price > 0 ? Math.ceil(roundCurrency(price * VIDEO_ORDER_DISCOUNT_RATE)) : 0;
};

/**
 * 10% off each eligible video item, but only when the order contains something
 * beyond the video itself. Multi-reel bundles are excluded by the caller since
 * their pricing already carries a volume discount.
 */
export const getVideoOrderDiscount = (eligibleVideoItems: VideoDiscountItem[], subtotal: number) => {
  const videoTotal = eligibleVideoItems.reduce((sum, item) => sum + item.price, 0);
  if (videoTotal <= 0) return 0;
  if (subtotal <= videoTotal) return 0;
  return eligibleVideoItems.reduce((sum, item) => sum + videoItemDiscount(item), 0);
};
