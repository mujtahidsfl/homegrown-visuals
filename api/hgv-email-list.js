import { createGhlClient } from "./_hgv/ghl.js";
import { readJson, requestUrl, sendJson } from "./_hgv/http.js";
import { normalizeEmailSignup, subscribeEmailList } from "./_hgv/emailList.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }
  let signup;
  try {
    const payload = await readJson(req);
    if (payload?.website) return sendJson(res, 200, { ok: true });
    signup = normalizeEmailSignup(payload);
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: error.message });
  }
  if (requestUrl(req).searchParams.get("dry_run") === "1") {
    return sendJson(res, 200, { ok: true, dryRun: true });
  }
  if (process.env.HGV_ORCHESTRATOR_MODE !== "live") {
    return sendJson(res, 503, { ok: false, error: "Email sign-up is temporarily unavailable" });
  }
  try {
    const ghl = createGhlClient({ token: process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN, locationId: process.env.GHL_LOCATION_ID });
    const result = await subscribeEmailList(signup, { ghl });
    return sendJson(res, 200, { ok: result.ok });
  } catch (error) {
    console.error("Homegrown email list sign-up failed", { message: error.message });
    return sendJson(res, 502, { ok: false, error: "We couldn't add you to the list. Please try again." });
  }
}
