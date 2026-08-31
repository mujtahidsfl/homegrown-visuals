import { createGhlClient } from "./_hgv/ghl.js";
import { readJson, requestUrl, sendJson } from "./_hgv/http.js";
import { createSupabaseLedger } from "./_hgv/ledger.js";
import { createBookingOrchestrator } from "./_hgv/orchestrator.js";

function providedSecret(req, url) {
  return req.headers?.["x-hgv-webhook-secret"] || url.searchParams.get("secret") || "";
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
  const bookingId = String(payload.website_booking_id || payload.booking_id || "").trim();
  const sendMode = process.env.HGV_INVOICE_SEND_MODE || "draft";
  if (!["draft", "email", "sms", "sms_and_email"].includes(sendMode)) {
    return sendJson(res, 500, { ok: false, error: "Invalid invoice send mode" });
  }

  try {
    const ledger = createSupabaseLedger({
      url: process.env.HGV_SUPABASE_URL,
      serviceRoleKey: process.env.HGV_SUPABASE_SERVICE_ROLE_KEY,
    });
    const ghl = createGhlClient({
      token: process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN,
      locationId: process.env.GHL_LOCATION_ID,
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
