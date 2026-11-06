import assert from "node:assert/strict";
import { toCustomerInvoice, toCustomerInvoices } from "../api/_hgv/customerInvoices.js";
import { createGhlClient } from "../api/_hgv/ghl.js";
import { HGV_LOCATION_ID } from "../api/_hgv/config.js";

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

console.log("Customer account invoice checks passed");
