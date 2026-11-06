import assert from "node:assert/strict";
import { toCustomerInvoice, toCustomerInvoices } from "../api/_hgv/customerInvoices.js";
import { createGhlClient } from "../api/_hgv/ghl.js";
import { HGV_LOCATION_ID } from "../api/_hgv/config.js";
import { createAccountHandler } from "../api/hgv-account.js";
import { verifySupabaseToken } from "../api/_hgv/supabaseAuth.js";

const now = new Date("2026-11-06T12:00:00Z");
const inv = (overrides = {}) => ({
  _id: "inv_1",
  invoiceNumber: "1001",
  status: "sent",
  issueDate: "2026-10-01",
  dueDate: "2026-12-01",
  total: 450,
  amountDue: 450,
  currency: "USD",
  items: [{ name: "Standard Package" }, { name: "Drone Photos" }],
  contactDetails: { email: "x@y.com", name: "Private" },
  businessDetails: {},
  ...overrides,
});

// --- Task 2: invoice mapping ---
{
  const unpaid = toCustomerInvoice(inv(), now);
  assert.equal(unpaid.status, "unpaid");
  assert.equal(unpaid.payUrl, "https://link.fastpaydirect.com/invoice/inv_1");
  assert.equal(unpaid.summary, "Standard Package, Drone Photos");
  assert.equal(unpaid.number, "1001");
  assert.equal(unpaid.total, 450);
  assert.equal(unpaid.amountDue, 450);

  const partial = toCustomerInvoice(inv({ status: "partially_paid", amountDue: 200 }), now);
  assert.equal(partial.status, "partially_paid");
  assert.ok(partial.payUrl);

  const overdue = toCustomerInvoice(inv({ dueDate: "2026-11-01" }), now);
  assert.equal(overdue.status, "overdue");
  assert.ok(overdue.payUrl);

  const dueToday = toCustomerInvoice(inv({ dueDate: "2026-11-06" }), now);
  assert.equal(dueToday.status, "unpaid", "due today is not overdue yet");

  const nothingOwed = toCustomerInvoice(inv({ amountDue: 0 }), now);
  assert.equal(nothingOwed.status, "paid");
  assert.equal("payUrl" in nothingOwed, false);

  const paid = toCustomerInvoice(inv({ status: "paid", amountDue: 0 }), now);
  assert.equal(paid.status, "paid");
  assert.equal("payUrl" in paid, false);

  const voided = toCustomerInvoice(inv({ status: "void", amountDue: 450 }), now);
  assert.equal(voided.status, "void");
  assert.equal("payUrl" in voided, false);

  const upperVoid = toCustomerInvoice(inv({ status: "VOID" }), now);
  assert.equal(upperVoid.status, "void");

  assert.equal(toCustomerInvoice(inv({ status: "draft" }), now), null);

  const processing = toCustomerInvoice(inv({ status: "payment_processing" }), now);
  assert.equal(processing.status, "unpaid");
  assert.equal("payUrl" in processing, false);

  assert.deepEqual(Object.keys(unpaid).sort(), ["amountDue", "currency", "dueDate", "issueDate", "number", "payUrl", "status", "summary", "total"]);
  assert.deepEqual(Object.keys(paid).sort(), ["amountDue", "currency", "dueDate", "issueDate", "number", "status", "summary", "total"]);

  const list = toCustomerInvoices([
    inv({ _id: "a", issueDate: "2026-09-01" }),
    inv({ _id: "d", status: "draft", issueDate: "2026-11-01" }),
    inv({ _id: "b", issueDate: "2026-10-15" }),
  ], now);
  assert.deepEqual(list.map((i) => i.issueDate), ["2026-10-15", "2026-09-01"]);

  const long = toCustomerInvoice(inv({ items: Array.from({ length: 20 }, (_, i) => ({ name: `Service number ${i}` })) }), now);
  assert.ok(long.summary.length <= 120);
  assert.ok(long.summary.endsWith("…"));

  const usesId = toCustomerInvoice(inv({ _id: undefined, id: "inv_2" }), now);
  assert.equal(usesId.payUrl, "https://link.fastpaydirect.com/invoice/inv_2");
}

// --- Task 3: GHL lookups by verified email ---
function fakeFetch(responder) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const body = await responder(String(url), init);
    return { ok: true, status: 200, text: async () => JSON.stringify(body) };
  };
  return { calls, fetchImpl };
}

