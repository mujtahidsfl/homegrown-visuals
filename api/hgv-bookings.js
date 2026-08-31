import { createGhlClient } from "./_hgv/ghl.js";
import { readJson, requestUrl, sendJson } from "./_hgv/http.js";
import { createSupabaseLedger } from "./_hgv/ledger.js";
import { normalizeBookingPayload } from "./_hgv/normalize.js";
import { createBookingOrchestrator } from "./_hgv/orchestrator.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: "Invalid JSON body" });
  }

  const url = requestUrl(req);
  try {
    const normalized = normalizeBookingPayload(payload);
    if (url.searchParams.get("dry_run") === "1" || payload?.dry_run === true) {
      return sendJson(res, 200, {
        ok: true,
        dryRun: true,
        parsed: {
          bookingId: normalized.bookingId,
          bookingPath: normalized.bookingPath,
          packageName: normalized.packageName,
          hasContact: Boolean(normalized.contact.email || normalized.contact.phone),
          hasPropertyAddress: Boolean(normalized.propertyAddress),
          lineItemCount: normalized.lineItems.length,
          calendarId: normalized.calendarId || null,
        },
      });
    }
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: error.message });
  }

  const mode = process.env.HGV_ORCHESTRATOR_MODE || "off";
  if (mode !== "live") {
    return sendJson(res, 503, { ok: false, disabled: true, mode });
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
    const result = await createBookingOrchestrator({ ledger, ghl }).submit(payload);
    return sendJson(res, result.duplicate && !result.opportunityId ? 202 : 200, result);
  } catch (error) {
    console.error("Homegrown booking orchestration failed", { message: error.message });
    return sendJson(res, 502, { ok: false, error: "Booking could not be synchronized with the CRM" });
  }
}
