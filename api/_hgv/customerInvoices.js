import { HGV_TIME_ZONE } from "./config.js";

const PAY_BASE_URL = "https://link.fastpaydirect.com";
const PAYABLE = new Set(["unpaid", "partially_paid", "overdue"]);
const SUMMARY_MAX = 120;

function calendarDate(value) {
  return String(value || "").slice(0, 10);
}

function todayInBusinessZone(now) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: HGV_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function summaryFrom(items) {
  const text = (Array.isArray(items) ? items : [])
    .map((item) => String(item?.name || "").trim())
    .filter(Boolean)
    .join(", ");
  return text.length > SUMMARY_MAX ? `${text.slice(0, SUMMARY_MAX - 1).trimEnd()}…` : text;
}

const finite = (value) => (value === null || value === undefined || value === "" ? NaN : Number(value));

/** Amount still owed, or null when the invoice doesn't say. */
function resolveAmountDue(invoice) {
  const due = finite(invoice.amountDue);
  if (Number.isFinite(due)) return due;
  const total = finite(invoice.total);
  if (!Number.isFinite(total)) return null;
  const paid = finite(invoice.amountPaid);
  return total - (Number.isFinite(paid) ? paid : 0);
}

function customerStatus(rawStatus, amountDue, dueDate, now) {
  if (rawStatus === "void") return "void";
  if (rawStatus === "paid" || amountDue <= 0) return "paid";
  if (rawStatus === "partially_paid") return "partially_paid";
  if (rawStatus === "sent" && dueDate && dueDate < todayInBusinessZone(now)) return "overdue";
  return "unpaid";
}

/**
 * Reduce a raw GHL invoice to the fields a customer may see.
 * Returns null for drafts, which Dean hasn't sent yet.
 */
export function toCustomerInvoice(invoice, now) {
  const rawStatus = String(invoice?.status || "").trim().toLowerCase();
  if (rawStatus === "draft") return null;

  const amountDue = resolveAmountDue(invoice);
  const dueDate = calendarDate(invoice.dueDate);
  // If we can't tell what's owed, never claim it's paid (unless GHL says so) and never offer a pay link.
  const status = amountDue === null
    ? (rawStatus === "void" || rawStatus === "paid" ? rawStatus : "unpaid")
    : customerStatus(rawStatus, amountDue, dueDate, now);
  // Only statuses we know are open for payment get a pay link; anything unrecognised
  // (e.g. payment_processing) shows as unpaid without one.
  const knownPayable = rawStatus === "sent" || rawStatus === "partially_paid" || rawStatus === "overdue";
  const id = invoice._id || invoice.id;

  const result = {
    number: String(invoice.invoiceNumber || ""),
    issueDate: calendarDate(invoice.issueDate),
    dueDate,
    total: Number(invoice.total) || 0,
    amountDue: amountDue ?? 0,
    currency: String(invoice.currency || "USD"),
    status,
    summary: summaryFrom(invoice.items),
  };
  if (knownPayable && PAYABLE.has(status) && amountDue !== null && amountDue > 0 && id) {
    result.payUrl = `${PAY_BASE_URL}/invoice/${encodeURIComponent(id)}`;
  }
  return result;
}

export function toCustomerInvoices(invoices, now) {
  return (Array.isArray(invoices) ? invoices : [])
    .map((invoice) => toCustomerInvoice(invoice, now))
    .filter(Boolean)
    .sort((a, b) => (a.issueDate < b.issueDate ? 1 : a.issueDate > b.issueDate ? -1 : 0));
}
