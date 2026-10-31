import { randomUUID } from "node:crypto";
import { HGV_RETAINER_PIPELINE_ID } from "./config.js";

export const INQUIRY_SMS_CONSENT = "Inquiry SMS follow-up: requested";

export function normalizeInquiry(payload) {
  const text = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
  const id = text(payload?.inquiry_id, 80);
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(id)) throw new Error("Invalid inquiry id");
  const fullName = text(payload?.contact?.fullName, 150);
  const email = text(payload?.contact?.email, 254).toLowerCase();
  const phoneInput = text(payload?.contact?.phone, 40);
  const digits = phoneInput.replace(/\D/g, "");
  const phone = digits.length === 10 ? `+1${digits}` : `+${digits}`;
  const message = text(payload?.message, 3000);
  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || digits.length < 10 || digits.length > 15 || !message) {
    throw new Error("Enter your name, email, phone number, and inquiry");
  }
  const [firstName, ...lastName] = fullName.split(/\s+/);
  return {
    bookingId: `inquiry-${id}`,
    formType: "social_media_inquiry",
    bookingPath: "social_media",
    packageName: "Social Media Marketing",
    contact: { fullName, firstName, lastName: lastName.join(" "), email, phone },
    additionalInfo: message,
    specialRequests: payload.sms_consent === true ? INQUIRY_SMS_CONSENT : "Inquiry SMS follow-up: not requested",
    smsConsent: payload.sms_consent === true,
    lineItems: [],
    estimatedTotal: 0,
    submittedAt: new Date().toISOString(),
  };
}

export async function submitInquiry(inquiry, { ledger, ghl, requestId = randomUUID() }) {
  const claim = await ledger.claimBooking(inquiry, requestId);
  if (!claim.acquired) {
    return { ok: Boolean(claim.opportunity_id), duplicate: true, pending: !claim.opportunity_id, opportunityId: claim.opportunity_id || null };
  }
  try {
    const contact = await ghl.upsertContact(inquiry.contact);
    let opportunity = await ghl.findOpportunityByBookingId(contact.id, inquiry.bookingId, HGV_RETAINER_PIPELINE_ID);
    if (!opportunity) opportunity = await ghl.createSocialInquiryOpportunity(inquiry, contact.id);
    await ledger.completeInquiry(inquiry.bookingId, { contact_id: contact.id, opportunity_id: opportunity.id }, claim.record_id);
    return { ok: true, duplicate: false, opportunityId: opportunity.id };
  } catch (error) {
    await ledger.failBooking(inquiry.bookingId, error.message, claim.record_id);
    throw error;
  }
}
