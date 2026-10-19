import { createGhlClient } from "./_hgv/ghl.js";
import { createGhlObjectLedger } from "./_hgv/ledger.js";
import { readJson, requestUrl, sendJson } from "./_hgv/http.js";
import { normalizeInquiry, submitInquiry } from "./_hgv/inquiry.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }
  let payload;
  let inquiry;
  try {
    payload = await readJson(req);
    if (payload?.website) return sendJson(res, 200, { ok: true });
    inquiry = normalizeInquiry(payload);
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: error.message });
  }
  if (requestUrl(req).searchParams.get("dry_run") === "1") {
    return sendJson(res, 200, { ok: true, dryRun: true, smsRequested: inquiry.smsConsent });
  }
  if (process.env.HGV_ORCHESTRATOR_MODE !== "live") {
    return sendJson(res, 503, { ok: false, error: "Inquiry submission is temporarily unavailable" });
  }
  try {
    const config = { token: process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN, locationId: process.env.GHL_LOCATION_ID };
    const result = await submitInquiry(inquiry, {
      ledger: createGhlObjectLedger({ ...config, schemaKey: process.env.HGV_GHL_BOOKING_OBJECT_KEY || "custom_objects.booking_jobs" }),
      ghl: createGhlClient(config),
    });
    return sendJson(res, result.ok ? 200 : 503, result);
  } catch (error) {
    console.error("Homegrown inquiry failed", { message: error.message });
    return sendJson(res, 502, { ok: false, error: "We couldn't submit your inquiry. Please try again." });
  }
}
