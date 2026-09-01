import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createGhlClient } from "../api/_hgv/ghl.js";
import { createGhlObjectLedger } from "../api/_hgv/ledger.js";
import { createBookingOrchestrator } from "../api/_hgv/orchestrator.js";
import { HGV_LOCATION_ID, HGV_STAGE_IDS, OPPORTUNITY_FIELD_IDS } from "../api/_hgv/config.js";

const BASE_URL = "https://services.leadconnectorhq.com";
const BOOKING_OBJECT_KEY = process.env.HGV_GHL_BOOKING_OBJECT_KEY || "custom_objects.booking_jobs";
const E2E_BASE_URL = String(process.env.HGV_E2E_BASE_URL || "").replace(/\/$/, "");

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv(resolve(process.cwd(), ".env"));

if (process.env.HGV_E2E_CONFIRM !== "NO_CHARGE_DRAFT_ONLY") {
  throw new Error("Refusing to run: set HGV_E2E_CONFIRM=NO_CHARGE_DRAFT_ONLY for this guarded test");
}

const token = process.env.GHL_PIT;
const locationId = process.env.GHL_LOCATION_ID || HGV_LOCATION_ID;
if (!token) throw new Error("Missing GHL_PIT");
if (E2E_BASE_URL && !process.env.HGV_GHL_WEBHOOK_SECRET) throw new Error("Missing HGV_GHL_WEBHOOK_SECRET");
if (E2E_BASE_URL && !process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
  throw new Error("Missing VERCEL_AUTOMATION_BYPASS_SECRET");
}

async function request(path, { method = "GET", body, version = "v3", allowNotFound = false } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: version,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { message: text.slice(0, 300) };
  }
  if (!response.ok && !(allowNotFound && response.status === 404)) {
    throw new Error(`${method} ${path} failed (${response.status}): ${parsed.message || parsed.error || "unknown error"}`);
  }
  return parsed;
}

