// Profile and saved addresses, read and written directly with the customer's own
// Supabase session. RLS limits every query to the signed-in user's rows; the
// explicit user_id filters are a second guard.
import { supabase } from "./supabaseClient";
import { normalizeAddressInput, normalizeProfileInput, type ProfileRow } from "./profileInput";

export type SavedAddress = { id: string; label: string; address: string };

async function currentUserId(): Promise<string> {
  if (!supabase) throw new Error("Login is unavailable");
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

export async function loadProfile(): Promise<ProfileRow | null> {
  const userId = await currentUserId();
  const { data, error } = await supabase!.from("customer_profiles").select("full_name, phone").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function saveProfile(input: { fullName: string; phone: string }): Promise<void> {
  const userId = await currentUserId();
  const row = normalizeProfileInput(input);
  const { error } = await supabase!
    .from("customer_profiles")
    .upsert({ user_id: userId, ...row, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function listAddresses(): Promise<SavedAddress[]> {
  const userId = await currentUserId();
  const { data, error } = await supabase!
    .from("customer_addresses")
    .select("id, label, address")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addAddress(input: { label: string; address: string }): Promise<void> {
  const row = normalizeAddressInput(input);
  if (!row) throw new Error("Address is required");
  const userId = await currentUserId();
  const { error } = await supabase!.from("customer_addresses").insert({ user_id: userId, ...row });
  if (error) throw error;
}

export async function updateAddress(id: string, input: { label: string; address: string }): Promise<void> {
  const row = normalizeAddressInput(input);
  if (!row) throw new Error("Address is required");
  const userId = await currentUserId();
  const { error } = await supabase!.from("customer_addresses").update(row).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function deleteAddress(id: string): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase!.from("customer_addresses").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
