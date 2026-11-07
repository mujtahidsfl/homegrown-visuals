import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { EMAIL_LIST_TAG, normalizeEmailSignup, subscribeEmailList } from "../api/_hgv/emailList.js";
import handler from "../api/hgv-email-list.js";
import { createGhlClient } from "../api/_hgv/ghl.js";

assert.equal(EMAIL_LIST_TAG, "website-email-list");
assert.deepEqual(normalizeEmailSignup({ email: "  Subscriber@Example.com " }), { email: "subscriber@example.com" });
assert.throws(() => normalizeEmailSignup({ email: "not-an-email" }), /valid email/);
assert.throws(() => normalizeEmailSignup({}), /valid email/);
assert.throws(() => normalizeEmailSignup({ email: `${"a".repeat(260)}@example.com` }), /valid email/, "over-long input is cut and rejected");

// Real client: upsert by email only, then add the tag through the tags endpoint
// so existing tags on a returning contact are kept.
const calls = [];
const client = createGhlClient({ token: "test-only", fetchImpl: async (url, options) => {
  calls.push({ url, method: options.method, body: options.body ? JSON.parse(options.body) : null });
  const body = url.endsWith("/contacts/upsert") ? { contact: { id: "contact-1" } } : { tags: [EMAIL_LIST_TAG] };
  return new Response(JSON.stringify(body), { status: 200 });
} });
assert.deepEqual(await subscribeEmailList({ email: "subscriber@example.com" }, { ghl: client }), { ok: true, contactId: "contact-1" });
assert.equal(calls.length, 2);
assert.ok(calls[0].url.endsWith("/contacts/upsert"));
assert.equal(calls[0].body.email, "subscriber@example.com");
assert.equal(calls[0].body.tags, undefined, "upsert must not overwrite existing tags");
assert.equal(calls[0].body.name, undefined, "a sign-up must not blank an existing contact's name");
assert.ok(calls[1].url.endsWith("/contacts/contact-1/tags"));
assert.equal(calls[1].method, "POST");
assert.deepEqual(calls[1].body, { tags: [EMAIL_LIST_TAG] });

async function request(method, body, url = "/api/hgv-email-list") {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(value) { this.body = JSON.parse(value); } };
  await handler({ method, body, url }, res);
  return res;
}
assert.equal((await request("GET", {})).statusCode, 405);
assert.equal((await request("POST", "{invalid")).statusCode, 400);
assert.equal((await request("POST", { email: "nope" })).statusCode, 400);
const bot = await request("POST", { email: "bot@example.com", website: "spam" });
assert.equal(bot.statusCode, 200);
assert.equal(bot.body.ok, true);
assert.equal(bot.body.dryRun, undefined, "honeypot short-circuits before any GHL work");
const dry = await request("POST", { email: "subscriber@example.com" }, "/api/hgv-email-list?dry_run=1");
assert.equal(dry.statusCode, 200);
assert.equal(dry.body.dryRun, true);
assert.equal(dry.headers["Cache-Control"], "no-store");
const oldMode = process.env.HGV_ORCHESTRATOR_MODE;
try {
  process.env.HGV_ORCHESTRATOR_MODE = "off";
  assert.equal((await request("POST", { email: "subscriber@example.com" })).statusCode, 503);
} finally {
  if (oldMode === undefined) delete process.env.HGV_ORCHESTRATOR_MODE;
  else process.env.HGV_ORCHESTRATOR_MODE = oldMode;
}

// FormSubmit is no longer an owner-alert path. The only remaining formsubmit.co
// address is the agency backup copy.
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(tsx?|jsx?|mjs)$/.test(name) ? [path] : [];
  });
}
for (const file of [...sourceFiles("src"), ...sourceFiles("api")]) {
  const text = readFileSync(file, "utf8");
  assert.ok(!text.includes("DEAN_ALERT_ENDPOINT"), `${file} still references DEAN_ALERT_ENDPOINT`);
  assert.ok(!/formsubmit\.co\/dean/i.test(text), `${file} still posts to FormSubmit for Dean`);
  for (const match of text.matchAll(/formsubmit\.co\/[^\s"'`]+/g)) {
    assert.equal(match[0], "formsubmit.co/info@softlaunch30.com", `${file} has an unexpected FormSubmit address`);
  }
}
const footer = readFileSync("src/app/components/FooterSection.tsx", "utf8");
assert.ok(footer.includes('"/api/hgv-email-list"'), "footer sign-up goes through our API");
const pricing = readFileSync("src/app/components/TransformationSection.tsx", "utf8");
assert.ok(pricing.includes('"/api/hgv-inquiry"'), "pricing SMM form goes through the inquiry API");
const flow = readFileSync("src/app/components/ServicesBookingFlow.tsx", "utf8");
assert.ok(flow.includes('"/api/hgv-inquiry"'), "booking-flow SMM path goes through the inquiry API");

console.log("Email list sign-up, tag, honeypot, dry-run and FormSubmit removal checks passed");
