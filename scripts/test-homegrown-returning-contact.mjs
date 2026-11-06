import assert from "node:assert/strict";
import { readReturningContact, rememberReturningContact, forgetReturningContact } from "../src/app/booking/returningContact.ts";
import { addressChoices, profileAsContact, shouldOfferSaveAddress } from "../src/app/booking/savedAddresses.ts";

const values = new Map();
const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
try {
  const input = { fullName: " Repeat Client ", email: " repeat@example.com ", phone: " 8505550100 ", address: "Private property", gateCode: "Do not retain", smsConsent: true };
  rememberReturningContact(input);
  const [key, raw] = [...values.entries()][0];
  const saved = JSON.parse(raw);
  assert.deepEqual(Object.keys(saved).sort(), ["email", "fullName", "phone", "savedAt"]);
  assert.deepEqual(readReturningContact(), { fullName: "Repeat Client", email: "repeat@example.com", phone: "8505550100" });
  values.set(key, JSON.stringify({ ...saved, savedAt: Date.now() - 31 * 86400000 }));
  assert.equal(readReturningContact(), null);
  values.set(key, JSON.stringify({ ...saved, savedAt: Date.now() + 86400000 }));
  assert.equal(readReturningContact(), null);
  values.set(key, "not json");
  assert.equal(readReturningContact(), null);
  rememberReturningContact(input);
  forgetReturningContact();
  assert.equal(readReturningContact(), null);
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("Storage blocked"); } });
  assert.doesNotThrow(() => rememberReturningContact(input));
  assert.equal(readReturningContact(), null);
  assert.doesNotThrow(() => forgetReturningContact());
} finally {
  if (previous) Object.defineProperty(globalThis, "localStorage", previous);
  else delete globalThis.localStorage;
}
// Signed-in customers: account profile and saved addresses.
assert.deepEqual(profileAsContact({ full_name: "A", phone: "1" }, "a@x.com"), { fullName: "A", email: "a@x.com", phone: "1" });
assert.deepEqual(profileAsContact({ full_name: " A ", phone: " 1 " }, " a@x.com "), { fullName: "A", email: "a@x.com", phone: "1" });
assert.equal(profileAsContact({ full_name: "A", phone: "" }, "a@x.com"), null);
assert.equal(profileAsContact({ full_name: "A", phone: "1" }, null), null);
assert.equal(profileAsContact(null, "a@x.com"), null);

assert.deepEqual(addressChoices([{ id: "1", label: "Home", address: "1 Main St" }], ""), [{ id: "1", text: "Home — 1 Main St", address: "1 Main St" }]);
assert.deepEqual(addressChoices([{ id: "2", label: "", address: "2 Oak Ave" }], ""), [{ id: "2", text: "2 Oak Ave", address: "2 Oak Ave" }]);
assert.deepEqual(addressChoices([{ id: "1", label: "Home", address: "1 Main St" }], " 1 main st "), []);

assert.equal(shouldOfferSaveAddress([{ address: "1 Main St" }], "1 MAIN ST"), false);
assert.equal(shouldOfferSaveAddress([{ address: "1 Main St" }], "2 Oak Ave"), true);
assert.equal(shouldOfferSaveAddress([], ""), false);
assert.equal(shouldOfferSaveAddress([], "   "), false);

console.log("Returning contact privacy, expiry, removal, and blocked-storage checks passed");
