import type { ReturningContact } from "./returningContact";

type ProfileLike = { full_name?: string | null; phone?: string | null } | null | undefined;
type SavedAddressLike = { id: string; label?: string | null; address: string };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** A signed-in customer's profile as booking contact details, or null if incomplete. */
export function profileAsContact(profile: ProfileLike, email: string | null | undefined): ReturningContact | null {
  const fullName = String(profile?.full_name ?? "").trim();
  const phone = String(profile?.phone ?? "").trim();
  const cleanEmail = String(email ?? "").trim();
  if (!fullName || !phone || !cleanEmail) return null;
  return { fullName, email: cleanEmail, phone };
}

/** Saved addresses to offer as one-tap chips, hiding the one already entered. */
export function addressChoices(saved: SavedAddressLike[], current: string): { id: string; text: string; address: string }[] {
  return saved
    .filter((entry) => entry.address.trim() && !same(entry.address, current))
    .map((entry) => {
      const label = String(entry.label ?? "").trim();
      return { id: entry.id, text: label ? `${label} — ${entry.address}` : entry.address, address: entry.address };
    });
}

/** Offer "save this address" only for a new, non-empty address. */
export function shouldOfferSaveAddress(saved: { address: string }[], submittedAddress: string): boolean {
  if (!submittedAddress.trim()) return false;
  return !saved.some((entry) => same(entry.address, submittedAddress));
}
