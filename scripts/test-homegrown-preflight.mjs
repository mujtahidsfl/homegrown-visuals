import assert from "node:assert/strict";
import handler from "../api/hgv-booking-preflight.js";

function makeReq(body, url = "/api/hgv-booking-preflight", method = "POST") {
  return {
    method,
    url,
    body,
    async *[Symbol.asyncIterator]() {},
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(value) {
      this.body = value;
    },
  };
}

async function callHandler(body, url, method) {
  const res = makeRes();
  await handler(makeReq(body, url, method), res);
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body),
  };
}

const originalToken = process.env.GHL_PIT;
const originalFallbackToken = process.env.GHL_HOMEGROWN_API_TOKEN;
const originalLocationId = process.env.GHL_LOCATION_ID;
const originalFetch = globalThis.fetch;

const seenBodies = [];

try {
  process.env.GHL_PIT = "test-token";
  delete process.env.GHL_HOMEGROWN_API_TOKEN;
  process.env.GHL_LOCATION_ID = "pwyt4yVmaVxmQpVX040D";
  globalThis.fetch = async (_url, options) => {
    seenBodies.push(JSON.parse(options.body));
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({ contact: { id: "contact_123" } });
      },
    };
  };

  const topLevel = await callHandler({
    property_address: "123 Main St",
    contact: { fullName: "Taylor Test", email: "taylor@example.com" },
  });
  assert.equal(topLevel.statusCode, 200);
  assert.equal(topLevel.body.contactId, "contact_123");
  assert.equal(seenBodies.at(-1).customFields[0].field_value, "123 Main St");

  const nested = await callHandler({
    property: { address: "456 Legacy Ave" },
    agent: { firstName: "Legacy", lastName: "Agent", email: "legacy@example.com" },
  });
  assert.equal(nested.statusCode, 200);
  assert.equal(nested.body.contactId, "contact_123");
  assert.equal(seenBodies.at(-1).customFields[0].field_value, "456 Legacy Ave");

  const callsBeforeDryRun = seenBodies.length;
  const dryRun = await callHandler(
    {
      dry_run: true,
      property: { address: "789 Dry Run Rd" },
      contact: { fullName: "Dry Run", phone: "+15555550123" },
    },
    "/api/hgv-booking-preflight?dry_run=1",
  );
  assert.equal(dryRun.statusCode, 200);
  assert.equal(dryRun.body.dryRun, true);
  assert.equal(dryRun.body.parsed.contact.hasPhone, true);
  assert.equal(dryRun.body.parsed.hasPropertyAddress, true);
  assert.equal(seenBodies.length, callsBeforeDryRun);

  const missingAddress = await callHandler({
    contact: { fullName: "No Address", email: "noaddress@example.com" },
  });
  assert.equal(missingAddress.statusCode, 400);
  assert.equal(missingAddress.body.error, "Missing property address");

  const invalidJson = await callHandler("{not-json");
  assert.equal(invalidJson.statusCode, 400);
  assert.equal(invalidJson.body.error, "Invalid JSON body");

  const wrongMethod = await callHandler({}, "/api/hgv-booking-preflight", "GET");
  assert.equal(wrongMethod.statusCode, 405);
  assert.equal(wrongMethod.body.error, "Method not allowed");

  const tokenBeforeMissingToken = process.env.GHL_PIT;
  delete process.env.GHL_PIT;
  const missingToken = await callHandler({
    property_address: "123 Tokenless St",
    contact: { email: "tokenless@example.com" },
  });
  assert.equal(missingToken.statusCode, 200);
  assert.equal(missingToken.body.skipped, "GHL token is not configured");
  process.env.GHL_PIT = tokenBeforeMissingToken;

  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    async text() {
      return JSON.stringify({ message: "Unauthorized" });
    },
  });
  const upstreamError = await callHandler({
    property_address: "123 Bad Token St",
    contact: { email: "badtoken@example.com" },
  });
  assert.equal(upstreamError.statusCode, 401);
  assert.equal(upstreamError.body.error, "Unauthorized");

  console.log("Homegrown preflight tests passed");
} finally {
  if (originalToken === undefined) delete process.env.GHL_PIT;
  else process.env.GHL_PIT = originalToken;
  if (originalFallbackToken === undefined) delete process.env.GHL_HOMEGROWN_API_TOKEN;
  else process.env.GHL_HOMEGROWN_API_TOKEN = originalFallbackToken;
  if (originalLocationId === undefined) delete process.env.GHL_LOCATION_ID;
  else process.env.GHL_LOCATION_ID = originalLocationId;
  globalThis.fetch = originalFetch;
}
