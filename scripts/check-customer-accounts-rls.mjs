// Live check that one customer cannot read or change another customer's rows.
// Creates two temporary users, signs each in with a one-time link token (password
// sign-in stays disabled), runs the checks, then deletes both users.
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
//   npm run check:customer-accounts:rls
// The service-role key is only for this local check. Never deploy it to Vercel.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const REQUIRED = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, clientOptions);
const stamp = Date.now();
const createdUserIds = [];

async function temporaryCustomer(tag) {
  const email = `rls-check-${tag}-${stamp}@example.com`;
  const created = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (created.error) throw new Error(`Could not create test user: ${created.error.message}`);
  createdUserIds.push(created.data.user.id);
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error) throw new Error(`Could not create sign-in link: ${link.error.message}`);
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, clientOptions);
  const verified = await client.auth.verifyOtp({ token_hash: link.data.properties.hashed_token, type: "magiclink" });
  if (verified.error) throw new Error(`Could not sign in test user: ${verified.error.message}`);
  return { client, userId: created.data.user.id };
}

try {
  const a = await temporaryCustomer("a");
  const b = await temporaryCustomer("b");

  const upsert = await a.client.from("customer_profiles").upsert({ user_id: a.userId, full_name: "RLS Test A", phone: "0000000000" });
  assert.equal(upsert.error, null, `A could not write own profile: ${upsert.error?.message}`);
  const own = await a.client.from("customer_addresses").insert({ user_id: a.userId, label: "A", address: "1 Test St" });
  assert.equal(own.error, null, `A could not add own address: ${own.error?.message}`);

  const read = await b.client.from("customer_profiles").select("*").eq("user_id", a.userId);
  assert.equal(read.error, null);
  assert.deepEqual(read.data, [], "B could read A's profile");

  const update = await b.client.from("customer_profiles").update({ full_name: "x" }).eq("user_id", a.userId).select();
  assert.deepEqual(update.data ?? [], [], "B could update A's profile");

  const insert = await b.client.from("customer_addresses").insert({ user_id: a.userId, label: "x", address: "2 Test St" });
  assert.notEqual(insert.error, null, "B could insert an address for A");

  const addresses = await b.client.from("customer_addresses").select("*").eq("user_id", a.userId);
  assert.deepEqual(addresses.data ?? [], [], "B could read A's addresses");

  const removed = await b.client.from("customer_addresses").delete().eq("user_id", a.userId).select();
  assert.deepEqual(removed.data ?? [], [], "B could delete A's addresses");

  console.log("RLS isolation checks passed");
} finally {
  for (const id of createdUserIds) await admin.auth.admin.deleteUser(id);
}
