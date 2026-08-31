import assert from "node:assert/strict";
import { createBookingOrchestrator } from "../api/_hgv/orchestrator.js";
import { OPPORTUNITY_FIELD_IDS } from "../api/_hgv/config.js";

function payload(bookingId, address = "123 Current Job Ave") {
  return {
    form_type: "booking",
    website_booking_id: bookingId,
    booking_path: "real_estate",
    package: "Standard Package",
    property_address: address,
    contact: { fullName: "Repeat Client", email: "repeat@example.com", phone: "+15555550100" },
    estimated_total: 453,
    invoice_line_items: [{ id: "standard", name: "Standard Package", amount: 453, quantity: 1 }],
    schedule: { schedulerUrl: "https://api.leadconnectorhq.com/widget/booking/calendarA" },
  };
}

function discountedPayload(bookingId) {
  return {
    ...payload(bookingId),
    estimated_total: 407.7,
    invoice_line_items: [
      { id: "standard", name: "Standard Package", amount: 453, quantity: 1 },
      { id: "video_order_discount", name: "10% Video Order Discount", amount: -45.3, quantity: 1 },
    ],
  };
}

function makeHarness() {
  const rows = new Map();
  const opportunities = [];
  const updates = [];
  const invoices = [];
  const sentInvoices = [];
  let createCount = 0;

  const ledger = {
    async claimBooking(booking) {
      const existing = rows.get(booking.bookingId);
      if (existing) return { acquired: false, ...existing };
      const row = { booking_id: booking.bookingId, status: "processing", payload: booking.raw };
      rows.set(booking.bookingId, row);
      return { acquired: true, ...row };
    },
    async completeBooking(bookingId, values) {
      const row = { ...rows.get(bookingId), ...values, status: "opportunity_created" };
      rows.set(bookingId, row);
      return row;
    },
    async failBooking(bookingId, error) {
      rows.set(bookingId, { ...rows.get(bookingId), status: "failed", error: String(error) });
    },
    async claimAppointment(appointment) {
      const exact = [...rows.values()].find((row) => row.appointment_id === appointment.id);
      if (exact) return exact;
      const candidates = [...rows.values()].filter(
        (row) => row.contact_id === appointment.contactId && !row.appointment_id && row.status === "opportunity_created",
      );
      if (candidates.length !== 1) return null;
      candidates[0].appointment_id = appointment.id;
      return candidates[0];
    },
    async updateAppointment(bookingId, appointment, status) {
      const row = { ...rows.get(bookingId), appointment_id: appointment.id, status };
      rows.set(bookingId, row);
      return row;
    },
    async claimInvoice(bookingId) {
      const row = rows.get(bookingId);
      if (!row) return null;
      if (row.invoice_id) return { acquired: false, ...row };
      if (row.invoice_status === "processing") return { acquired: false, ...row };
      row.invoice_status = "processing";
      return { acquired: true, ...row };
    },
    async completeInvoice(bookingId, invoice, status) {
      const row = { ...rows.get(bookingId), invoice_id: invoice.id, invoice_status: status };
      rows.set(bookingId, row);
      return row;
    },
    async failInvoice(bookingId, error) {
      rows.set(bookingId, { ...rows.get(bookingId), invoice_status: "failed", error: String(error) });
    },
  };

  const ghl = {
    async upsertContact() {
      return { id: "contact-repeat" };
    },
    async findOpportunityByBookingId(_contactId, bookingId) {
      return opportunities.find((opportunity) => opportunity.bookingId === bookingId) || null;
    },
    async createOpportunity(booking) {
      createCount += 1;
      const opportunity = { id: `opportunity-${createCount}`, bookingId: booking.bookingId };
      opportunities.push(opportunity);
      return opportunity;
    },
    async updateOpportunity(id, changes) {
      updates.push({ id, changes });
      return { id, ...changes };
    },
    async findInvoiceByBookingId(bookingId) {
      return invoices.find((invoice) => invoice.booking.bookingId === bookingId) || null;
    },
    async createInvoiceDraft({ booking, contactId, dueDays }) {
      const invoice = {
        id: `invoice-${invoices.length + 1}`,
        invoiceNumber: String(invoices.length + 1),
        booking,
        contactId,
        dueDays,
      };
      invoices.push(invoice);
      return invoice;
    },
    async sendInvoice(id, options) {
      sentInvoices.push({ id, options });
    },
  };

  return {
    rows,
    opportunities,
    updates,
    invoices,
    sentInvoices,
    get createCount() { return createCount; },
    orchestrator: createBookingOrchestrator({ ledger, ghl, requestIdFactory: () => "00000000-0000-4000-8000-000000000001" }),
  };
}

