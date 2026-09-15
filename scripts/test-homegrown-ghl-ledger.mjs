import assert from "node:assert/strict";
import { createGhlObjectLedger } from "../api/_hgv/ledger.js";

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createFakeGhlObjectsApi() {
  const records = new Map();
  let nextId = 1;
  let searchEnabled = true;

  async function fetchImpl(url, options = {}) {
    const parsedUrl = new URL(url);
    const method = options.method || "GET";
    const path = parsedUrl.pathname;
    const body = options.body ? JSON.parse(options.body) : {};

    if (method === "POST" && path.endsWith("/records")) {
      const bookingId = body.properties.website_booking_id;
      const duplicate = [...records.values()].find(
        (record) => record.properties.website_booking_id === bookingId,
      );
      if (duplicate) {
        return jsonResponse(400, {
          message: `A record with the same value for Website Booking ID - ${bookingId} already exists.`,
        });
      }
      const record = { id: `record-${nextId++}`, properties: { ...body.properties } };
      records.set(record.id, record);
      return jsonResponse(201, { record });
    }

    if (method === "POST" && path.endsWith("/records/search")) {
      const query = String(body.query || "");
      const matches = (searchEnabled ? [...records.values()] : []).filter((record) =>
        Object.values(record.properties).some((value) => String(value).includes(query)),
      );
      return jsonResponse(201, { records: matches, total: matches.length });
    }

    const id = path.split("/").at(-1);
    if (method === "GET" && records.has(id)) {
      return jsonResponse(200, { record: records.get(id) });
    }
    if (method === "PUT" && records.has(id)) {
      const record = records.get(id);
      record.properties = { ...record.properties, ...body.properties };
      return jsonResponse(200, { record });
    }

    return jsonResponse(404, { message: "Not found" });
  }

  return {
    fetchImpl,
    records,
    setSearchEnabled(value) { searchEnabled = value; },
  };
}

function booking(bookingId, address = "123 Current Job Ave") {
  return {
    bookingId,
    formType: "booking",
    bookingPath: "real_estate",
    contact: {
      fullName: "Repeat Client",
      firstName: "Repeat",
      lastName: "Client",
      email: "repeat@example.com",
      phone: "+15555550100",
    },
    packageName: "Standard Package",
    propertyAddress: address,
    sqftTier: "under_1500",
    selections: "",
    addOns: "",
    alaCarte: "",
    specialRequests: "",
    additionalInfo: "",
    editorNotes: "",
    access: "Vacant",
    accessDetails: "",
    lockboxCode: "",
    gateCode: "",
    videoVibe: "",
    videoMusic: "",
    videoHighlights: "",
    estimatedTotal: 453,
    lineItems: [{ id: "standard", name: "Standard Package", category: "", amount: 453, quantity: 1 }],
    invoiceLineItemsJson: "[]",
    invoiceLineItemsStripe: "",
    calendarId: "calendar-a",
    schedulerKey: "standard",
    sourcePage: "https://homegrownvisualsmedia.com/services",
    submittedAt: "2026-09-01T12:00:00.000Z",
    pipelineStageId: "stage-new",
    raw: { intentionally: "excluded from the compact ledger snapshot" },
  };
}

const api = createFakeGhlObjectsApi();
let nowMs = Date.parse("2026-09-01T12:00:00.000Z");
const ledger = createGhlObjectLedger({
  token: "test-token",
  locationId: "test-location",
  fetchImpl: api.fetchImpl,
  now: () => nowMs,
  sleep: async () => {},
});

const first = await ledger.claimBooking(booking("booking-a"), "request-1");
assert.equal(first.acquired, true);
assert.equal(first.payload.propertyAddress, "123 Current Job Ave");
assert.equal("raw" in first.payload, false, "the GHL snapshot must exclude the duplicated raw payload");

api.setSearchEnabled(false);
await ledger.completeBooking("booking-a", {
  contact_id: "contact-repeat",
  opportunity_id: "opportunity-a",
}, first.record_id);
api.setSearchEnabled(true);
const duplicate = await ledger.claimBooking(booking("booking-a"), "request-2");
assert.equal(duplicate.acquired, false);
assert.equal(duplicate.opportunity_id, "opportunity-a");

const second = await ledger.claimBooking(booking("booking-b", "456 New Job Blvd"), "request-3");
assert.equal(second.acquired, true, "a repeat client with a new booking id must create a new Booking Job");
await ledger.completeBooking("booking-b", {
  contact_id: "contact-repeat",
  opportunity_id: "opportunity-b",
});

