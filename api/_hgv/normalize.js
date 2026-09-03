import { HGV_STAGE_IDS } from "./config.js";

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number * 100) / 100 : 0;
}

function asSignedMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function splitName(fullName) {
  const parts = asString(fullName).split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

function normalizePhone(value) {
  const raw = asString(value);
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? `+${digits}` : raw;
}

function normalizeContact(payload) {
  const contact = asObject(payload.contact);
  const agent = asObject(payload.agent);
  const fullName =
    asString(contact.fullName) ||
    asString(contact.name) ||
    `${asString(contact.first_name) || asString(agent.first_name) || asString(agent.firstName)} ${
      asString(contact.last_name) || asString(agent.last_name) || asString(agent.lastName)
    }`.trim();
  const split = splitName(fullName);

  return {
    fullName,
    firstName: asString(contact.first_name) || asString(contact.firstName) || split.firstName,
    lastName: asString(contact.last_name) || asString(contact.lastName) || split.lastName,
    email: (asString(contact.email) || asString(agent.email)).toLowerCase(),
    phone: normalizePhone(asString(contact.phone) || asString(agent.phone)),
  };
}

function normalizeLineItems(payload) {
  const source = Array.isArray(payload.invoice_line_items)
    ? payload.invoice_line_items
    : Array.isArray(payload.line_items)
      ? payload.line_items
      : [];

  return source
    .map((value, index) => {
      const item = asObject(value);
      const name = asString(item.name) || asString(item.label) || asString(item.description);
      const amount = asSignedMoney(item.amount ?? item.price ?? item.total);
      const quantity = Math.max(1, Number(item.quantity ?? item.qty ?? 1) || 1);
      return {
        id: asString(item.id) || `item-${index + 1}`,
        name,
        category: asString(item.category),
        amount,
        quantity,
      };
    })
    .filter((item) => item.name && (item.amount !== 0 || /discount/i.test(item.name)));
}

function schedulerCalendarId(schedule) {
  const url = asString(schedule.schedulerUrl) || asString(schedule.scheduler_url);
  return url.match(/\/booking\/([A-Za-z0-9]+)/)?.[1] || "";
}

function joinValues(value) {
  return Array.isArray(value) ? value.map(asString).filter(Boolean).join("\n") : asString(value);
}

function uniqueLines(...values) {
  const seen = new Set();
  const lines = [];
  for (const value of values) {
    const candidates = Array.isArray(value) ? value : asString(value).split(/\r?\n/);
    for (const candidate of candidates) {
      const line = asString(candidate);
      const key = line.toLowerCase();
      if (!line || seen.has(key)) continue;
      seen.add(key);
      lines.push(line);
    }
  }
  return lines.join("\n");
}

function lineItemNames(lineItems, categoryPattern) {
  return lineItems
    .filter((item) => categoryPattern.test(item.category))
    .map((item) => item.name);
}

export function normalizeBookingPayload(payload) {
  const source = asObject(payload);
  const property = asObject(source.property);
  const schedule = asObject(source.schedule);
  const access = asObject(source.access);
  const video = asObject(source.video_questions);
  const contact = normalizeContact(source);
  const bookingId = asString(source.website_booking_id);
  const propertyAddress = asString(source.property_address) || asString(property.address);
  const packageName = asString(source.package) || asString(source.package_name) || "A La Carte";
  const lineItems = normalizeLineItems(source);
  const bookingPath = asString(source.booking_path) || "legacy_package";
  const structuredSelections = asObject(source.selections);
  const addOns = uniqueLines(
    source.addons,
    source.add_ons,
    structuredSelections.addons,
    structuredSelections.add_ons,
    lineItemNames(lineItems, /^add[\s-]*ons?$/i),
  );
  const alaCarte = uniqueLines(
    source.ala_carte,
    source.alaCarte,
    structuredSelections.a_la_carte,
    structuredSelections.ala_carte,
    lineItemNames(lineItems, /^a\s*la\s*carte$/i),
  );

  if (!bookingId) throw new Error("Missing website_booking_id");
  if (!contact.email && !contact.phone) throw new Error("Missing contact email or phone");
  if (!contact.fullName) throw new Error("Missing contact name");
  if (!propertyAddress) throw new Error("Missing property address");

  return {
    bookingId,
    formType: asString(source.form_type) || "booking",
    bookingPath,
    contact,
    packageName,
    propertyAddress,
    sqftTier: asString(source.sqft_tier) || asString(property.sqft_tier) || asString(source.sqft),
    selections: joinValues(source.selections),
    addOns,
    alaCarte,
    specialRequests: asString(source.special_requests),
    additionalInfo: asString(source.additional_info),
    editorNotes: asString(source.internal_notes_for_editor),
    access: asString(access.access) || asString(access.vacancy),
    accessDetails: asString(access.details),
    lockboxCode: asString(access.lockbox),
    gateCode: asString(access.gate_code),
    videoVibe: asString(video.vibe),
    videoMusic: asString(video.music),
    videoHighlights: asString(video.highlights),
    estimatedTotal: asMoney(source.estimated_total),
    lineItems,
    invoiceLineItemsJson: asString(source.invoice_line_items_json) || JSON.stringify(lineItems),
    invoiceLineItemsStripe: asString(source.invoice_line_items_stripe_form),
    calendarId: schedulerCalendarId(schedule),
    schedulerKey: asString(schedule.schedulerKey) || asString(schedule.scheduler_key),
    sourcePage: asString(source.source_page),
    submittedAt: asString(source.submitted_at) || new Date().toISOString(),
    pipelineStageId: source.form_type === "quote_request" ? HGV_STAGE_IDS.customQuote : HGV_STAGE_IDS.newInquiry,
    raw: source,
  };
}

export function normalizeAppointmentWebhook(payload) {
  const source = asObject(payload);
  const appointment = asObject(source.appointment);
  const customData = asObject(source.customData);
  const type = asString(source.type) || asString(customData.type);
  const id =
    asString(appointment.id) ||
    asString(customData.id) ||
    asString(customData.appointmentId) ||
    asString(source.id) ||
    asString(source.appointmentId) ||
    asString(source.appointment_id);
  const contactId =
    asString(appointment.contactId) ||
    asString(appointment.contact_id) ||
    asString(customData.contactId) ||
    asString(customData.contact_id) ||
    asString(source.contactId) ||
    asString(source.contact_id);
  if (!id) throw new Error("Missing appointment id");
  if (!contactId) throw new Error("Missing appointment contact id");

  return {
    type,
    id,
    contactId,
    title: asString(appointment.title) || asString(customData.title) || asString(source.title),
    address:
      asString(appointment.address) ||
      asString(appointment.meetingLocation) ||
      asString(customData.address) ||
      asString(source.address),
    calendarId:
      asString(appointment.calendarId) ||
      asString(appointment.calendar_id) ||
      asString(customData.calendarId) ||
      asString(customData.calendar_id) ||
      asString(source.calendarId) ||
      asString(source.calendar_id),
    assignedUserId:
      asString(appointment.assignedUserId) ||
      asString(appointment.assigned_user_id) ||
      asString(customData.assignedUserId) ||
      asString(customData.assigned_user_id) ||
      asString(source.assignedUserId) ||
      asString(source.assigned_user_id),
    status:
      asString(appointment.appointmentStatus) ||
      asString(appointment.appointment_status) ||
      asString(customData.appointmentStatus) ||
      asString(customData.appointment_status) ||
      asString(source.appointmentStatus) ||
      asString(source.appointment_status),
    startTime:
      asString(appointment.startTime) ||
      asString(appointment.start_time) ||
      asString(customData.startTime) ||
      asString(customData.start_time) ||
      asString(source.startTime) ||
      asString(source.start_time),
    endTime:
      asString(appointment.endTime) ||
      asString(appointment.end_time) ||
      asString(customData.endTime) ||
      asString(customData.end_time) ||
      asString(source.endTime) ||
      asString(source.end_time),
    deleted:
      /delete/i.test(type) ||
      (
        asString(appointment.appointmentStatus) ||
        asString(appointment.appointment_status) ||
        asString(customData.appointmentStatus) ||
        asString(customData.appointment_status) ||
        asString(source.appointmentStatus) ||
        asString(source.appointment_status)
      ).toLowerCase() === "cancelled",
    raw: source,
  };
}
