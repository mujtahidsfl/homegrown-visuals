import assert from "node:assert/strict";
import { safeNext } from "../src/app/account/safeNext.ts";

// --- Task 5: safeNext (open-redirect guard) ---
assert.equal(safeNext("/services?x=1"), "/services?x=1");
assert.equal(safeNext("/services/real-estate#step"), "/services/real-estate#step");
for (const bad of [null, undefined, "", "//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "account", " /services", "/%2F%2Fevil.com"]) {
  assert.equal(safeNext(bad), "/account", `expected fallback for ${String(bad)}`);
}
assert.equal(safeNext("/account/login"), "/account");
assert.equal(safeNext("/account/login?next=/x"), "/account");

console.log("Customer account client checks passed");
