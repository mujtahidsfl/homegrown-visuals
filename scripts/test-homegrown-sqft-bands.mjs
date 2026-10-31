import assert from "node:assert/strict";
import { BASE_PRICES, OVERSIZE_MIN_SQFT, SQFT_TIER_OPTIONS, getSqftTierKey, isOversizeSqft } from "../src/app/booking/config.ts";
import { PRICING_SHEET, SQFT_TIERS, getSqftTier } from "../src/app/chatbot/pricingSheet.ts";

const boundaries = [
  [1, "under_1500", "0-1499"],
  [1499, "under_1500", "0-1499"],
  [1500, "1500_2999", "1500-2999"],
  [2999, "1500_2999", "1500-2999"],
  [3000, "3000_4499", "3000-4499"],
  [4499, "3000_4499", "3000-4499"],
  [4500, "4500_5999", "4500-5999"],
  [5500, "4500_5999", "4500-5999"],
  [5999, "4500_5999", "4500-5999"],
];
for (const [sqft, bookingTier, chatbotTier] of boundaries) {
  assert.equal(getSqftTierKey(sqft), bookingTier, `${sqft} booking tier`);
  assert.equal(getSqftTier(sqft), chatbotTier, `${sqft} chatbot tier`);
  assert.equal(isOversizeSqft(sqft), false, `${sqft} has a fixed price`);
}
for (const sqft of [6000, 6001, 12000]) {
  assert.equal(getSqftTierKey(sqft), "", `${sqft} has no fixed-price tier`);
  assert.equal(getSqftTier(sqft), "6000+", `${sqft} chatbot quote tier`);
  assert.equal(isOversizeSqft(sqft), true, `${sqft} takes the quote path`);
}
assert.equal(getSqftTierKey(0), "");
assert.equal(isOversizeSqft(0), false);
assert.equal(OVERSIZE_MIN_SQFT, 6000);

assert.deepEqual(BASE_PRICES.standard, { under_1500: 279, "1500_2999": 349, "3000_4499": 399, "4500_5999": 479 });
assert.deepEqual(BASE_PRICES.zillow_showcase, { under_1500: 399, "1500_2999": 479, "3000_4499": 529, "4500_5999": 599 });
assert.deepEqual(BASE_PRICES.luxury, { under_1500: 979, "1500_2999": 1059, "3000_4499": 1119, "4500_5999": 1179 });
assert.deepEqual(SQFT_TIER_OPTIONS.map((tier) => tier.key), ["under_1500", "1500_2999", "3000_4499", "4500_5999"]);
assert.deepEqual(SQFT_TIERS.map((tier) => tier.key), ["0-1499", "1500-2999", "3000-4499", "4500-5999", "6000+"]);
const standard = PRICING_SHEET.packages.find((item) => item.name === "Standard Package");
assert.equal(standard.prices["4500-5999"], 479);
assert.equal(standard.prices["6000+"], "QUOTE");
console.log("Sqft band boundary and unchanged-price checks passed");
