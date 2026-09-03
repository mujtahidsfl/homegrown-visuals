import { randomUUID } from "node:crypto";
import { HGV_STAGE_IDS, OPPORTUNITY_FIELD_IDS } from "./config.js";
import { appointmentCustomFields } from "./ghl.js";
import {
  normalizeAppointmentWebhook,
  normalizeBookingPayload,
  selectionFieldsFromLineItems,
} from "./normalize.js";

function bookingFromLedgerPayload(payload) {
  if (!(payload?.bookingId && payload?.contact && Array.isArray(payload?.lineItems))) {
    return normalizeBookingPayload(payload);
  }
  return {
    ...payload,
    ...selectionFieldsFromLineItems(payload),
  };
}

function isNotFound(error) {
  return error?.status === 404;
}

function opportunityMatchesBooking(opportunity, bookingId) {
  if (opportunity?.bookingId === bookingId) return true;
  return (opportunity?.customFields || []).some((field) =>
    field.id === OPPORTUNITY_FIELD_IDS.websiteBookingId
    && String(field.fieldValue ?? field.fieldValueString ?? field.value ?? "") === bookingId,
  );
}

function recoveryStage(row, booking) {
  if (row.invoice_id || ["invoice_created", "invoiced"].includes(row.status)) {
    return HGV_STAGE_IDS.bookingConfirmed;
  }
  if (row.appointment_id || row.status === "scheduled") return HGV_STAGE_IDS.awaitingConfirmation;
  return booking.pipelineStageId;
}

