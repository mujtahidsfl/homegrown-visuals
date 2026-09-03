import assert from "node:assert/strict";
import bookingHandler, { submitWithSettling } from "../api/hgv-bookings.js";
import appointmentHandler from "../api/hgv-ghl-webhook.js";
import invoiceHandler, { extractInvoiceIdentifiers, resolveInvoiceSendMode } from "../api/hgv-invoice.js";
import { createGhlClient } from "../api/_hgv/ghl.js";

function makeReq(body, url, method = "POST", headers = {}) {
  return {
    method,
    url,
    body,
    headers,
    async *[Symbol.asyncIterator]() {},
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(value) {
      this.body = value;
    },
  };
}

async function call(handler, { body = {}, url = "/", method = "POST", headers = {} } = {}) {
  const res = makeRes();
  await handler(makeReq(body, url, method, headers), res);
  return { statusCode: res.statusCode, headers: res.headers, body: JSON.parse(res.body) };
}

const bookingPayload = {
  form_type: "booking",
  website_booking_id: "api-dry-run-1",
  booking_path: "vacant_land",
  package: "Vacant Land Package",
  property_address: "9911 Safe Test Ave",
  contact: { fullName: "API Dry Run", email: "api-dry-run@example.com" },
  invoice_line_items: [{ name: "Vacant Land Package", amount: 349, quantity: 1 }],
};

const originalMode = process.env.HGV_ORCHESTRATOR_MODE;
const originalSecret = process.env.HGV_GHL_WEBHOOK_SECRET;
try {
  assert.deepEqual(
    extractInvoiceIdentifiers({ customData: { website_booking_id: "nested-booking" } }),
    { bookingId: "nested-booking", opportunityId: "" },
  );
  assert.deepEqual(
    extractInvoiceIdentifiers({ data: { "Opportunity ID": "nested-opportunity" } }),
    { bookingId: "", opportunityId: "nested-opportunity" },
  );
  assert.equal(resolveInvoiceSendMode({}), "email");
  assert.equal(resolveInvoiceSendMode({ HGV_INVOICE_AUTOSEND_MODE: "draft" }), "draft");
  assert.equal(resolveInvoiceSendMode({ HGV_INVOICE_AUTOSEND_MODE: "SMS_AND_EMAIL" }), "sms_and_email");

  let capturedContactBody;
  const phoneOnlyClient = createGhlClient({
    token: "test-token",
    fetchImpl: async (_url, options) => {
      capturedContactBody = JSON.parse(options.body);
      return new Response(JSON.stringify({ contact: { id: "phone-only-contact" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  await phoneOnlyClient.upsertContact({
    fullName: "Phone Only",
    firstName: "Phone",
    lastName: "Only",
    email: "",
    phone: "+15555550100",
  });
  assert.equal(capturedContactBody.phone, "+15555550100");
  assert.equal("email" in capturedContactBody, false);

  process.env.HGV_ORCHESTRATOR_MODE = "off";
  process.env.HGV_GHL_WEBHOOK_SECRET = "test-webhook-secret";

  const wrongMethod = await call(bookingHandler, { method: "GET", url: "/api/hgv-bookings" });
  assert.equal(wrongMethod.statusCode, 405);
  assert.equal(wrongMethod.headers.Allow, "POST");

  const invalidJson = await call(bookingHandler, { body: "{bad-json", url: "/api/hgv-bookings" });
  assert.equal(invalidJson.statusCode, 400);

  const dryRun = await call(bookingHandler, {
    body: bookingPayload,
    url: "/api/hgv-bookings?dry_run=1",
  });
  assert.equal(dryRun.statusCode, 200);
  assert.equal(dryRun.body.dryRun, true);
  assert.equal(dryRun.body.parsed.hasPropertyAddress, true);
  assert.equal(dryRun.body.parsed.lineItemCount, 1);

  const settlingStates = [
    { ok: true, duplicate: true, bookingId: "settling-test", opportunityId: null },
    { ok: true, duplicate: true, bookingId: "settling-test", opportunityId: null },
    { ok: true, duplicate: true, bookingId: "settling-test", opportunityId: "opportunity-settled" },
  ];
  let settlingCalls = 0;
  const settled = await submitWithSettling(
    { async submit() { settlingCalls += 1; return settlingStates.shift(); } },
    bookingPayload,
    { sleep: async () => {} },
  );
  assert.equal(settled.opportunityId, "opportunity-settled");
  assert.equal(settlingCalls, 3);

  const disabledBooking = await call(bookingHandler, { body: bookingPayload, url: "/api/hgv-bookings" });
  assert.equal(disabledBooking.statusCode, 503);
  assert.equal(disabledBooking.body.disabled, true);

  const invalidAppointmentSecret = await call(appointmentHandler, {
    body: {},
    url: "/api/hgv-ghl-webhook",
  });
  assert.equal(invalidAppointmentSecret.statusCode, 401);

  const disabledAppointment = await call(appointmentHandler, {
    body: {},
    url: "/api/hgv-ghl-webhook",
    headers: { "x-hgv-webhook-secret": "test-webhook-secret" },
  });
  assert.equal(disabledAppointment.statusCode, 503);
  assert.equal(disabledAppointment.body.disabled, true);

  const invalidInvoiceSecret = await call(invoiceHandler, {
    body: {},
    url: "/api/hgv-invoice",
  });
  assert.equal(invalidInvoiceSecret.statusCode, 401);

  const disabledInvoice = await call(invoiceHandler, {
    body: { website_booking_id: "api-dry-run-1" },
    url: "/api/hgv-invoice",
    headers: { "x-hgv-webhook-secret": "test-webhook-secret" },
  });
  assert.equal(disabledInvoice.statusCode, 503);
  assert.equal(disabledInvoice.body.disabled, true);

  process.env.HGV_ORCHESTRATOR_MODE = "live";
  const missingInvoiceBookingId = await call(invoiceHandler, {
    body: {},
    url: "/api/hgv-invoice",
    headers: { "x-hgv-webhook-secret": "test-webhook-secret" },
  });
  assert.equal(missingInvoiceBookingId.statusCode, 400);
  assert.equal(missingInvoiceBookingId.body.error, "Missing website booking id");

  console.log("Homegrown API safety tests passed");
} finally {
  if (originalMode === undefined) delete process.env.HGV_ORCHESTRATOR_MODE;
  else process.env.HGV_ORCHESTRATOR_MODE = originalMode;
  if (originalSecret === undefined) delete process.env.HGV_GHL_WEBHOOK_SECRET;
  else process.env.HGV_GHL_WEBHOOK_SECRET = originalSecret;
}
