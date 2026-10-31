import {
  CONTACT_FIELD_IDS,
  HGV_LOCATION_ID,
  HGV_PIPELINE_ID,
  HGV_RETAINER_PIPELINE_ID,
  HGV_RETAINER_LEAD_STAGE_ID,
  HGV_TIME_ZONE,
  OPPORTUNITY_FIELD_IDS,
} from "./config.js";

const BASE_URL = "https://services.leadconnectorhq.com";

function valueOfField(field) {
  return field?.fieldValue ?? field?.fieldValueString ?? field?.fieldValueDate ?? field?.value ?? "";
}

function responseError(status, body) {
  const message = body?.message || body?.error || `GHL request failed with status ${status}`;
  const error = new Error(Array.isArray(message) ? message.join(", ") : String(message));
  error.status = status;
  error.body = body;
  return error;
}

function customField(id, fieldValue) {
  return fieldValue === "" || fieldValue === null || fieldValue === undefined ? null : { id, fieldValue };
}

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function invoiceDiscount(lineItems) {
  const value = Math.abs(
    lineItems.filter((item) => item.amount < 0).reduce((total, item) => total + item.amount * item.quantity, 0),
  );
  return value > 0 ? { type: "fixed", value: Math.round(value * 100) / 100 } : null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function appointmentParts(value) {
  const raw = String(value || "").trim();
  if (!raw) return { date: "", time: "" };

  const human = raw.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*([AP]M))?/i,
  );
  if (human) {
    const month = MONTH_NAMES.find((name) => name.toLowerCase() === human[1].toLowerCase()) || human[1];
    return {
      date: `${month} ${Number(human[2])}, ${human[3]}`,
      time: human[4] ? `${Number(human[4])}:${human[5]} ${human[6].toUpperCase()}` : "",
    };
  }

  const localIso = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (localIso) {
    return {
      date: `${MONTH_NAMES[Number(localIso[2]) - 1]} ${Number(localIso[3])}, ${localIso[1]}`,
      time: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(2000, 0, 1, Number(localIso[4]), Number(localIso[5])))),
    };
  }

  const date = new Date(raw);
  if (Number.isNaN(date.valueOf())) return { date: "", time: "" };
  return {
    date: new Intl.DateTimeFormat("en-US", {
      timeZone: HGV_TIME_ZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      timeZone: HGV_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

export function bookingCustomFields(booking) {
  return [
    customField(OPPORTUNITY_FIELD_IDS.websiteBookingId, booking.bookingId),
    customField(OPPORTUNITY_FIELD_IDS.packageName, booking.packageName),
    customField(OPPORTUNITY_FIELD_IDS.propertyAddress, booking.propertyAddress),
    customField(OPPORTUNITY_FIELD_IDS.sqftTier, booking.sqftTier),
    customField(OPPORTUNITY_FIELD_IDS.addOns, booking.addOns),
    customField(OPPORTUNITY_FIELD_IDS.alaCarte, booking.alaCarte),
    customField(OPPORTUNITY_FIELD_IDS.specialRequests, booking.specialRequests),
    customField(OPPORTUNITY_FIELD_IDS.additionalInfo, booking.additionalInfo),
    customField(OPPORTUNITY_FIELD_IDS.editorNotes, booking.editorNotes),
    customField(OPPORTUNITY_FIELD_IDS.access, booking.access),
    customField(OPPORTUNITY_FIELD_IDS.accessDetails, booking.accessDetails),
    customField(OPPORTUNITY_FIELD_IDS.lockboxCode, booking.lockboxCode),
    customField(OPPORTUNITY_FIELD_IDS.gateCode, booking.gateCode),
    customField(OPPORTUNITY_FIELD_IDS.videoVibe, booking.videoVibe),
    customField(OPPORTUNITY_FIELD_IDS.videoMusic, booking.videoMusic),
    customField(OPPORTUNITY_FIELD_IDS.videoHighlights, booking.videoHighlights),
    customField(OPPORTUNITY_FIELD_IDS.estimatedTotal, booking.estimatedTotal),
    customField(OPPORTUNITY_FIELD_IDS.invoiceLineItemsJson, booking.invoiceLineItemsJson),
    customField(OPPORTUNITY_FIELD_IDS.invoiceLineItemsStripe, booking.invoiceLineItemsStripe),
  ].filter(Boolean);
}

export function appointmentCustomFields(appointment) {
  const start = appointmentParts(appointment.startTime);
  const end = appointmentParts(appointment.endTime);

  return [
    customField(OPPORTUNITY_FIELD_IDS.meetingDate, start.date),
    customField(OPPORTUNITY_FIELD_IDS.meetingStart, start.time),
    customField(OPPORTUNITY_FIELD_IDS.meetingEnd, end.time),
  ].filter(Boolean);
}

export function createGhlClient({ token, locationId = HGV_LOCATION_ID, fetchImpl = fetch } = {}) {
  if (!token) throw new Error("Missing GHL token");

  async function request(path, { method = "GET", body, version = "v3" } = {}) {
    const response = await fetchImpl(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Version: version,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    let parsed = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { message: text.slice(0, 300) };
    }
    if (!response.ok) throw responseError(response.status, parsed);
    return parsed;
  }

  async function invoicePayload({ booking, contactId, dueDays = 7, invoiceId = "" }) {
    const query = new URLSearchParams({ altId: locationId, altType: "location" });
    const existingPromise = invoiceId
      ? request(`/invoices/${invoiceId}?${query}`)
      : Promise.resolve(null);
    const [settings, locationBody, existingBody] = await Promise.all([
      request(`/invoices/settings?${query}`),
      request(`/locations/${locationId}`, { version: "2021-07-28" }),
      existingPromise,
    ]);
    const existing = existingBody?.invoice || existingBody || null;
    const numberBody = existing?.invoiceNumber
      ? null
      : await request(`/invoices/generate-invoice-number?${query}`);
    const location = locationBody.location || {};
    const issueDate = existing?.issueDate ? new Date(existing.issueDate) : new Date();
    const dueDate = existing?.dueDate
      ? new Date(existing.dueDate)
      : new Date(issueDate.getTime() + dueDays * 24 * 60 * 60 * 1000);
    const positiveItems = booking.lineItems.filter((item) => item.amount >= 0);
    const discount = invoiceDiscount(booking.lineItems);
    if (!positiveItems.length) throw new Error("Invoice has no billable line items");

    return {
      altId: locationId,
      altType: "location",
      name: `[HGV:${booking.bookingId}] ${booking.packageName} - ${booking.propertyAddress}`,
      title: existing?.title || settings.title || "INVOICE",
      businessDetails: existing?.businessDetails || settings.businessDetails || {
        name: location.name || "Homegrown Visuals",
        phoneNo: location.phone || "",
        website: location.website || "https://www.homegrownvisualsmedia.com",
        address: {
          addressLine1: location.address || "",
          city: location.city || "",
          state: location.state || "",
          countryCode: location.country || "US",
          postalCode: location.postalCode || "",
        },
      },
      currency: "USD",
      items: positiveItems.map((item) => ({
        name: item.name,
        description: [item.category, `Property: ${booking.propertyAddress}`].filter(Boolean).join(" | "),
        currency: "USD",
        amount: item.amount,
        qty: item.quantity,
        taxes: [],
        type: "one_time",
      })),
      ...(discount ? { discount } : {}),
      termsNotes: `<p><strong>Property:</strong> ${booking.propertyAddress}</p>`,
      contactDetails: {
        id: contactId,
        name: booking.contact.fullName,
        phoneNo: booking.contact.phone,
        email: booking.contact.email,
        address: { addressLine1: booking.propertyAddress, countryCode: "US" },
      },
      invoiceNumber: String(existing?.invoiceNumber || numberBody.invoiceNumber),
      invoiceNumberPrefix: existing?.invoiceNumberPrefix || settings.invoiceNumberPrefix || "INV-",
      issueDate: dateOnly(issueDate),
      dueDate: dateOnly(dueDate),
      sentTo: {
        email: booking.contact.email ? [booking.contact.email] : [],
        emailCc: [],
        emailBcc: [],
        phoneNo: [],
      },
      liveMode: true,
      automaticTaxesEnabled: false,
      paymentMethods: { stripe: { enableBankDebitOnly: false } },
      ...(invoiceId ? { id: invoiceId } : {}),
    };
  }

  async function text2PayInvoice({ booking, contactId, dueDays = 7, userId, invoiceId = "", action }) {
    if (!userId) throw new Error("Missing invoice sender user id");
    if (!["draft", "send"].includes(action)) throw new Error("Invalid Text2Pay invoice action");
    const payload = await invoicePayload({ booking, contactId, dueDays, invoiceId });
    const body = await request("/invoices/text2pay", {
      method: "POST",
      body: {
        ...payload,
        ...(action === "send"
          ? { sentTo: { email: [], emailCc: [], emailBcc: [], phoneNo: [] } }
          : {}),
        includeTermsNote: true,
        action,
        userId,
      },
    });
    const invoice = body.invoice || {};
    const id = invoice._id || invoice.id || invoiceId;
    if (!id) {
      throw new Error("GHL Text2Pay returned an invalid invoice response");
    }
    const canonicalInvoiceUrl = new URL(`/invoice/${encodeURIComponent(id)}`, "https://link.fastpaydirect.com");
    const paymentPage = await fetchImpl(canonicalInvoiceUrl, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "Homegrown-Invoice-Verification/1.0" },
    });
    if (paymentPage.status < 200 || paymentPage.status >= 400) {
      throw new Error(`GHL returned an unusable canonical invoice URL (HTTP ${paymentPage.status})`);
    }
    return {
      ...invoice,
      id,
      status: invoice.status === "paid" ? "paid" : action === "send" ? "sent" : "draft",
      invoiceUrl: canonicalInvoiceUrl.toString(),
    };
  }

  return {
    async getOpportunity(opportunityId) {
      const body = await request(`/opportunities/${opportunityId}`);
      return body.opportunity || body;
    },

    async upsertContact(contact, { propertyAddress = "" } = {}) {
      const body = await request("/contacts/upsert", {
        method: "POST",
        version: "2021-07-28",
        body: {
          locationId,
          name: contact.fullName,
          firstName: contact.firstName,
          lastName: contact.lastName,
          ...(contact.email ? { email: contact.email } : {}),
          ...(contact.phone ? { phone: contact.phone } : {}),
          ...(propertyAddress
            ? {
                customFields: [{
                  id: CONTACT_FIELD_IDS.propertyAddress,
                  key: "contact.property_address",
                  field_value: propertyAddress,
                }],
              }
            : {}),
          source: "Homegrown Visuals Website",
        },
      });
      const record = body.contact || body;
      const id = record.id || record.contact?.id;
      if (!id) throw new Error("GHL contact upsert returned no contact id");
      return { id, raw: record };
    },

    async findOpportunityByBookingId(contactId, bookingId, pipelineId = HGV_PIPELINE_ID) {
      const params = new URLSearchParams({
        locationId,
        pipelineId,
        contactId,
        status: "all",
        limit: "100",
        order: "added_desc",
      });
      const body = await request(`/opportunities/search?${params}`);
      return (body.opportunities || []).find((opportunity) =>
        (opportunity.customFields || []).some(
          (field) => field.id === OPPORTUNITY_FIELD_IDS.websiteBookingId && String(valueOfField(field)) === bookingId,
        ),
      ) || null;
    },

    async createOpportunity(booking, contactId) {
      const body = await request("/opportunities/", {
        method: "POST",
        body: {
          pipelineId: HGV_PIPELINE_ID,
          locationId,
          name: `${booking.contact.fullName} | ${booking.packageName}`,
          pipelineStageId: booking.pipelineStageId,
          status: "open",
          contactId,
          monetaryValue: booking.estimatedTotal,
          customFields: bookingCustomFields(booking),
        },
      });
      const opportunity = body.opportunity || body;
      if (!opportunity.id) throw new Error("GHL opportunity create returned no opportunity id");
      return opportunity;
    },

    async updateOpportunity(opportunityId, changes) {
      const body = await request(`/opportunities/${opportunityId}`, {
        method: "PUT",
        body: changes,
      });
      return body.opportunity || body;
    },

    async createSocialInquiryOpportunity(inquiry, contactId) {
      const body = await request("/opportunities/", {
        method: "POST",
        body: {
          locationId,
          pipelineId: HGV_RETAINER_PIPELINE_ID,
          pipelineStageId: HGV_RETAINER_LEAD_STAGE_ID,
          contactId,
          name: `${inquiry.contact.fullName} | Social Media Marketing`,
          status: "open",
          monetaryValue: 0,
          customFields: bookingCustomFields(inquiry),
        },
      });
      const opportunity = body.opportunity || body;
      if (!opportunity.id) throw new Error("GHL inquiry opportunity returned no id");
      return opportunity;
    },

    async findInvoiceByBookingId(bookingId, contactId) {
      const token = `[HGV:${bookingId}]`;
      const params = new URLSearchParams({
        altId: locationId,
        altType: "location",
        search: bookingId,
        contactId,
        limit: "20",
        offset: "0",
      });
      const body = await request(`/invoices/?${params}`);
      const invoice = (body.invoices || []).find((candidate) => String(candidate.name || "").includes(token));
      if (!invoice) return null;
      return { ...invoice, id: invoice._id || invoice.id };
    },

    async createInvoiceDraft({ booking, contactId, dueDays = 7 }) {
      const payload = await invoicePayload({ booking, contactId, dueDays });
      const body = await request("/invoices/", {
        method: "POST",
        body: payload,
      });
      const invoice = body.invoice || body;
      const id = invoice._id || invoice.id;
      if (!id) throw new Error("GHL invoice create returned no invoice id");
      return { ...invoice, id };
    },

    async createAndSendInvoice({ booking, contactId, dueDays = 7, userId, invoiceId = "" }) {
      if (!booking.contact.email) throw new Error("Invoice contact is missing an email address");
      const invoice = await text2PayInvoice({
        booking,
        contactId,
        dueDays,
        userId,
        invoiceId,
        action: "send",
      });
      const invoiceNumber = `${invoice.invoiceNumberPrefix || ""}${invoice.invoiceNumber || ""}`;
      const safeName = escapeHtml(booking.contact.firstName || booking.contact.fullName || "there");
      const safeNumber = escapeHtml(invoiceNumber || "your invoice");
      const safeAddress = escapeHtml(booking.propertyAddress);
      const safeUrl = escapeHtml(invoice.invoiceUrl);
      const plainText = [
        `Hi ${booking.contact.firstName || booking.contact.fullName || "there"},`,
        "",
        `Your Homegrown Visuals invoice ${invoiceNumber || ""} is ready for ${booking.propertyAddress}.`,
        `View and pay securely: ${invoice.invoiceUrl}`,
        "",
        "Regards,",
        "Homegrown Visuals",
      ].join("\n");
      const message = await request("/conversations/messages", {
        method: "POST",
        body: {
          type: "Email",
          contactId,
          emailTo: booking.contact.email,
          subject: `Homegrown Visuals invoice ${invoiceNumber || ""} - ${booking.propertyAddress}`,
          message: plainText,
          html: `<p>Hi ${safeName},</p><p>Your Homegrown Visuals invoice <strong>${safeNumber}</strong> is ready for ${safeAddress}.</p><p><a href="${safeUrl}">View and pay invoice securely</a></p><p>If the button does not open, use this link:<br><a href="${safeUrl}">${safeUrl}</a></p><p>Regards,<br>Homegrown Visuals</p>`,
          status: "pending",
        },
      });
      if (!message.messageId) throw new Error("GHL did not queue the invoice payment email");
      return { ...invoice, status: "sent", messageId: message.messageId };
    },

    async createInvoicePaymentDraft({ booking, contactId, dueDays = 7, userId }) {
      return text2PayInvoice({ booking, contactId, dueDays, userId, action: "draft" });
    },

  };
}
