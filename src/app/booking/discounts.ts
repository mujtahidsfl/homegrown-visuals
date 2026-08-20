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

// Video discounts always round up to the next whole dollar.
export const videoItemDiscount = (price: number) =>
  price > 0 ? Math.ceil(roundCurrency(price * VIDEO_ORDER_DISCOUNT_RATE)) : 0;

/**
 * 10% off each eligible video item, but only when the order contains something
 * beyond the video itself. Multi-reel bundles are excluded by the caller since
 * their pricing already carries a volume discount.
 */
export const getVideoOrderDiscount = (eligibleVideoPrices: number[], subtotal: number) => {
  const videoTotal = eligibleVideoPrices.reduce((sum, price) => sum + price, 0);
  if (videoTotal <= 0) return 0;
  if (subtotal <= videoTotal) return 0;
  return eligibleVideoPrices.reduce((sum, price) => sum + videoItemDiscount(price), 0);
};