const unscheduledInvoiceClaim = await ledger.claimInvoice("booking-b", "invoice-request-unscheduled");
assert.equal(unscheduledInvoiceClaim.acquired, false);
assert.equal(unscheduledInvoiceClaim.reason, "missing_appointment");
assert.equal(
  unscheduledInvoiceClaim.invoice_status,
  null,
  "an unscheduled booking must not take an invoice processing lease",
);

const ambiguous = await ledger.claimAppointment({
  id: "appointment-ambiguous",
  contactId: "contact-repeat",
  calendarId: "calendar-a",
});
assert.equal(ambiguous, null, "multiple pending repeat-client jobs must never be guessed");

const addressMatched = await ledger.claimAppointment({
  id: "appointment-address-matched",
  contactId: "contact-repeat",
  calendarId: "calendar-a",
  title: "Repeat Client | 456 New Job Blvd",
});
assert.equal(addressMatched.booking_id, "booking-b", "the appointment address must select the correct repeat-client job");

const sameAddressOlder = booking("booking-same-address-older", "789 Repeat Property Rd");
sameAddressOlder.submittedAt = "2026-09-01T12:10:00.000Z";
const sameAddressNewer = booking("booking-same-address-newer", "789 Repeat Property Rd");
sameAddressNewer.submittedAt = "2026-09-01T12:20:00.000Z";
const olderClaim = await ledger.claimBooking(sameAddressOlder, "request-same-address-1");
const newerClaim = await ledger.claimBooking(sameAddressNewer, "request-same-address-2");
await ledger.completeBooking(sameAddressOlder.bookingId, {
  contact_id: "contact-same-address",
  opportunity_id: "opportunity-same-address-older",
}, olderClaim.record_id);
await ledger.completeBooking(sameAddressNewer.bookingId, {
  contact_id: "contact-same-address",
  opportunity_id: "opportunity-same-address-newer",
}, newerClaim.record_id);
const newestSameAddress = await ledger.claimAppointment({
  id: "appointment-same-address",
  contactId: "contact-same-address",
  calendarId: "calendar-a",
  title: "Repeat Client | 789 Repeat Property Rd",
});
assert.equal(
  newestSameAddress.booking_id,
  "booking-same-address-newer",
  "same-client same-address resubmissions must attach to the uniquely newest pending booking",
);

await ledger.updateAppointment("booking-a", {
  id: "appointment-a",
  calendarId: "calendar-a",
  assignedUserId: "dean-user",
  startTime: "2026-09-10T09:00:00-05:00",
  endTime: "2026-09-10T11:00:00-05:00",
}, "scheduled");
await ledger.updateAppointment("booking-b", {
  id: "appointment-address-matched",
  calendarId: "calendar-a",
  assignedUserId: "brayden-user",
  startTime: "2026-09-11T09:00:00-05:00",
  endTime: "2026-09-11T11:00:00-05:00",
}, "scheduled");

const invoiceClaim = await ledger.claimInvoice("booking-b", "invoice-request-1");
const invoiceDuplicate = await ledger.claimInvoice("booking-b", "invoice-request-2");
assert.equal(invoiceClaim.acquired, true);
assert.equal(invoiceDuplicate.acquired, false);
api.setSearchEnabled(false);
await ledger.completeInvoice(
  "booking-b",
  { id: "invoice-b", invoiceNumber: "B-1" },
  "draft",
  invoiceClaim.record_id,
);
api.setSearchEnabled(true);
const completedInvoice = await ledger.claimInvoice("booking-b", "invoice-request-3");
assert.equal(completedInvoice.acquired, false);
assert.equal(completedInvoice.invoice_id, "invoice-b");

const failed = await ledger.claimBooking(booking("booking-failed"), "request-failed-1");
assert.equal(failed.acquired, true);
await ledger.failBooking("booking-failed", "temporary upstream failure");
const recovered = await ledger.claimBooking(booking("booking-failed"), "request-failed-2");
assert.equal(recovered.acquired, true, "failed bookings must be recoverable");

const stale = await ledger.claimBooking(booking("booking-stale"), "request-stale-1");
assert.equal(stale.acquired, true);
nowMs += 3 * 60 * 1000;
const reclaimed = await ledger.claimBooking(booking("booking-stale"), "request-stale-2");
assert.equal(reclaimed.acquired, true, "expired processing leases must be recoverable");

console.log("Homegrown GHL Booking Job ledger tests passed");
