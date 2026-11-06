import assert from "node:assert/strict";
import { safeNext } from "../src/app/account/safeNext.ts";
import { fetchMyInvoices } from "../src/app/account/invoicesApi.ts";
import { normalizeAddressInput, normalizeProfileInput } from "../src/app/account/profileInput.ts";

// --- Task 5: safeNext (open-redirect guard) ---
assert.equal(safeNext("/services?x=1"), "/services?x=1");
assert.equal(safeNext("/services/real-estate#step"), "/services/real-estate#step");
for (const bad of [null, undefined, "", "//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "account", " /services", "/%2F%2Fevil.com"]) {
  assert.equal(safeNext(bad), "/account", `expected fallback for ${String(bad)}`);
}
assert.equal(safeNext("/account/login"), "/account");
assert.equal(safeNext("/account/login?next=/x"), "/account");

// --- Task 6: invoices API client and profile normalizers ---
{
  const calls = [];
  const respond = (status, body) => async (url, init) => {
    calls.push({ url, init });
    return { status, ok: status >= 200 && status < 300, json: async () => body };
  };
  const ok = await fetchMyInvoices("tok", respond(200, { ok: true, email: "a@x.com", invoices: [{ number: "1" }] }));
  assert.deepEqual(ok, { kind: "ok", invoices: [{ number: "1" }] });
  assert.equal(calls[0].url, "/api/hgv-account");
  assert.equal(calls[0].init.headers.Authorization, "Bearer tok");
  assert.deepEqual(await fetchMyInvoices("tok", respond(401, {})), { kind: "unauthorized" });
  assert.deepEqual(await fetchMyInvoices("tok", respond(503, {})), { kind: "unavailable" });
  assert.deepEqual(await fetchMyInvoices("tok", async () => { throw new Error("offline"); }), { kind: "unavailable" });
  assert.deepEqual(await fetchMyInvoices("tok", respond(200, { ok: true })), { kind: "unavailable" });
}

assert.deepEqual(normalizeProfileInput({ fullName: "  Ann  ", phone: " 850 " }), { full_name: "Ann", phone: "850" });
assert.equal(normalizeProfileInput({ fullName: "x".repeat(200), phone: "1".repeat(50) }).full_name.length, 120);
assert.equal(normalizeProfileInput({ fullName: "x", phone: "1".repeat(50) }).phone.length, 30);
assert.equal(normalizeAddressInput({ label: "", address: "   " }), null);
assert.deepEqual(normalizeAddressInput({ label: " Home ", address: " 1 Main St " }), { label: "Home", address: "1 Main St" });
assert.equal(normalizeAddressInput({ label: "l".repeat(80), address: "a".repeat(400) }).label.length, 60);
assert.equal(normalizeAddressInput({ label: "", address: "a".repeat(400) }).address.length, 300);

console.log("Customer account client checks passed");
