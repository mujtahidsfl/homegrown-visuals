// GET /api/hgv-account — the signed-in customer's own invoices.
// The customer is identified only by the verified email inside their Supabase
// access token. Emails or contact IDs in the request are never read.
import { createGhlClient } from "./_hgv/ghl.js";
import { sendJson } from "./_hgv/http.js";
import { toCustomerInvoices } from "./_hgv/customerInvoices.js";
import { verifySupabaseToken } from "./_hgv/supabaseAuth.js";

const DEFAULT_TIMEOUT_MS = 8000;

function bearerToken(req) {
  const header = String(req.headers?.authorization || req.headers?.Authorization || "");
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error("timeout"), { name: "TimeoutError" })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function invoicesForEmail(ghl, email, now) {
  const contactIds = await ghl.findContactIdsByEmail(email);
  const lists = await Promise.all(contactIds.map((id) => ghl.listContactInvoices(id)));
  const unique = new Map();
  for (const invoice of lists.flat()) {
    const id = invoice?._id || invoice?.id;
    if (id && !unique.has(id)) unique.set(id, invoice);
  }
  return toCustomerInvoices([...unique.values()], now);
}

export function createAccountHandler({
  verifyToken,
  makeGhl,
  now = () => new Date(),
  timeoutMs = DEFAULT_TIMEOUT_MS,
  log = console.error,
}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    }

    const token = bearerToken(req);
    if (!token) return sendJson(res, 401, { ok: false, error: "unauthorized" });
    const identity = await verifyToken(token);
    if (!identity?.email) return sendJson(res, 401, { ok: false, error: "unauthorized" });

    try {
      const invoices = await withTimeout(
        Promise.resolve().then(() => invoicesForEmail(makeGhl(), identity.email, now())),
        timeoutMs,
      );
      return sendJson(res, 200, { ok: true, email: identity.email, invoices });
    } catch (error) {
      // Never log the message: GHL errors can echo emails or amounts.
      log("hgv-account invoices failed", {
        requestId: req.headers?.["x-vercel-id"] || "local",
        errorName: error?.name || "Error",
        status: Number.isInteger(error?.status) ? error.status : undefined,
      });
      return sendJson(res, 503, { ok: false, error: "invoices_unavailable" });
    }
  };
}

export default createAccountHandler({
  verifyToken: (token) => verifySupabaseToken(token, process.env),
  makeGhl: () => createGhlClient({ token: process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN }),
});
