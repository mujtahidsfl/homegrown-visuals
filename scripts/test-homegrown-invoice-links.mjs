import assert from "node:assert/strict";
import { invoicePaymentLinks } from "./lib/invoice-payment-links.mjs";

const canonical = "https://link.fastpaydirect.com/invoice/6abd6b0b48d43b812300d6be";
const short = "https://link.fastpaydirect.com/l/N42TY-9yL";

// Real GHL message formatting that previously produced a false HTTP 404.
assert.deepEqual(invoicePaymentLinks(`Pay invoice [${short}] or [${canonical}]`), [short, canonical]);
assert.deepEqual(invoicePaymentLinks(`<a href="${canonical}">Pay invoice</a>`), [canonical]);
assert.deepEqual(invoicePaymentLinks(`Pay securely: ${canonical}\nRegards`), [canonical]);
assert.deepEqual(invoicePaymentLinks(`[${canonical}]\n${canonical}`), [canonical]);
assert.deepEqual(invoicePaymentLinks("https://example.com/logo.png"), []);
assert.deepEqual(invoicePaymentLinks("https://link.fastpaydirect.com/invoice/id?a=1&amp;b=2"), [
  "https://link.fastpaydirect.com/invoice/id?a=1&b=2",
]);
assert.deepEqual(invoicePaymentLinks(null), []);
console.log("Invoice payment link parsing regression checks passed");
