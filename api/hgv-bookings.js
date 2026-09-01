import { createGhlClient } from "./_hgv/ghl.js";
import { readJson, requestUrl, sendJson } from "./_hgv/http.js";
import { createGhlObjectLedger } from "./_hgv/ledger.js";
import { normalizeBookingPayload } from "./_hgv/normalize.js";
import { createBookingOrchestrator } from "./_hgv/orchestrator.js";

const SETTLE_DELAYS_MS = [250, 500, 1000, 2000];

export async function submitWithSettling(orchestrator, payload, {
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
} = {}) {
  let result = await orchestrator.submit(payload);
  for (const delay of SETTLE_DELAYS_MS) {
    if (!result.duplicate || result.opportunityId) break;
    await sleep(delay);
    result = await orchestrator.submit(payload);
  }
  return result;
}

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
    const result = await submitWithSettling(createBookingOrchestrator({ ledger, ghl }), payload);
    if (result.duplicate && !result.opportunityId) {
      return sendJson(res, 503, {
        ok: false,
        pending: true,
        bookingId: result.bookingId,
        error: "Booking is still being synchronized with the CRM",
      });
    }
    return sendJson(res, 200, result);
  } catch (error) {
    console.error("Homegrown booking orchestration failed", { message: error.message });
    return sendJson(res, 502, { ok: false, error: "Booking could not be synchronized with the CRM" });
  }
}
