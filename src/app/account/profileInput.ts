export type ProfileRow = { full_name: string; phone: string };
export type AddressInput = { label: string; address: string };

const clip = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export function normalizeProfileInput(input: { fullName: string; phone: string }): ProfileRow {
  return { full_name: clip(input.fullName, 120), phone: clip(input.phone, 30) };
}

/** Returns null when there's no address to save. */
export function normalizeAddressInput(input: { label: string; address: string }): AddressInput | null {
  const address = clip(input.address, 300);
  if (!address) return null;
  return { label: clip(input.label, 60), address };
}