export function createBookingOrchestrator({ ledger, ghl, requestIdFactory = randomUUID } = {}) {
  if (!ledger) throw new Error("Missing booking ledger");
  if (!ghl) throw new Error("Missing GHL client");

  async function ensureOpportunity(row, normalizedBooking = null) {
    let opportunity = null;
    let repaired = false;
    const booking = normalizedBooking || bookingFromLedgerPayload(row.payload);

    if (row.opportunity_id) {
      try {
        opportunity = await ghl.getOpportunity(row.opportunity_id);
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }
      if (opportunity && !opportunityMatchesBooking(opportunity, booking.bookingId)) opportunity = null;
    }

    let contactId = row.contact_id;
    if (!contactId) {
      const contact = await ghl.upsertContact(booking.contact, { propertyAddress: booking.propertyAddress });
      contactId = contact.id;
    }

    if (!opportunity) {
      opportunity = await ghl.findOpportunityByBookingId(contactId, booking.bookingId);
    }
    if (!opportunity) {
      opportunity = await ghl.createOpportunity({
        ...booking,
        pipelineStageId: recoveryStage(row, booking),
      }, contactId);
      repaired = true;
    }

    if (opportunity.id !== row.opportunity_id || contactId !== row.contact_id) {
      await ledger.updateOpportunityReference(booking.bookingId, {
        contact_id: contactId,
        opportunity_id: opportunity.id,
      }, row.record_id);
    }

    if (repaired && (row.assigned_user_id || row.appointment_start || row.appointment_end)) {
      const customFields = appointmentCustomFields({
        startTime: row.appointment_start,
        endTime: row.appointment_end,
      });
      await ghl.updateOpportunity(opportunity.id, {
        ...(row.assigned_user_id ? { assignedTo: row.assigned_user_id } : {}),
        ...(customFields.length ? { customFields } : {}),
      });
    }

    return { opportunity, contactId, repaired };
  }

  return {
    async submit(rawPayload) {
      const booking = normalizeBookingPayload(rawPayload);
      const requestId = requestIdFactory();
      const claim = await ledger.claimBooking(booking, requestId);
      if (!claim) throw new Error("Booking ledger did not return a claim");

      if (!claim.acquired) {
        if (claim.status === "processing" && !claim.opportunity_id) {
          return {
            ok: true,
            duplicate: true,
            pending: true,
            bookingId: booking.bookingId,
            contactId: claim.contact_id || null,
            opportunityId: null,
            status: claim.status,
          };
        }
        const ensured = await ensureOpportunity(claim, booking);
        return {
          ok: true,
          duplicate: true,
          repaired: ensured.repaired,
          bookingId: booking.bookingId,
          contactId: ensured.contactId,
          opportunityId: ensured.opportunity.id,
          status: claim.status,
        };
      }

      try {
        const contact = await ghl.upsertContact(booking.contact, { propertyAddress: booking.propertyAddress });
        let opportunity = await ghl.findOpportunityByBookingId(contact.id, booking.bookingId);
        let reconciled = true;
        if (!opportunity) {
          opportunity = await ghl.createOpportunity(booking, contact.id);
          reconciled = false;
        }

        await ledger.completeBooking(booking.bookingId, {
          contact_id: contact.id,
          opportunity_id: opportunity.id,
        }, claim.record_id);

        return {
          ok: true,
          duplicate: false,
          reconciled,
          bookingId: booking.bookingId,
          contactId: contact.id,
          opportunityId: opportunity.id,
          status: "opportunity_created",
        };
      } catch (error) {
        await ledger.failBooking(booking.bookingId, error?.message || error, claim.record_id);
        throw error;
      }
    },

    async syncAppointment(rawPayload) {
      const appointment = normalizeAppointmentWebhook(rawPayload);
      const booking = await ledger.claimAppointment(appointment);
      if (!booking) {
        return {
          ok: false,
          matched: false,
          appointmentId: appointment.id,
          reason: "No unique pending booking matched this appointment",
        };
      }
      if (appointment.deleted) {
        await ledger.updateAppointment(booking.booking_id, appointment, "cancelled", booking.record_id);
        return {
          ok: true,
          matched: true,
          bookingId: booking.booking_id,
          opportunityId: booking.opportunity_id,
          appointmentId: appointment.id,
          status: "cancelled",
        };
      }

      const ensured = await ensureOpportunity(booking);

      const customFields = appointmentCustomFields(appointment);
      const isInitialAppointment = booking.status === "opportunity_created";
      const opportunityChanges = {
        ...(appointment.assignedUserId ? { assignedTo: appointment.assignedUserId } : {}),
        ...(isInitialAppointment ? { pipelineStageId: HGV_STAGE_IDS.awaitingConfirmation } : {}),
        ...(customFields.length ? { customFields } : {}),
      };
      if (Object.keys(opportunityChanges).length) {
        await ghl.updateOpportunity(ensured.opportunity.id, opportunityChanges);
      }
      const status = "scheduled";
      await ledger.updateAppointment(booking.booking_id, appointment, status, booking.record_id);

      return {
        ok: true,
        matched: true,
        bookingId: booking.booking_id,
        opportunityId: ensured.opportunity.id,
        appointmentId: appointment.id,
        status,
        repaired: ensured.repaired,
      };
    },

    async createInvoice({ bookingId, sendMode = "draft", dueDays = 7, senderUserId = "" }) {
      if (!bookingId) throw new Error("Missing website booking id for invoice");
      if (!Number.isInteger(dueDays) || dueDays < 0 || dueDays > 365) throw new Error("Invalid invoice due days");
      const claim = await ledger.claimInvoice(bookingId, requestIdFactory());
      if (!claim) throw new Error("No booking ledger row matched this invoice request");
      if (!claim.acquired) {
        return {
          ok: true,
          duplicate: true,
          bookingId,
          invoiceId: claim.invoice_id || null,
          status: claim.invoice_status || claim.status,
        };
      }

      try {
        const booking = bookingFromLedgerPayload(claim.payload);
        let invoice = await ghl.findInvoiceByBookingId(bookingId, claim.contact_id);
        const reconciled = Boolean(invoice);
        if (!invoice) {
          invoice = await ghl.createInvoiceDraft({ booking, contactId: claim.contact_id, dueDays });
        }
        let status = invoice.status || "draft";
        if (sendMode !== "draft" && status === "draft") {
          const userId = senderUserId || claim.assigned_user_id;
          await ghl.sendInvoice(invoice.id, { userId, action: sendMode });
          status = "sent";
        }
        await ledger.completeInvoice(bookingId, invoice, status, claim.record_id);
        return { ok: true, duplicate: false, reconciled, bookingId, invoiceId: invoice.id, status };
      } catch (error) {
        await ledger.failInvoice(bookingId, error?.message || error, claim.record_id);
        throw error;
      }
    },
  };
}
