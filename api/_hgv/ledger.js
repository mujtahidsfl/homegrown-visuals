function asSingleRow(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

export function createSupabaseLedger({ url, serviceRoleKey, fetchImpl = fetch } = {}) {
  if (!url || !serviceRoleKey) throw new Error("Missing Homegrown booking ledger configuration");
  const base = url.replace(/\/$/, "");

  async function request(path, { method = "GET", body, prefer } = {}) {
    const response = await fetchImpl(`${base}/rest/v1${path}`, {
      method,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(prefer ? { Prefer: prefer } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { message: text.slice(0, 300) };
    }
    if (!response.ok) throw new Error(parsed?.message || `Booking ledger request failed with status ${response.status}`);
    return parsed;
  }

  return {
    async claimBooking(booking, requestId) {
      return asSingleRow(await request("/rpc/claim_hgv_booking", {
        method: "POST",
        body: {
          p_booking_id: booking.bookingId,
          p_payload: booking.raw,
          p_request_id: requestId,
          p_contact_email: booking.contact.email || null,
          p_contact_phone: booking.contact.phone || null,
          p_calendar_id: booking.calendarId || null,
          p_submitted_at: booking.submittedAt,
        },
      }));
    },

    async completeBooking(bookingId, values) {
      return asSingleRow(await request(`/hgv_booking_jobs?booking_id=eq.${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: { ...values, status: "opportunity_created", error: null, updated_at: new Date().toISOString() },
      }));
    },

    async failBooking(bookingId, error) {
      await request(`/hgv_booking_jobs?booking_id=eq.${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        body: { status: "failed", error: String(error).slice(0, 2000), updated_at: new Date().toISOString() },
      });
    },

    async claimAppointment(appointment) {
      return asSingleRow(await request("/rpc/claim_hgv_appointment", {
        method: "POST",
        body: {
          p_appointment_id: appointment.id,
          p_contact_id: appointment.contactId,
          p_calendar_id: appointment.calendarId || null,
        },
      }));
    },

    async updateAppointment(bookingId, appointment, status) {
      return asSingleRow(await request(`/hgv_booking_jobs?booking_id=eq.${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: {
          appointment_id: appointment.id,
          calendar_id: appointment.calendarId || null,
          assigned_user_id: appointment.assignedUserId || null,
          appointment_start: appointment.startTime || null,
          appointment_end: appointment.endTime || null,
          status,
          updated_at: new Date().toISOString(),
        },
      }));
    },

    async claimInvoice(bookingId, requestId) {
      return asSingleRow(await request("/rpc/claim_hgv_invoice", {
        method: "POST",
        body: { p_booking_id: bookingId, p_request_id: requestId },
      }));
    },

    async completeInvoice(bookingId, invoice, status) {
      return asSingleRow(await request(`/hgv_booking_jobs?booking_id=eq.${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        prefer: "return=representation",
        body: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoiceNumber ? String(invoice.invoiceNumber) : null,
          invoice_status: status,
          status: status === "sent" ? "invoiced" : "invoice_created",
          error: null,
          updated_at: new Date().toISOString(),
        },
      }));
    },

    async failInvoice(bookingId, error) {
      await request(`/hgv_booking_jobs?booking_id=eq.${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        body: {
          invoice_status: "failed",
          error: String(error).slice(0, 2000),
          updated_at: new Date().toISOString(),
        },
      });
    },
  };
}