async function requestPreview(path, body) {
  const response = await fetch(`${E2E_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hgv-webhook-secret": process.env.HGV_GHL_WEBHOOK_SECRET,
      "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
    },
    body: JSON.stringify(body),
  });
  const parsed = await response.json();
  if (!response.ok) {
    throw new Error(`POST ${path} failed (${response.status}): ${parsed.error || "unknown error"}`);
  }
  return parsed;
}

async function bookingJobRecord(bookingId) {
  const body = await request(`/objects/${BOOKING_OBJECT_KEY}/records/search`, {
    method: "POST",
    body: { locationId, page: 1, pageLimit: 20, query: bookingId, searchAfter: [] },
  });
  return (body.records || []).find(
    (record) => String(record.properties?.website_booking_id || "") === bookingId,
  ) || null;
}

const suffix = randomUUID();
const bookingId = `hgv-e2e-${suffix}`;
const contactEmail = `${bookingId}@example.com`;
const propertyAddress = "1000 HGV No Charge Test Avenue, Pensacola, FL 32501";
const cleanup = { bookingRecordId: "", invoiceId: "", opportunityId: "", contactId: "" };

try {
  const realGhl = createGhlClient({ token, locationId });
  const contact = await realGhl.upsertContact({
    fullName: "HGV No Charge Test",
    firstName: "HGV",
    lastName: "No Charge Test",
    email: contactEmail,
    phone: "",
  });
  cleanup.contactId = contact.id;

  await request(`/contacts/${contact.id}`, {
    method: "PUT",
    version: "2021-07-28",
    body: { dnd: true, source: "Homegrown Visuals No-Charge E2E" },
  });
  const protectedContact = (await request(`/contacts/${contact.id}`, { version: "2021-07-28" })).contact || {};
  assert.equal(protectedContact.dnd, true, "synthetic contact must be do-not-contact before opportunity creation");

  const payload = {
    form_type: "booking",
    website_booking_id: bookingId,
    booking_path: "real_estate",
    package: "HGV No Charge Test Package",
    property_address: propertyAddress,
    sqft_tier: "test_only",
    contact: { fullName: "HGV No Charge Test", email: contactEmail, phone: "" },
    estimated_total: 74,
    invoice_line_items: [
      { id: "e2e-package", name: "HGV Test Package", category: "Package", amount: 49, quantity: 1 },
      { id: "e2e-drone", name: "Drone Clip", category: "Add-Ons", amount: 25, quantity: 1 },
    ],
    schedule: { schedulerUrl: "https://api.leadconnectorhq.com/widget/booking/8rsj2UGk2h7YI1Nfm1Ct" },
    submitted_at: new Date().toISOString(),
    source_page: "HGV guarded no-charge E2E",
  };

  const ledger = createGhlObjectLedger({
    token,
    locationId,
    schemaKey: BOOKING_OBJECT_KEY,
  });
  const ghl = {
    ...realGhl,
    async upsertContact() {
      return { id: contact.id, raw: protectedContact };
    },
  };
  const orchestrator = createBookingOrchestrator({ ledger, ghl });
  const submitted = E2E_BASE_URL
    ? await requestPreview("/api/hgv-bookings", payload)
    : await orchestrator.submit(payload);
  cleanup.opportunityId = submitted.opportunityId;
  const duplicateBooking = E2E_BASE_URL
    ? await requestPreview("/api/hgv-bookings", payload)
    : await orchestrator.submit(payload);
  assert.equal(duplicateBooking.duplicate, true);
  assert.equal(duplicateBooking.opportunityId, submitted.opportunityId);

  if (E2E_BASE_URL) {
    const appointment = await requestPreview("/api/hgv-ghl-webhook", {
      id: `hgv-appointment-${suffix}`,
      contactId: contact.id,
      assignedUserId: "",
      appointmentStatus: "new",
      title: "HGV No Charge Test Appointment",
      address: propertyAddress,
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    });
    assert.equal(appointment.matched, true);
    assert.equal(appointment.bookingId, bookingId);
    assert.equal(appointment.opportunityId, submitted.opportunityId);
  }

  const invoice = E2E_BASE_URL
    ? await requestPreview("/api/hgv-invoice", { website_booking_id: bookingId })
    : await orchestrator.createInvoice({ bookingId, sendMode: "draft", dueDays: 7 });
  cleanup.invoiceId = invoice.invoiceId;
  const duplicateInvoice = E2E_BASE_URL
    ? await requestPreview("/api/hgv-invoice", { website_booking_id: bookingId })
    : await orchestrator.createInvoice({ bookingId, sendMode: "draft", dueDays: 7 });
  assert.equal(duplicateInvoice.duplicate, true);
  assert.equal(duplicateInvoice.invoiceId, invoice.invoiceId);

  const opportunity = (await request(`/opportunities/${submitted.opportunityId}`)).opportunity || {};
  const opportunityFields = new Map(
    (opportunity.customFields || []).map((field) => [
      field.id,
      field.fieldValueString ?? field.fieldValueDate ?? field.fieldValue ?? field.value ?? "",
    ]),
  );
  assert.equal(opportunityFields.get(OPPORTUNITY_FIELD_IDS.websiteBookingId), bookingId);
  assert.equal(opportunityFields.get(OPPORTUNITY_FIELD_IDS.propertyAddress), propertyAddress);
  if (E2E_BASE_URL) assert.equal(opportunity.pipelineStageId, HGV_STAGE_IDS.awaitingConfirmation);

  const invoiceRecord = await request(
    `/invoices/${invoice.invoiceId}?altId=${encodeURIComponent(locationId)}&altType=location`,
  );
  const invoiceBody = invoiceRecord.invoice || invoiceRecord;
  assert.equal(invoiceBody.status, "draft", "the E2E invoice must remain a draft");
  assert.equal(invoiceBody.amountPaid || 0, 0, "the E2E invoice must not charge anything");
  assert.match(String(invoiceBody.name || ""), new RegExp(bookingId));
  const itemNames = (invoiceBody.invoiceItems || invoiceBody.items || []).map((item) => item.name);
  assert.deepEqual(itemNames, ["HGV Test Package", "Drone Clip"]);
  assert.match(String(invoiceBody.termsNotes || ""), /1000 HGV No Charge Test Avenue/);

  const bookingRecord = await bookingJobRecord(bookingId);
  assert.ok(bookingRecord?.id, "the GHL Booking Job record must exist");
  cleanup.bookingRecordId = bookingRecord.id;

  console.log(JSON.stringify({
    ok: true,
    draftOnly: true,
    charged: false,
    duplicateBookingSuppressed: true,
    duplicateInvoiceSuppressed: true,
    previewApiVerified: Boolean(E2E_BASE_URL),
    appointmentReconciliationVerified: Boolean(E2E_BASE_URL),
    opportunityFieldsVerified: true,
    invoiceItemizationVerified: true,
    invoiceAddressVerified: true,
  }, null, 2));
} finally {
  if (!cleanup.bookingRecordId) {
    cleanup.bookingRecordId = (await bookingJobRecord(bookingId).catch(() => null))?.id || "";
  }
  const cleanupErrors = [];
  const remove = async (label, path, options = {}) => {
    try {
      await request(path, { method: "DELETE", allowNotFound: true, ...options });
    } catch (error) {
      cleanupErrors.push(`${label}: ${error.message}`);
    }
  };
  if (cleanup.invoiceId) {
    await remove("invoice", `/invoices/${cleanup.invoiceId}?altId=${encodeURIComponent(locationId)}&altType=location`);
  }
  if (cleanup.opportunityId) await remove("opportunity", `/opportunities/${cleanup.opportunityId}`);
  if (cleanup.bookingRecordId) {
    await remove("booking job", `/objects/${BOOKING_OBJECT_KEY}/records/${cleanup.bookingRecordId}`);
  }
  if (cleanup.contactId) await remove("contact", `/contacts/${cleanup.contactId}`, { version: "2021-07-28" });
  if (cleanupErrors.length) throw new Error(`Synthetic cleanup failed: ${cleanupErrors.join("; ")}`);
}
