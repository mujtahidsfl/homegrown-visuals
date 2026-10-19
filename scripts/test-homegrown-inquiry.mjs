import assert from "node:assert/strict";
import { INQUIRY_SMS_CONSENT, normalizeInquiry, submitInquiry } from "../api/_hgv/inquiry.js";
import handler from "../api/hgv-inquiry.js";
import { createGhlClient } from "../api/_hgv/ghl.js";
import { HGV_RETAINER_PIPELINE_ID, HGV_RETAINER_LEAD_STAGE_ID, OPPORTUNITY_FIELD_IDS } from "../api/_hgv/config.js";

const payload = {
  inquiry_id: "inquiry-test-123",
  contact: { fullName: "Inquiry Test", email: "INQUIRY@example.com", phone: "(850) 555-0100" },
  message: "Please tell me about social media packages.",
};
const inquiry = normalizeInquiry(payload);
assert.equal(inquiry.contact.phone, "+18505550100");
assert.equal(inquiry.contact.email, "inquiry@example.com");
assert.equal(inquiry.smsConsent, false);
assert.notEqual(inquiry.specialRequests, INQUIRY_SMS_CONSENT);
assert.equal(normalizeInquiry({ ...payload, sms_consent: true }).specialRequests, INQUIRY_SMS_CONSENT);
assert.equal(normalizeInquiry({ ...payload, sms_consent: "true", message: INQUIRY_SMS_CONSENT }).smsConsent, false);
assert.throws(() => normalizeInquiry({ ...payload, inquiry_id: "bad" }), /Invalid inquiry/);
assert.throws(() => normalizeInquiry({ ...payload, contact: { ...payload.contact, phone: "12" } }), /Enter your/);

let complete;
let creates = 0;
const ledger = {
  claimBooking: async () => ({ acquired: true, record_id: "record" }),
  completeInquiry: async (...args) => { complete = args; },
  failBooking: async () => { throw new Error("Unexpected failure"); },
};
const ghl = {
  upsertContact: async () => ({ id: "contact" }),
  findOpportunityByBookingId: async () => null,
  createSocialInquiryOpportunity: async () => { creates++; return { id: "opportunity" }; },
};
assert.equal((await submitInquiry(inquiry, { ledger, ghl })).ok, true);
assert.equal(creates, 1);
assert.deepEqual(complete, [inquiry.bookingId, { contact_id: "contact", opportunity_id: "opportunity" }, "record"]);
const duplicate = await submitInquiry(inquiry, {
  ledger: { claimBooking: async () => ({ acquired: false, opportunity_id: "opportunity" }) },
  ghl: {},
});
assert.equal(duplicate.duplicate, true);
assert.equal(creates, 1, "a network retry must not create another inquiry or acknowledgment");
assert.equal((await submitInquiry(inquiry, {
  ledger: { claimBooking: async () => ({ acquired: false }) }, ghl: {},
})).pending, true);

const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = JSON.parse(body); } };
await handler({ method: "POST", url: "/api/hgv-inquiry?dry_run=1", body: payload }, response);
assert.equal(response.statusCode, 200);
assert.equal(response.body.dryRun, true);
assert.equal(response.body.smsRequested, false);

let createdPayload;
const realClient = createGhlClient({ token: "test-only", fetchImpl: async (_url, options) => {
  createdPayload = JSON.parse(options.body);
  return new Response(JSON.stringify({ opportunity: { id: "retainer-inquiry" } }), { status: 201 });
} });
await realClient.createSocialInquiryOpportunity(normalizeInquiry({ ...payload, sms_consent: true }), "contact");
assert.equal(createdPayload.pipelineId, HGV_RETAINER_PIPELINE_ID);
assert.equal(createdPayload.pipelineStageId, HGV_RETAINER_LEAD_STAGE_ID);
assert.equal(createdPayload.monetaryValue, 0);
assert.ok(createdPayload.customFields.some(field => field.id === OPPORTUNITY_FIELD_IDS.specialRequests && field.fieldValue === INQUIRY_SMS_CONSENT));

async function request(method, body, url = "/api/hgv-inquiry") {
  const res = { setHeader() {}, end(value) { this.body = JSON.parse(value); } };
  await handler({ method, body, url }, res);
  return res;
}
assert.equal((await request("GET", {})).statusCode, 405);
assert.equal((await request("POST", "{invalid")).statusCode, 400);
assert.equal((await request("POST", {})).statusCode, 400);
assert.equal((await request("POST", { website: "bot" })).body.ok, true);
const oldMode = process.env.HGV_ORCHESTRATOR_MODE;
try {
  process.env.HGV_ORCHESTRATOR_MODE = "off";
  assert.equal((await request("POST", payload)).statusCode, 503);
} finally {
  if (oldMode === undefined) delete process.env.HGV_ORCHESTRATOR_MODE;
  else process.env.HGV_ORCHESTRATOR_MODE = oldMode;
}
console.log("Inquiry validation, consent, dry-run, and duplicate-submission checks passed");
