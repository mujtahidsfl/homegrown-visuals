export const EMAIL_LIST_TAG = "website-email-list";

export function normalizeEmailSignup(payload) {
  const email = typeof payload?.email === "string" ? payload.email.trim().slice(0, 254).toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address");
  return { email };
}

// Upserting by email and then adding the tag is safe to repeat: GHL keeps one
// contact per email and a tag that is already present is not added twice.
export async function subscribeEmailList(signup, { ghl }) {
  const contact = await ghl.upsertContact({ email: signup.email });
  await ghl.addContactTags(contact.id, [EMAIL_LIST_TAG]);
  return { ok: true, contactId: contact.id };
}