{
  const { calls, fetchImpl } = fakeFetch(() => ({
    contacts: [
      { id: "c1", email: "JANE@example.com " },
      { id: "c2", email: "jane@example.com" },
      { id: "c3", email: "janet@example.com" },
      { id: "c4" },
    ],
  }));
  const ghl = createGhlClient({ token: "t", fetchImpl });
  const ids = await ghl.findContactIdsByEmail(" Jane@Example.com ");
  assert.deepEqual(ids, ["c1", "c2"]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://services.leadconnectorhq.com/contacts/search");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.Version, "v3");
  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.locationId, HGV_LOCATION_ID);
  assert.equal(sent.pageLimit, 20);
  assert.deepEqual(sent.filters, [{ field: "email", operator: "eq", value: "jane@example.com" }]);
}

{
  const { calls, fetchImpl } = fakeFetch(() => ({ contacts: [] }));
  const ghl = createGhlClient({ token: "t", fetchImpl });
  assert.deepEqual(await ghl.findContactIdsByEmail("   "), []);
  assert.deepEqual(await ghl.findContactIdsByEmail(""), []);
  assert.equal(calls.length, 0);
}

{
  const { calls, fetchImpl } = fakeFetch(() => ({ invoices: [{ _id: "i1" }] }));
  const ghl = createGhlClient({ token: "t", fetchImpl });
  assert.deepEqual(await ghl.listContactInvoices("c1"), [{ _id: "i1" }]);
  const url = new URL(calls[0].url);
  assert.equal(url.pathname, "/invoices/");
  assert.equal(calls[0].init.method, "GET");
  assert.deepEqual(Object.fromEntries(url.searchParams), { altId: HGV_LOCATION_ID, altType: "location", contactId: "c1", limit: "100", offset: "0" });
}

{
  const { fetchImpl } = fakeFetch(() => ({}));
  const ghl = createGhlClient({ token: "t", fetchImpl });
  assert.deepEqual(await ghl.listContactInvoices("c1"), []);
}

// --- Task 4: /api/hgv-account handler ---
function fakeRes() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(text) { this.body = text ? JSON.parse(text) : null; },
  };
}
const req = (overrides = {}) => ({ method: "GET", url: "/api/hgv-account", headers: { authorization: "Bearer tok" }, ...overrides });

function stubGhl({ contacts = {}, invoices = {}, find, list } = {}) {
  const seen = { emails: [], contactIds: [] };
  return {
    seen,
    ghl: {
      findContactIdsByEmail: find || (async (email) => { seen.emails.push(email); return contacts[email] || []; }),
      listContactInvoices: list || (async (id) => { seen.contactIds.push(id); return invoices[id] || []; }),
    },
  };
}

{
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => ({ email: "me@x.com" }), makeGhl: () => stubGhl().ghl })(req({ method: "POST" }), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, "GET");
}

{
  let verified = 0;
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => { verified++; return { email: "me@x.com" }; }, makeGhl: () => stubGhl().ghl })(req({ headers: {} }), res);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { ok: false, error: "unauthorized" });
  assert.equal(verified, 0);
  assert.equal(res.headers["cache-control"], "no-store");
}

{
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => null, makeGhl: () => stubGhl().ghl })(req(), res);
  assert.equal(res.statusCode, 401);
}

{
  const { seen, ghl } = stubGhl({ contacts: { "me@x.com": ["c1"] } });
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => ({ email: "me@x.com" }), makeGhl: () => ghl, now: () => now })(
    req({ url: "/api/hgv-account?email=other@x.com&contactId=evil" }),
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.deepEqual(seen.emails, ["me@x.com"]);
  assert.deepEqual(seen.contactIds, ["c1"]);
}

{
  const { seen, ghl } = stubGhl({
    contacts: { "me@x.com": ["c1", "c2"] },
    invoices: {
      c1: [inv({ _id: "shared", issueDate: "2026-09-01", contactDetails: { id: "c1" } }), inv({ _id: "a", issueDate: "2026-10-01", contactDetails: { id: "c1" } })],
      c2: [inv({ _id: "shared", issueDate: "2026-09-01", contactDetails: { id: "c1" } }), inv({ _id: "b", issueDate: "2026-10-20", contactDetails: { id: "c2" } })],
    },
  });
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => ({ email: "me@x.com" }), makeGhl: () => ghl, now: () => now })(req(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.email, "me@x.com");
  assert.deepEqual(seen.contactIds.sort(), ["c1", "c2"]);
  assert.deepEqual(res.body.invoices.map((i) => i.issueDate), ["2026-10-20", "2026-10-01", "2026-09-01"]);
}

{
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => ({ email: "me@x.com" }), makeGhl: () => stubGhl().ghl })(req(), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.invoices, []);
}

