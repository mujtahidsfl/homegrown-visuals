import { createGhlClient } from "./_hgv/ghl.js";
import { OPPORTUNITY_FIELD_IDS } from "./_hgv/config.js";
import { readJson, requestUrl, sendJson } from "./_hgv/http.js";
import { createGhlObjectLedger } from "./_hgv/ledger.js";
import { createBookingOrchestrator } from "./_hgv/orchestrator.js";

function providedSecret(req, url) {
  return req.headers?.["x-hgv-webhook-secret"] || url.searchParams.get("secret") || "";
}

function normalizedKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function nestedValue(source, acceptedKeys, depth = 0) {
  if (!source || typeof source !== "object" || depth > 5) return "";
  const entries = Object.entries(source);
  for (const [key, value] of entries) {
    if (acceptedKeys.has(normalizedKey(key)) && ["string", "number"].includes(typeof value)) {
      const candidate = String(value).trim();
      if (candidate) return candidate;
    }
  }
  for (const [, value] of entries) {
    if (value && typeof value === "object") {
      const candidate = nestedValue(value, acceptedKeys, depth + 1);
      if (candidate) return candidate;
    }
  }
  return "";
}

export function extractInvoiceIdentifiers(payload) {
  const bookingId = nestedValue(payload, new Set(["websitebookingid", "bookingid"]));
  const opportunityId = nestedValue(payload, new Set(["opportunityid"]));
  return { bookingId, opportunityId };
}

function fieldValue(field) {
  return field?.fieldValue ?? field?.fieldValueString ?? field?.value ?? "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }
  const url = requestUrl(req);
  if (!process.env.HGV_GHL_WEBHOOK_SECRET || providedSecret(req, url) !== process.env.HGV_GHL_WEBHOOK_SECRET) {
    return sendJson(res, 401, { ok: false, error: "Invalid webhook secret" });
  }
  const mode = process.env.HGV_ORCHESTRATOR_MODE || "off";
  if (mode !== "live") {
    return sendJson(res, 503, { ok: false, disabled: true, mode });
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
  }
  const identifiers = extractInvoiceIdentifiers(payload);
  let bookingId = identifiers.bookingId;
  let token;
  let ghl;
  if (!bookingId && identifiers.opportunityId) {
    try {
      token = process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN;
      ghl = createGhlClient({ token, locationId: process.env.GHL_LOCATION_ID });
      const opportunity = await ghl.getOpportunity(identifiers.opportunityId);
      const bookingField = (opportunity.customFields || []).find(
        (field) => field.id === OPPORTUNITY_FIELD_IDS.websiteBookingId,
      );
      bookingId = String(fieldValue(bookingField)).trim();
    } catch {
      bookingId = "";
    }
  }
  if (!bookingId) {
    return sendJson(res, 400, { ok: false, error: "Missing website booking id" });
  }
  const sendMode = process.env.HGV_INVOICE_SEND_MODE || "draft";
  if (!["draft", "email", "sms", "sms_and_email"].includes(sendMode)) {
    return sendJson(res, 500, { ok: false, error: "Invalid invoice send mode" });
  }

  try {
    token ||= process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN;
    ghl ||= createGhlClient({ token, locationId: process.env.GHL_LOCATION_ID });
    const ledger = createGhlObjectLedger({
      token,
      locationId: process.env.GHL_LOCATION_ID,
      schemaKey: process.env.HGV_GHL_BOOKING_OBJECT_KEY || "custom_objects.booking_jobs",
    });
    const result = await createBookingOrchestrator({ ledger, ghl }).createInvoice({
      bookingId,
      sendMode,
      dueDays: Number(process.env.HGV_INVOICE_DUE_DAYS || 7),
      senderUserId: process.env.HGV_INVOICE_SENDER_USER_ID || "",
    });
    return sendJson(res, 200, result);
  } catch (error) {
    console.error("Homegrown invoice orchestration failed", { message: error.message });
    return sendJson(res, 502, { ok: false, error: "Invoice could not be created" });
  }
}