const harness = makeHarness();
const first = await harness.orchestrator.submit(payload("booking-a"));
const retry = await harness.orchestrator.submit(payload("booking-a"));
assert.equal(first.opportunityId, "opportunity-1");
assert.equal(retry.opportunityId, "opportunity-1");
assert.equal(retry.duplicate, true);
assert.equal(harness.createCount, 1, "same booking id must create exactly one opportunity");

const secondJob = await harness.orchestrator.submit(payload("booking-b", "456 New Job Blvd"));
assert.equal(secondJob.opportunityId, "opportunity-2");
assert.equal(harness.createCount, 2, "same contact with a new booking id must create a new opportunity");

// Keep one unbound booking for an exact appointment synchronization test.
harness.rows.get("booking-b").contact_id = "contact-repeat";
harness.rows.get("booking-a").appointment_id = "old-appointment";
const scheduled = await harness.orchestrator.syncAppointment({
  type: "AppointmentCreate",
  locationId: "pwyt4yVmaVxmQpVX040D",
  appointment: {
    id: "appointment-b",
    contactId: "contact-repeat",
    calendarId: "calendarA",
    assignedUserId: "brayden-user-id",
    appointmentStatus: "confirmed",
    startTime: "2026-09-10T09:00:00-05:00",
    endTime: "2026-09-10T11:00:00-05:00",
  },
});
assert.equal(scheduled.bookingId, "booking-b");
assert.equal(scheduled.opportunityId, "opportunity-2");
assert.equal(harness.updates.at(-1).changes.assignedTo, "brayden-user-id");
assert.equal(harness.updates.at(-1).changes.pipelineStageId, "60e2ebde-9f69-4167-8c25-067036a400db");
const fields = new Map(harness.updates.at(-1).changes.customFields.map((field) => [field.id, field.fieldValue]));
assert.equal(fields.get(OPPORTUNITY_FIELD_IDS.meetingDate), "September 10, 2026");
assert.equal(fields.get(OPPORTUNITY_FIELD_IDS.meetingStart), "9:00 AM");
assert.equal(fields.get(OPPORTUNITY_FIELD_IDS.meetingEnd), "11:00 AM");

await harness.orchestrator.syncAppointment({
  type: "AppointmentUpdate",
  appointment: {
    id: "appointment-b",
    contactId: "contact-repeat",
    calendarId: "calendarA",
    assignedUserId: "brayden-user-id",
    appointmentStatus: "confirmed",
    startTime: "2026-09-11T13:30:00-05:00",
    endTime: "2026-09-11T15:30:00-05:00",
  },
});
const updatedFields = new Map(harness.updates.at(-1).changes.customFields.map((field) => [field.id, field.fieldValue]));
assert.equal(harness.updates.at(-1).id, "opportunity-2", "reschedule must update the same opportunity");
assert.equal(harness.updates.at(-1).changes.pipelineStageId, undefined, "reschedule must not reset the pipeline stage");
assert.equal(updatedFields.get(OPPORTUNITY_FIELD_IDS.meetingDate), "September 11, 2026");
assert.equal(updatedFields.get(OPPORTUNITY_FIELD_IDS.meetingStart), "1:30 PM");
assert.equal(updatedFields.get(OPPORTUNITY_FIELD_IDS.meetingEnd), "3:30 PM");

const cancelled = await harness.orchestrator.syncAppointment({
  type: "AppointmentDelete",
  appointment: { id: "appointment-b", contactId: "contact-repeat", calendarId: "calendarA" },
});
assert.equal(cancelled.status, "cancelled");
assert.equal(harness.rows.get("booking-b").status, "cancelled");
assert.equal(harness.updates.length, 2, "cancellation without assignment or times must not send an empty GHL update");

const topLevel = makeHarness();
await topLevel.orchestrator.submit(payload("booking-top-level"));
topLevel.rows.get("booking-top-level").contact_id = "contact-repeat";
await topLevel.orchestrator.syncAppointment({
  type: "AppointmentCreate",
  id: "appointment-top-level",
  contactId: "contact-repeat",
  calendarId: "calendarA",
  assignedUserId: "dean-user-id",
  appointmentStatus: "confirmed",
  startTime: "2026-09-12T10:00:00-05:00",
  endTime: "2026-09-12T12:00:00-05:00",
});
assert.equal(topLevel.updates[0].changes.assignedTo, "dean-user-id");
assert.equal(topLevel.updates[0].changes.customFields.length, 3);

