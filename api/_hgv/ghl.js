import {
  CONTACT_FIELD_IDS,
  HGV_LOCATION_ID,
  HGV_PIPELINE_ID,
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

function invoiceDiscount(lineItems) {
  const value = Math.abs(
    lineItems.filter((item) => item.amount < 0).reduce((total, item) => total + item.amount * item.quantity, 0),
  );
  return value > 0 ? { type: "fixed", value: Math.round(value * 100) / 100 } : null;
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
  const start = appointment.startTime ? new Date(appointment.startTime) : null;
  const end = appointment.endTime ? new Date(appointment.endTime) : null;
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: HGV_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: HGV_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });

  return [
    customField(OPPORTUNITY_FIELD_IDS.meetingDate, start && !Number.isNaN(start.valueOf()) ? dateFormatter.format(start) : ""),
    customField(OPPORTUNITY_FIELD_IDS.meetingStart, start && !Number.isNaN(start.valueOf()) ? timeFormatter.format(start) : ""),
    customField(OPPORTUNITY_FIELD_IDS.meetingEnd, end && !Number.isNaN(end.valueOf()) ? timeFormatter.format(end) : ""),
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

    async findOpportunityByBookingId(contactId, bookingId) {
      const params = new URLSearchParams({
        locationId,
        pipelineId: HGV_PIPELINE_ID,
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
      const query = new URLSearchParams({ altId: locationId, altType: "location" });
      const [settings, locationBody, numberBody] = await Promise.all([
        request(`/invoices/settings?${query}`),
        request(`/locations/${locationId}`, { version: "2021-07-28" }),
        request(`/invoices/generate-invoice-number?${query}`),
      ]);
      const location = locationBody.location || {};
      const issueDate = new Date();
      const dueDate = new Date(issueDate.getTime() + dueDays * 24 * 60 * 60 * 1000);
      const positiveItems = booking.lineItems.filter((item) => item.amount >= 0);
      const discount = invoiceDiscount(booking.lineItems);
      if (!positiveItems.length) throw new Error("Invoice has no billable line items");

      const body = await request("/invoices/", {
        method: "POST",
        body: {
          altId: locationId,
          altType: "location",
          name: `[HGV:${booking.bookingId}] ${booking.packageName} - ${booking.propertyAddress}`,
          title: settings.title || "INVOICE",
          businessDetails: settings.businessDetails || {
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
          invoiceNumber: String(numberBody.invoiceNumber),
          invoiceNumberPrefix: settings.invoiceNumberPrefix || "INV-",
          issueDate: dateOnly(issueDate),
          dueDate: dateOnly(dueDate),
          sentTo: {
            email: booking.contact.email ? [booking.contact.email] : [],
            emailCc: [],
            emailBcc: [],
            phoneNo: booking.contact.phone ? [booking.contact.phone] : [],
          },
          liveMode: true,
          automaticTaxesEnabled: false,
          paymentMethods: { stripe: { enableBankDebitOnly: false } },
        },
      });
      const invoice = body.invoice || body;
      const id = invoice._id || invoice.id;
      if (!id) throw new Error("GHL invoice create returned no invoice id");
      return { ...invoice, id };
    },

    async sendInvoice(invoiceId, { userId, action = "email" }) {
      if (!userId) throw new Error("Missing invoice sender user id");
      return request(`/invoices/${invoiceId}/send`, {
        method: "POST",
        body: {
          altId: locationId,
          altType: "location",
          userId,
          action,
          liveMode: true,
          autoPayment: { enable: false },
        },
      });
    },
  };
}
