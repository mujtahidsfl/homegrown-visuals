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
    phone: asString(contact.phone) || asString(agent.phone),
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
    addOns: joinValues(source.addons) || joinValues(source.selections),
    alaCarte: asString(source.ala_carte) || (packageName.toLowerCase().includes("la carte") ? joinValues(source.selections) : ""),
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
  const type = asString(source.type);
  const id = asString(appointment.id) || asString(source.id);
  const contactId = asString(appointment.contactId) || asString(source.contactId);
  if (!id) throw new Error("Missing appointment id");
  if (!contactId) throw new Error("Missing appointment contact id");

  return {
    type,
    id,
    contactId,
    calendarId: asString(appointment.calendarId) || asString(source.calendarId),
    assignedUserId: asString(appointment.assignedUserId) || asString(source.assignedUserId),
    status: asString(appointment.appointmentStatus) || asString(source.appointmentStatus),
    startTime: asString(appointment.startTime) || asString(source.startTime),
    endTime: asString(appointment.endTime) || asString(source.endTime),
    deleted:
      /delete/i.test(type) ||
      (asString(appointment.appointmentStatus) || asString(source.appointmentStatus)).toLowerCase() === "cancelled",
    raw: source,
  };
}
