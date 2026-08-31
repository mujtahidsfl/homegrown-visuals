const BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_SCHEMA_KEY = "custom_objects.booking_jobs";
const CLAIM_LEASE_MS = 2 * 60 * 1000;
const SEARCH_DELAYS_MS = [0, 300, 700, 1500, 3000, 5000];

class LedgerRequestError extends Error {
  constructor(status, body) {
    const message = body?.message || body?.error || `GHL Booking Job request failed with status ${status}`;
    super(Array.isArray(message) ? message.join(", ") : String(message));
    this.status = status;
    this.body = body;
  }
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function rowFromRecord(record) {
  if (!record) return null;
  const properties = record.properties || {};
  return {
    record_id: record.id,
    booking_id: properties.website_booking_id || null,
    payload: parseJson(properties.payload_json),
    request_id: properties.request_id || null,
    lease_expires_at: properties.lease_expires_at || null,
    contact_email: properties.contact_email || null,
    contact_phone: properties.contact_phone || null,
    contact_id: properties.contact_id || null,
    opportunity_id: properties.opportunity_id || null,
    appointment_id: properties.appointment_id || null,
    calendar_id: properties.calendar_id || null,
    assigned_user_id: properties.assigned_user_id || null,
    appointment_start: properties.appointment_start || null,
    appointment_end: properties.appointment_end || null,
    invoice_id: properties.invoice_id || null,
    invoice_number: properties.invoice_number || null,
    invoice_status: properties.invoice_status || null,
    invoice_request_id: properties.invoice_request_id || null,
    invoice_lease_expires_at: properties.invoice_lease_expires_at || null,
    submitted_at: properties.submitted_at || null,
    status: properties.status || null,
    error: properties.error || null,
  };
}

function isExpired(value, nowMs) {
  if (!value) return true;
  const timestamp = Date.parse(value);
  return !Number.isFinite(timestamp) || timestamp <= nowMs;
}

function cleanProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [key, value === null || value === undefined ? "" : String(value)]),
  );
}

function bookingSnapshot(booking) {
  const { raw: _raw, ...snapshot } = booking;
  return snapshot;
}

function isUniqueBookingConflict(error) {
  return error?.status === 400 && /same value for Website Booking ID/i.test(error.message);
}

