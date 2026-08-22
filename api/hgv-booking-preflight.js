const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const DEFAULT_LOCATION_ID = "pwyt4yVmaVxmQpVX040D";

const CONTACT_FIELD_IDS = {
  propertyAddress: "T0TQLD2tWm1GgwhCmCfr",
};

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function getContact(payload) {
  const contact = payload?.contact && typeof payload.contact === "object" ? payload.contact : {};
  const agent = payload?.agent && typeof payload.agent === "object" ? payload.agent : {};
  const fullName =
    asString(contact.fullName) ||
    asString(contact.name) ||
    `${asString(agent.first_name) || asString(agent.firstName)} ${asString(agent.last_name) || asString(agent.lastName)}`.trim();
  const split = splitName(fullName);

  return {
    fullName,
    firstName: asString(contact.first_name) || asString(contact.firstName) || split.firstName,
    lastName: asString(contact.last_name) || asString(contact.lastName) || split.lastName,
    email: asString(contact.email) || asString(agent.email),
    phone: asString(contact.phone) || asString(agent.phone),
  };
}

function getPropertyAddress(payload) {
  const property = payload?.property && typeof payload.property === "object" ? payload.property : {};
  return asString(payload.property_address) || asString(property.address);
}

function isDryRun(req, payload) {
  const url = new URL(req.url || "/", "https://homegrownvisualsmedia.com");
  return url.searchParams.get("dry_run") === "1" || payload?.dry_run === true;
}

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readPayload(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }
  return raw.trim() ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const token = process.env.GHL_PIT || process.env.GHL_HOMEGROWN_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID || DEFAULT_LOCATION_ID;
  if (!token) {
    return json(res, 200, { ok: true, skipped: "GHL token is not configured" });
  }

  let payload = {};
  try {
    payload = await readPayload(req);
  } catch {
    return json(res, 400, { ok: false, error: "Invalid JSON body" });
  }
  const contact = getContact(payload);
  const propertyAddress = getPropertyAddress(payload);

  if (!contact.email && !contact.phone) {
    return json(res, 400, { ok: false, error: "Missing contact email or phone" });
  }
  if (!propertyAddress) {
    return json(res, 400, { ok: false, error: "Missing property address" });
  }

  if (isDryRun(req, payload)) {
    return json(res, 200, {
      ok: true,
      dryRun: true,
      locationId,
      parsed: {
        contact: {
          hasEmail: Boolean(contact.email),
          hasPhone: Boolean(contact.phone),
        },
        hasPropertyAddress: Boolean(propertyAddress),
      },
    });
  }

  const customFields = [
    {
      id: CONTACT_FIELD_IDS.propertyAddress,
      key: "contact.property_address",
      field_value: propertyAddress,
    },
  ];

  const body = {
    locationId,
    name: contact.fullName,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    customFields,
    source: "Homegrown Visuals Website",
  };

  const ghlResponse = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await ghlResponse.text();
  let responseBody = {};
  try {
    responseBody = text ? JSON.parse(text) : {};
  } catch {
    responseBody = { message: text.slice(0, 200) };
  }

  if (!ghlResponse.ok) {
    return json(res, ghlResponse.status, {
      ok: false,
      error: responseBody.message || responseBody.error || "GHL contact preflight failed",
    });
  }

  const ghlContact = responseBody.contact || responseBody;
  return json(res, 200, {
    ok: true,
    contactId: ghlContact.id || ghlContact.contact?.id || null,
  });
}
