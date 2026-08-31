import { createGhlClient } from "./_hgv/ghl.js";
import { readJson, requestUrl, sendJson } from "./_hgv/http.js";
import { createGhlObjectLedger } from "./_hgv/ledger.js";
import { createBookingOrchestrator } from "./_hgv/orchestrator.js";

function providedSecret(req, url) {
  return req.headers?.["x-hgv-webhook-secret"] || url.searchParams.get("secret") || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  const expectedSecret = process.env.HGV_GHL_WEBHOOK_SECRET;
  const url = requestUrl(req);
  if (!expectedSecret || providedSecret(req, url) !== expectedSecret) {
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

  try {
    const token = process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN;
    const ledger = createGhlObjectLedger({
      token,
      locationId: process.env.GHL_LOCATION_ID,
      schemaKey: process.env.HGV_GHL_BOOKING_OBJECT_KEY || "custom_objects.booking_jobs",
    });
    const ghl = createGhlClient({
      token,
      locationId: process.env.GHL_LOCATION_ID,
    });
    const result = await createBookingOrchestrator({ ledger, ghl }).syncAppointment(payload);
    return sendJson(res, result.matched ? 200 : 409, result);
  } catch (error) {
    console.error("Homegrown appointment synchronization failed", { message: error.message });
    return sendJson(res, 502, { ok: false, error: "Appointment could not be synchronized with the CRM" });
  }
}
