import { randomUUID } from "node:crypto";
import { HGV_STAGE_IDS } from "./config.js";
import { appointmentCustomFields } from "./ghl.js";
import { normalizeAppointmentWebhook, normalizeBookingPayload } from "./normalize.js";

function bookingFromLedgerPayload(payload) {
  return payload?.bookingId && payload?.contact && Array.isArray(payload?.lineItems)
    ? payload
    : normalizeBookingPayload(payload);
}

export function createBookingOrchestrator({ ledger, ghl, requestIdFactory = randomUUID } = {}) {
  if (!ledger) throw new Error("Missing booking ledger");
  if (!ghl) throw new Error("Missing GHL client");

  return {
    async submit(rawPayload) {
      const booking = normalizeBookingPayload(rawPayload);
      const requestId = requestIdFactory();
      const claim = await ledger.claimBooking(booking, requestId);
      if (!claim) throw new Error("Booking ledger did not return a claim");

      if (!claim.acquired) {
        return {
          ok: true,
          duplicate: true,
          bookingId: booking.bookingId,
          contactId: claim.contact_id || null,
          opportunityId: claim.opportunity_id || null,
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
      if (!booking.opportunity_id) throw new Error("Matched booking has no GHL opportunity id");

      const customFields = appointmentCustomFields(appointment);
      const isInitialAppointment = booking.status === "opportunity_created" && !appointment.deleted;
      const opportunityChanges = {
        ...(appointment.assignedUserId ? { assignedTo: appointment.assignedUserId } : {}),
        ...(isInitialAppointment ? { pipelineStageId: HGV_STAGE_IDS.awaitingConfirmation } : {}),
        ...(customFields.length ? { customFields } : {}),
      };
      if (Object.keys(opportunityChanges).length) {
        await ghl.updateOpportunity(booking.opportunity_id, opportunityChanges);
      }
      const status = appointment.deleted ? "cancelled" : "scheduled";
      await ledger.updateAppointment(booking.booking_id, appointment, status, booking.record_id);

      return {
        ok: true,
        matched: true,
        bookingId: booking.booking_id,
        opportunityId: booking.opportunity_id,
        appointmentId: appointment.id,
        status,
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
