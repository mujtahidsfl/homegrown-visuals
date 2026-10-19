export type ReturningContact = { fullName: string; email: string; phone: string };

const CONTACT_STORAGE_KEY = "hgv_returning_contact_v1";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function readReturningContact(): ReturningContact | null {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return null;
    const contact = JSON.parse(raw);
    if (!Number.isFinite(contact.savedAt) || contact.savedAt > Date.now() || Date.now() - contact.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(CONTACT_STORAGE_KEY);
      return null;
    }
    if (![contact.fullName, contact.email, contact.phone].every((value) => typeof value === "string" && value.trim())) return null;
    return { fullName: contact.fullName, email: contact.email, phone: contact.phone };
  } catch {
    return null;
  }
}

export function rememberReturningContact(contact: ReturningContact) {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify({
      fullName: contact.fullName.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      savedAt: Date.now(),
    }));
  } catch {
    // Saving contact details is optional; booking must work without storage.
  }
}

export function forgetReturningContact() {
  try { localStorage.removeItem(CONTACT_STORAGE_KEY); } catch { /* Storage may be disabled. */ }
}
