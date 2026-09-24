import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createGhlClient } from "../api/_hgv/ghl.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const baseUrl = "https://services.leadconnectorhq.com";
const locationId = process.env.GHL_LOCATION_ID || "pwyt4yVmaVxmQpVX040D";
const bookingObjectKey = process.env.HGV_GHL_BOOKING_OBJECT_KEY || "custom_objects.booking_jobs";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

for (const candidate of [
  resolve(repoRoot, ".env"),
  resolve(repoRoot, "..", ".env"),
  resolve(repoRoot, "..", "..", ".env"),
  resolve(process.env.HOME || "", ".claude", ".env"),
]) loadEnvFile(candidate);

const token = process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN;
const send = process.argv.includes("--send");
const deliverOnly = process.argv.includes("--deliver-only");
const requestedNumbers = process.argv.filter((value) => /^INV-\d+$/i.test(value));
if (!token) throw new Error("Missing GHL token");
if (!requestedNumbers.length) throw new Error("Pass one or more invoice numbers such as INV-000038");

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "v3",
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${response.status} ${path}: ${parsed.message || "GHL request failed"}`);
  return parsed;
}

function displayNumber(invoice) {
  return `${invoice.invoiceNumberPrefix || ""}${invoice.invoiceNumber || ""}`;
}

async function bookingRecord(bookingId) {
  const search = await request(`/objects/${bookingObjectKey}/records/search`, {
    method: "POST",
    body: { locationId, page: 1, pageLimit: 100, query: bookingId, searchAfter: [] },
  });
  const summary = (search.records || []).find(
    (record) => String(record.properties?.website_booking_id || "") === bookingId,
  );
  if (!summary) throw new Error(`No Booking Job found for ${bookingId}`);
  const detail = await request(
    `/objects/${bookingObjectKey}/records/${summary.id}?locationId=${encodeURIComponent(locationId)}`,
  );
  return detail.record || detail;
}

const query = new URLSearchParams({ altId: locationId, altType: "location", limit: "100", offset: "0" });
const invoices = (await request(`/invoices/?${query}`)).invoices || [];
const ghl = createGhlClient({ token, locationId });
const results = [];

for (const requestedNumber of requestedNumbers) {
  const invoice = invoices.find(
    (candidate) => displayNumber(candidate).toLowerCase() === requestedNumber.toLowerCase(),
  );
  if (!invoice) throw new Error(`Invoice ${requestedNumber} was not found`);
  if (invoice.status === "paid" || Number(invoice.amountPaid || 0) > 0) {
    throw new Error(`Invoice ${requestedNumber} has a payment and will not be resent`);
  }
  if (invoice.status !== "sent") throw new Error(`Invoice ${requestedNumber} is ${invoice.status}, not sent`);
  const bookingId = String(invoice.name || "").match(/^\[HGV:([^\]]+)]/)?.[1] || "";
  if (!bookingId) throw new Error(`Invoice ${requestedNumber} has no HGV booking id`);
  const record = await bookingRecord(bookingId);
  const booking = JSON.parse(record.properties?.payload_json || "null");
  if (!booking?.bookingId || !booking?.contact || !Array.isArray(booking?.lineItems)) {
    throw new Error(`Booking Job for ${requestedNumber} has an invalid booking snapshot`);
  }
  const userId = process.env.HGV_INVOICE_SENDER_USER_ID || record.properties?.assigned_user_id || "";
  if (!userId) throw new Error(`Invoice ${requestedNumber} has no sender user id`);
  const bookingTotal = booking.lineItems.reduce(
    (total, item) => total + Number(item.amount || 0) * Number(item.quantity || 1),
    0,
  );
  if (Math.abs(bookingTotal - Number(invoice.total)) > 0.01) {
    throw new Error(`Booking total does not match ${requestedNumber}; replacement stopped`);
  }

  if (!send) {
    results.push({
      invoiceNumber: requestedNumber,
      status: deliverOnly ? "ready_to_deliver" : "ready_to_replace",
      amount: invoice.total,
    });
    continue;
  }

  if (deliverOnly) {
    const delivered = await ghl.createAndSendInvoice({
      booking,
      contactId: record.properties?.contact_id || invoice.contactDetails?.id,
      userId,
      invoiceId: invoice._id || invoice.id,
    });
    results.push({
      invoiceNumber: requestedNumber,
      status: "email_queued",
      amount: invoice.total,
      paymentHost: new URL(delivered.invoiceUrl).hostname,
      paymentLinkVerified: true,
    });
    continue;
  }

  const replacementDraft = await ghl.createInvoicePaymentDraft({
    booking,
    contactId: record.properties?.contact_id || invoice.contactDetails?.id,
    userId,
  });
  await request(`/invoices/${invoice._id || invoice.id}/void`, {
    method: "POST",
    body: { altId: locationId, altType: "location" },
  });
  const updated = await ghl.createAndSendInvoice({
    booking,
    contactId: record.properties?.contact_id || invoice.contactDetails?.id,
    userId,
    invoiceId: replacementDraft.id,
  });
  await request(
    `/objects/${bookingObjectKey}/records/${record.id}?locationId=${encodeURIComponent(locationId)}`,
    {
      method: "PUT",
      body: {
        properties: {
          invoice_id: updated.id,
          invoice_number: `${updated.invoiceNumberPrefix || ""}${updated.invoiceNumber || ""}`,
          invoice_status: "sent",
          error: "",
        },
      },
    },
  );
  results.push({
    replacedInvoiceNumber: requestedNumber,
    invoiceNumber: `${updated.invoiceNumberPrefix || ""}${updated.invoiceNumber || ""}`,
    status: updated.status,
    amount: invoice.total,
    paymentHost: new URL(updated.invoiceUrl).hostname,
    paymentLinkVerified: true,
  });
}

console.log(JSON.stringify({ mode: send ? "sent" : "dry-run", results }, null, 2));