{
  const res = fakeRes();
  const { ghl } = stubGhl({ find: () => new Promise(() => {}) });
  await createAccountHandler({ verifyToken: async () => ({ email: "me@x.com" }), makeGhl: () => ghl, timeoutMs: 20, log: () => {} })(req(), res);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { ok: false, error: "invoices_unavailable" });
}

{
  const logged = [];
  const res = fakeRes();
  const { ghl } = stubGhl({ find: async () => { throw new Error("boom jane@example.com 450"); } });
  await createAccountHandler({ verifyToken: async () => ({ email: "jane@example.com" }), makeGhl: () => ghl, log: (...args) => logged.push(args) })(req(), res);
  assert.equal(res.statusCode, 503);
  assert.equal(logged.length, 1);
  const text = JSON.stringify(logged);
  assert.ok(!text.includes("jane@example.com"));
  assert.ok(!text.includes("450"));
}

{
  const res = fakeRes();
  await createAccountHandler({
    verifyToken: async () => ({ email: "me@x.com" }),
    makeGhl: () => { throw new Error("Missing GHL token"); },
    log: () => {},
  })(req(), res);
  assert.equal(res.statusCode, 503);
}

// --- Final review fixes ---
// I1: invoices must belong to the matched contact, even if GHL ignores contactId.
{
  const { ghl } = stubGhl({
    contacts: { "me@x.com": ["c1"] },
    invoices: {
      c1: [
        inv({ _id: "mine", contactDetails: { id: "c1", email: "me@x.com" } }),
        inv({ _id: "foreign", contactDetails: { id: "c9", email: "other@x.com" } }),
        inv({ _id: "unknown", contactDetails: {} }),
      ],
    },
  });
  const logged = [];
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => ({ email: "me@x.com" }), makeGhl: () => ghl, now: () => now, log: (...a) => logged.push(a) })(req(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.invoices.length, 1, "only the contact's own invoice is returned");
  assert.ok(!JSON.stringify(logged).includes("other@x.com"));
}

// I2: a server-side verification failure is 503, not 401 (avoids a login redirect loop).
{
  const res = fakeRes();
  await createAccountHandler({ verifyToken: async () => ({ error: "unavailable" }), makeGhl: () => stubGhl().ghl, log: () => {} })(req(), res);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { ok: false, error: "auth_unavailable" });
}
{
  const fakeCreate = (result) => () => ({ auth: { getUser: async () => { if (result instanceof Error) throw result; return result; } } });
  const env = { SUPABASE_URL: "https://s.example", SUPABASE_ANON_KEY: "k" };
  const confirmed = { data: { user: { email: " Me@X.com ", email_confirmed_at: "2026-11-01" } }, error: null };
  assert.deepEqual(await verifySupabaseToken("t", env, fakeCreate(confirmed)), { email: "me@x.com" });
  assert.deepEqual(await verifySupabaseToken("t", {}, fakeCreate(confirmed)), { error: "unavailable" });
  assert.equal(await verifySupabaseToken("t", env, fakeCreate({ data: { user: null }, error: { status: 401, message: "bad jwt" } })), null);
  assert.equal(await verifySupabaseToken("t", env, fakeCreate({ data: { user: null }, error: { status: 403, message: "bad jwt" } })), null);
  assert.deepEqual(await verifySupabaseToken("t", env, fakeCreate({ data: { user: null }, error: { status: 500, message: "down" } })), { error: "unavailable" });
  assert.deepEqual(await verifySupabaseToken("t", env, fakeCreate({ data: { user: null }, error: { status: 0, message: "fetch failed" } })), { error: "unavailable" });
  assert.deepEqual(await verifySupabaseToken("t", env, fakeCreate(new Error("network"))), { error: "unavailable" });
  assert.equal(await verifySupabaseToken("t", env, fakeCreate({ data: { user: { email: "a@x.com", email_confirmed_at: null } }, error: null })), null);
  assert.equal(await verifySupabaseToken("", env, fakeCreate(confirmed)), null);
}

// I3: a missing amountDue must not show as Paid.
{
  const missing = toCustomerInvoice(inv({ amountDue: undefined, total: 450, amountPaid: 100 }), now);
  assert.equal(missing.amountDue, 350);
  assert.equal(missing.status, "unpaid");
  assert.ok(missing.payUrl);
  const unknown = toCustomerInvoice(inv({ amountDue: undefined, total: undefined }), now);
  assert.equal(unknown.status, "unpaid");
  assert.equal("payUrl" in unknown, false);
  const paidNoAmount = toCustomerInvoice(inv({ status: "paid", amountDue: undefined }), now);
  assert.equal(paidNoAmount.status, "paid");
}

console.log("Customer account invoice checks passed");