export function createGhlObjectLedger({
  token,
  locationId,
  schemaKey = DEFAULT_SCHEMA_KEY,
  fetchImpl = fetch,
  now = () => Date.now(),
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
} = {}) {
  if (!token || !locationId) throw new Error("Missing GHL Booking Job configuration");

  async function request(path, { method = "GET", body } = {}) {
    const response = await fetchImpl(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "v3",
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
    if (!response.ok) throw new LedgerRequestError(response.status, parsed);
    return parsed;
  }

  async function createRecord(properties) {
    const body = await request(`/objects/${schemaKey}/records`, {
      method: "POST",
      body: { locationId, properties: cleanProperties(properties) },
    });
    return body.record || body;
  }

  async function updateRecord(recordId, properties) {
    const body = await request(`/objects/${schemaKey}/records/${recordId}?locationId=${encodeURIComponent(locationId)}`, {
      method: "PUT",
      body: { properties: cleanProperties(properties) },
    });
    return body.record || body;
  }

  async function getRecord(recordId) {
    const body = await request(
      `/objects/${schemaKey}/records/${recordId}?locationId=${encodeURIComponent(locationId)}`,
    );
    return body.record || body;
  }

  async function searchExact(property, value, { retryIndexing = false } = {}) {
    if (!value) return null;
    const delays = retryIndexing ? SEARCH_DELAYS_MS : [0];
    for (const delay of delays) {
      if (delay) await sleep(delay);
      const body = await request(`/objects/${schemaKey}/records/search`, {
        method: "POST",
        body: {
          locationId,
          page: 1,
          pageLimit: 100,
          query: String(value),
          searchAfter: [],
        },
      });
      const candidate = (body.records || []).find(
        (record) => String(record.properties?.[property] || "") === String(value),
      );
      if (candidate) {
        const record = await getRecord(candidate.id);
        if (String(record.properties?.[property] || "") === String(value)) return record;
      }
    }
    return null;
  }

  async function findByBookingId(bookingId, options) {
    return searchExact("website_booking_id", bookingId, options);
  }

  return {
    async claimBooking(booking, requestId) {
      const leaseExpiresAt = new Date(now() + CLAIM_LEASE_MS).toISOString();
      const payloadJson = JSON.stringify(bookingSnapshot(booking));
      if (payloadJson.length > 12000) throw new Error("Normalized booking exceeds the GHL Booking Job payload limit");
      const properties = {
        website_booking_id: booking.bookingId,
        status: "processing",
        payload_json: payloadJson,
        request_id: requestId,
        lease_expires_at: leaseExpiresAt,
        contact_email: booking.contact.email || "",
        contact_phone: booking.contact.phone || "",
        calendar_id: booking.calendarId || "",
        submitted_at: booking.submittedAt,
        error: "",
      };

      try {
        const record = await createRecord(properties);
        return { acquired: true, ...rowFromRecord(record) };
      } catch (error) {
        if (!isUniqueBookingConflict(error)) throw error;
      }

      const existing = await findByBookingId(booking.bookingId, { retryIndexing: true });
      if (!existing) throw new Error("GHL rejected a duplicate booking but its Booking Job was not searchable yet");
      const row = rowFromRecord(existing);
      const recoverable = row.status === "failed" || (row.status === "processing" && isExpired(row.lease_expires_at, now()));
      if (!recoverable) return { acquired: false, ...row };

      const updated = await updateRecord(existing.id, properties);
      return { acquired: true, ...rowFromRecord(updated) };
    },

    async completeBooking(bookingId, values) {
      const record = await findByBookingId(bookingId, { retryIndexing: true });
      if (!record) throw new Error("No GHL Booking Job matched the completed booking");
      return rowFromRecord(await updateRecord(record.id, {
        contact_id: values.contact_id,
        opportunity_id: values.opportunity_id,
        status: "opportunity_created",
        lease_expires_at: "",
        error: "",
      }));
    },

    async failBooking(bookingId, error) {
      const record = await findByBookingId(bookingId, { retryIndexing: true });
      if (!record) return;
      await updateRecord(record.id, {
        status: "failed",
        lease_expires_at: "",
        error: String(error).slice(0, 2000),
      });
    },

    async claimAppointment(appointment) {
      const exact = await searchExact("appointment_id", appointment.id);
      if (exact) return rowFromRecord(exact);

      for (const delay of SEARCH_DELAYS_MS) {
        if (delay) await sleep(delay);
        const body = await request(`/objects/${schemaKey}/records/search`, {
          method: "POST",
          body: {
            locationId,
            page: 1,
            pageLimit: 100,
            query: String(appointment.contactId),
            searchAfter: [],
          },
        });
        const records = await Promise.all((body.records || []).map((record) => getRecord(record.id)));
        const candidates = records.map(rowFromRecord).filter((row) =>
          row.contact_id === appointment.contactId
          && !row.appointment_id
          && row.status === "opportunity_created"
          && (!appointment.calendarId || !row.calendar_id || row.calendar_id === appointment.calendarId),
        );
        if (candidates.length > 1) return null;
        if (candidates.length === 1) {
          const row = candidates[0];
          return rowFromRecord(await updateRecord(row.record_id, { appointment_id: appointment.id }));
        }
      }
      return null;
    },

    async updateAppointment(bookingId, appointment, status) {
      const record = await findByBookingId(bookingId);
      if (!record) throw new Error("No GHL Booking Job matched the appointment update");
      return rowFromRecord(await updateRecord(record.id, {
        appointment_id: appointment.id,
        calendar_id: appointment.calendarId || "",
        assigned_user_id: appointment.assignedUserId || "",
        appointment_start: appointment.startTime || "",
        appointment_end: appointment.endTime || "",
        status,
      }));
    },

    async claimInvoice(bookingId, requestId) {
      const record = await findByBookingId(bookingId, { retryIndexing: true });
      if (!record) return null;
      const row = rowFromRecord(record);
      if (row.invoice_id) return { acquired: false, ...row };
      if (row.invoice_status === "processing" && !isExpired(row.invoice_lease_expires_at, now())) {
        return { acquired: false, ...row };
      }
      const updated = await updateRecord(record.id, {
        invoice_status: "processing",
        invoice_request_id: requestId,
        invoice_lease_expires_at: new Date(now() + CLAIM_LEASE_MS).toISOString(),
        error: "",
      });
      return { acquired: true, ...rowFromRecord(updated) };
    },

    async completeInvoice(bookingId, invoice, status) {
      const record = await findByBookingId(bookingId);
      if (!record) throw new Error("No GHL Booking Job matched the completed invoice");
      return rowFromRecord(await updateRecord(record.id, {
        invoice_id: invoice.id,
        invoice_number: invoice.invoiceNumber ? String(invoice.invoiceNumber) : "",
        invoice_status: status,
        invoice_lease_expires_at: "",
        status: status === "sent" ? "invoiced" : "invoice_created",
        error: "",
      }));
    },

    async failInvoice(bookingId, error) {
      const record = await findByBookingId(bookingId);
      if (!record) return;
      await updateRecord(record.id, {
        invoice_status: "failed",
        invoice_lease_expires_at: "",
        error: String(error).slice(0, 2000),
      });
    },
  };
}