const ambiguous = makeHarness();
await ambiguous.orchestrator.submit(payload("booking-c"));
await ambiguous.orchestrator.submit(payload("booking-d"));
ambiguous.rows.get("booking-c").contact_id = "contact-repeat";
ambiguous.rows.get("booking-d").contact_id = "contact-repeat";
const noGuess = await ambiguous.orchestrator.syncAppointment({
  type: "AppointmentCreate",
  appointment: { id: "ambiguous-appointment", contactId: "contact-repeat", calendarId: "calendarA" },
});
assert.equal(noGuess.matched, false);
assert.equal(ambiguous.updates.length, 0, "ambiguous repeat-client bookings must never update a guessed opportunity");

const invoiceHarness = makeHarness();
await invoiceHarness.orchestrator.submit({
  ...discountedPayload("booking-invoice"),
  property_address: "9911 Itemized Invoice Ave",
});
invoiceHarness.rows.get("booking-invoice").assigned_user_id = "dean-user-id";
const draftInvoice = await invoiceHarness.orchestrator.createInvoice({
  bookingId: "booking-invoice",
  sendMode: "draft",
  dueDays: 7,
});
const duplicateInvoice = await invoiceHarness.orchestrator.createInvoice({
  bookingId: "booking-invoice",
  sendMode: "draft",
  dueDays: 7,
});
assert.equal(draftInvoice.invoiceId, "invoice-1");
assert.equal(draftInvoice.reconciled, false);
assert.equal(duplicateInvoice.invoiceId, "invoice-1");
assert.equal(duplicateInvoice.duplicate, true);
assert.equal(invoiceHarness.invoices.length, 1, "same booking id must create exactly one invoice");
assert.equal(invoiceHarness.invoices[0].booking.propertyAddress, "9911 Itemized Invoice Ave");
assert.deepEqual(invoiceHarness.invoices[0].booking.lineItems.map((item) => item.name), [
  "Standard Package",
  "10% Video Order Discount",
]);
assert.deepEqual(invoiceHarness.invoices[0].booking.lineItems.map((item) => item.amount), [453, -45.3]);
assert.equal(invoiceHarness.sentInvoices.length, 0, "draft mode must not email, text, or charge the client");

const compactLedgerHarness = makeHarness();
await compactLedgerHarness.orchestrator.submit(payload("booking-compact-ledger"));
const compactRow = compactLedgerHarness.rows.get("booking-compact-ledger");
compactRow.payload = {
  ...compactRow.payload,
  bookingId: "booking-compact-ledger",
  contact: {
    fullName: "Repeat Client",
    firstName: "Repeat",
    lastName: "Client",
    email: "repeat@example.com",
    phone: "+15555550100",
  },
  packageName: "Standard Package",
  propertyAddress: "123 Current Job Ave",
  lineItems: [{ id: "standard", name: "Standard Package", amount: 453, quantity: 1 }],
};
const compactInvoice = await compactLedgerHarness.orchestrator.createInvoice({
  bookingId: "booking-compact-ledger",
  sendMode: "draft",
  dueDays: 7,
});
assert.equal(compactInvoice.invoiceId, "invoice-1");
assert.equal(
  compactLedgerHarness.invoices[0].booking.propertyAddress,
  "123 Current Job Ave",
  "the invoice path must consume the compact GHL Booking Job snapshot",
);

const recoveryHarness = makeHarness();
await recoveryHarness.orchestrator.submit(payload("booking-recovery"));
const recoveredBooking = recoveryHarness.rows.get("booking-recovery");
recoveryHarness.invoices.push({
  id: "invoice-existing",
  status: "draft",
  invoiceNumber: "existing",
  booking: { ...discountedPayload("booking-recovery"), bookingId: "booking-recovery" },
});
recoveredBooking.invoice_status = null;
const recoveredInvoice = await recoveryHarness.orchestrator.createInvoice({
  bookingId: "booking-recovery",
  sendMode: "draft",
});
assert.equal(recoveredInvoice.invoiceId, "invoice-existing");
assert.equal(recoveredInvoice.reconciled, true, "retry after a partial failure must reuse the existing GHL invoice");
assert.equal(recoveryHarness.invoices.length, 1);

const sendHarness = makeHarness();
await sendHarness.orchestrator.submit(payload("booking-send"));
sendHarness.rows.get("booking-send").assigned_user_id = "dean-user-id";
await sendHarness.orchestrator.createInvoice({ bookingId: "booking-send", sendMode: "email", dueDays: 7 });
assert.deepEqual(sendHarness.sentInvoices[0], {
  id: "invoice-1",
  options: { userId: "dean-user-id", action: "email" },
});

console.log("Homegrown orchestrator tests passed");
