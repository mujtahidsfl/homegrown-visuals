# Customer Login and Invoice Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optional email-code login for Homegrown customers, with a saved profile and saved addresses, plus an `/account` page that lists only the customer's own GHL invoices.

**Architecture:** Supabase Auth (email OTP) handles sign-in in the browser. Profile and addresses live in two Supabase tables protected by RLS, and the browser reads and writes them directly. A new Vercel function `api/hgv-account.js` checks the Supabase access token, takes the verified email, finds the matching GHL contacts with the existing server-side GHL client, and returns a reduced, safe list of invoices.

**Tech Stack:** Vite 6 + React 18 + TypeScript, react-router, Tailwind; Vercel Node functions in `api/`; `@supabase/supabase-js` v2; Node 26 `node:assert` test scripts in `scripts/` (Node runs `.ts` files directly).

**Spec:** `docs/superpowers/specs/2026-11-06-customer-login-design.md`

## Global Constraints

- Sign-in uses email OTP only (6-digit code plus magic link). Password and social providers are turned off.
- Login is optional. Guest booking and the existing `returningContact.ts` reuse on one device must keep working unchanged.
- The server never trusts an email or contact ID from the request. Only the verified email inside the Supabase token is used.
- Invoice response fields are exactly `number, issueDate, dueDate, total, amountDue, currency, status, summary, payUrl?`.
- `status` ∈ `unpaid | partially_paid | overdue | paid | void`. Drafts are left out.
- `payUrl` is only present when status is `unpaid | partially_paid | overdue` **and** `amountDue > 0`. Its form is `https://link.fastpaydirect.com/invoice/<id>`, matching `ghl.js:255`.
- Profile fields are exactly: `full_name`, `phone`, plus email (read-only, from auth). Addresses: `label`, `address` (one string, the same as the booking flow's `address`).
- A saved address is only filled in when the customer taps it. Every booking starts with blank property fields.
- GHL calls time out after 8000 ms → `503 { error: "invoices_unavailable" }`.
- Server logs never contain names, emails, phones, addresses or amounts.
- Copy, exactly as written:
  - No invoices: "No invoices yet. If you booked with a different email, contact us at info@homegrown.marketing."
  - Load failure: "Couldn't load invoices — try again."
  - Void note: "This invoice was cancelled. If you think that's a mistake, contact us at info@homegrown.marketing."
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (browser); `SUPABASE_URL`, `SUPABASE_ANON_KEY`, plus the existing `GHL_PIT` / `GHL_HOMEGROWN_API_TOKEN` (server).

## Review Focus

1. **Email casing and whitespace.** GHL may store `Jane@Example.com ` when the user logs in as `jane@example.com`. Expect a match. GHL search results that aren't an exact case-insensitive match after trimming must be dropped. (Task 3.)
2. **Status says "sent" but nothing is owed.** An invoice with `status: "sent"` and `amountDue: 0` should show as paid with no pay button. (Task 2.)
3. **Overdue is calculated, not stored.** A `sent` invoice whose `dueDate` is before now shows as `overdue`. (Task 2.)
4. **Open redirect through `?next=`.** After login, only same-site paths that start with a single `/` are followed. `//evil.com`, `https://…` and `/\evil` fall back to `/account`. (Task 5.)
5. **Session expires on the account page.** A 401 from `/api/hgv-account` sends the customer to `/account/login?next=/account`, not to an error screen. (Task 6, a test on `invoicesApi`.)

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/customer_accounts_schema.sql` | Tables and RLS policies |
| `scripts/check-customer-accounts-rls.mjs` | Live check that user A can't read or write user B's rows (run during rollout) |
| `api/_hgv/customerInvoices.js` | Pure function: GHL invoice → safe customer invoice |
| `api/_hgv/ghl.js` (modify) | Add `findContactIdsByEmail`, `listContactInvoices` |
| `api/_hgv/supabaseAuth.js` | `verifySupabaseToken(token, env)` → `{ email } \| null` |
| `api/hgv-account.js` | GET handler; `createAccountHandler(deps)` for tests |
| `src/app/account/supabaseClient.ts` | The single browser Supabase client |
| `src/app/account/safeNext.ts` | Cleans up the `?next=` value |
| `src/app/account/useCustomerSession.ts` | Session hook: `session`, `email`, `sendCode`, `verifyCode`, `signOut` |
| `src/app/account/profileApi.ts` | Profile and address CRUD plus pure input normalizers |
| `src/app/account/invoicesApi.ts` | `fetchMyInvoices(token, fetchImpl)` → result union |
| `src/app/account/LoginPage.tsx` | `/account/login` |
| `src/app/account/AccountPage.tsx` | `/account` (invoices, details, addresses) |
| `src/app/booking/savedAddresses.ts` | Pure helpers for chips and save-address offers in the booking flow |
| `src/app/routes.ts`, `SiteNavbar.tsx`, `ServicesBookingFlow.tsx` (modify) | Wiring |
| `scripts/test-homegrown-account.mjs` | Tests for Tasks 2–4 (server) |
| `scripts/test-homegrown-account-client.mjs` | Tests for Tasks 5–7 (browser-side logic) |

---

### Task 1: Supabase schema and RLS check

**Files:**
- Create: `supabase/customer_accounts_schema.sql`
- Create: `scripts/check-customer-accounts-rls.mjs`
- Modify: `package.json` (script `check:customer-accounts:rls`)

**Interfaces:**
- Produces: tables `public.customer_profiles(user_id uuid pk, full_name text, phone text, updated_at)` and `public.customer_addresses(id uuid pk, user_id uuid, label text, address text, created_at)`, both with RLS `auth.uid() = user_id` for all operations.

- [ ] **Step 1: Write the SQL migration.** Copy the SQL block from the spec's Architecture → Supabase section exactly as written. Use `create table if not exists`, matching `portfolio_items_schema.sql`. Also add `create policy` inside a `do $$ … $$` guard so the file can be re-run.
- [ ] **Step 2: Write `scripts/check-customer-accounts-rls.mjs`.** It reads `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RLS_TEST_A_EMAIL/PASSWORD` and `RLS_TEST_B_EMAIL/PASSWORD`, which are throwaway users the operator creates in the dashboard. Steps:
  - Sign in as A and upsert A's profile.
  - Sign in as B and assert that `select * from customer_profiles where user_id = A` returns `[]`.
  - Assert that B's `update customer_profiles set full_name='x' where user_id = A` affects 0 rows.
  - Assert that B's `insert into customer_addresses (user_id=A, …)` errors.
  - Print `RLS isolation checks passed`.
  - Exit non-zero if any variable is missing, printing the missing names.
- [ ] **Step 3: Verify the script fails cleanly without env.** Run: `node scripts/check-customer-accounts-rls.mjs`. Expected: exit 1, with output listing `SUPABASE_URL` and the others as missing.
- [ ] **Step 4: Commit.** `git add supabase/customer_accounts_schema.sql scripts/check-customer-accounts-rls.mjs package.json && git commit -m "feat(account): add customer profile/address schema with RLS"`

> Applying the migration and running the live RLS check happen in Task 8, once there's Supabase access.

---

### Task 2: Map GHL invoices to safe customer invoices

**Files:**
- Create: `api/_hgv/customerInvoices.js`
- Create: `scripts/test-homegrown-account.mjs`
- Modify: `package.json` (script `test:homegrown:account`)

**Interfaces:**
- Produces: `toCustomerInvoice(ghlInvoice, now: Date) → CustomerInvoice | null` (null for drafts) and `toCustomerInvoices(list, now) → CustomerInvoice[]` (drafts dropped, sorted by `issueDate` newest first).
- `CustomerInvoice = { number: string, issueDate: string, dueDate: string, total: number, amountDue: number, currency: string, status: "unpaid"|"partially_paid"|"overdue"|"paid"|"void", summary: string, payUrl?: string }`.

- [ ] **Step 1: Write the failing tests** in `scripts/test-homegrown-account.mjs`, using a fixture builder `inv(overrides)` with defaults `{ _id: "inv_1", invoiceNumber: "1001", status: "sent", issueDate: "2026-10-01", dueDate: "2026-12-01", total: 450, amountDue: 450, currency: "USD", items: [{ name: "Standard Package" }, { name: "Drone Photos" }], contactDetails: { email: "x@y.com", name: "Private" }, businessDetails: {} }` and `now = new Date("2026-11-06T12:00:00Z")`:
  - `sent` → status `unpaid`, `payUrl === "https://link.fastpaydirect.com/invoice/inv_1"`, `summary === "Standard Package, Drone Photos"`.
  - `partially_paid` with amountDue 200 → `partially_paid` and a payUrl.
  - `sent` with dueDate `"2026-11-01"` → `overdue` and a payUrl.
  - `sent` with `amountDue: 0` → `paid` and no `payUrl` key (Review Focus 2).
  - `paid` → `paid` with no payUrl. `void` → `void` with no payUrl, even when amountDue is above 0.
  - `draft` → `toCustomerInvoice` returns null, and `toCustomerInvoices` leaves it out.
  - Any other or unknown status (for example `payment_processing`) → `unpaid` with **no** payUrl.
  - `Object.keys(result).sort()` deep-equals `["amountDue","currency","dueDate","issueDate","number","payUrl","status","summary","total"]`, so `contactDetails` and `_id` never leak.
  - Sorting: issueDates `2026-09-01` and `2026-10-15` come back as `["2026-10-15","2026-09-01"]`.
  - Summary is capped at 120 characters, ending with `…` when cut.
- [ ] **Step 2: Run it and confirm it fails.** Run: `node scripts/test-homegrown-account.mjs`. Expected: FAIL with `Cannot find module …/customerInvoices.js`.
- [ ] **Step 3: Implement `toCustomerInvoice` and `toCustomerInvoices`** in `api/_hgv/customerInvoices.js`. Lowercase the status first. The payable check is `amountDue > 0 && status in {unpaid, partially_paid, overdue}`. Compare `dueDate` against `now` by calendar date in `HGV_TIME_ZONE` from `config.js`. Number coercion: `Number(x) || 0`.
- [ ] **Step 4: Run and confirm it passes.** Run: `node scripts/test-homegrown-account.mjs`. Expected: no assertion errors.
- [ ] **Step 5: Commit.** `git commit -am "feat(account): map GHL invoices to customer-safe shape"` (also add the new files).

---

### Task 3: GHL lookups by verified email

**Files:**
- Modify: `api/_hgv/ghl.js`, adding two methods to the object `createGhlClient` returns
- Test: `scripts/test-homegrown-account.mjs` (append)

**Interfaces:**
- Consumes: `createGhlClient({ token, locationId, fetchImpl })` (existing).
- Produces:
  - `ghl.findContactIdsByEmail(email: string) → Promise<string[]>`
  - `ghl.listContactInvoices(contactId: string) → Promise<object[]>` (raw GHL invoices)

- [ ] **Step 1: Write the failing tests** with a fake `fetchImpl` that records `(url, init)` calls and returns `{ ok: true, status: 200, text: async () => JSON.stringify(body) }`:
  - `findContactIdsByEmail(" Jane@Example.com ")`:
    - sends `POST https://services.leadconnectorhq.com/contacts/search` with header `Version: 2021-07-28`;
    - the JSON body has `locationId === HGV_LOCATION_ID`, `pageLimit: 20`, and `filters: [{ field: "email", operator: "eq", value: "jane@example.com" }]`.
  - The fake returns contacts with emails `"JANE@example.com "`, `"jane@example.com"` and `"janet@example.com"`. The result has the first two IDs only (Review Focus 1).
  - An empty or whitespace email resolves to `[]` without calling fetch.
  - `listContactInvoices("c1")` calls `GET /invoices/?altId=<loc>&altType=location&contactId=c1&limit=100&offset=0` and returns `body.invoices` (or `[]` when missing).
- [ ] **Step 2: Run and confirm it fails.** Run: `node scripts/test-homegrown-account.mjs`. Expected: FAIL with `ghl.findContactIdsByEmail is not a function`.
- [ ] **Step 3: Implement both methods** inside `createGhlClient`, using the existing `request()` helper. Check the request shape against GHL's current "Search Contacts" docs before relying on it, and if they differ, change the test to match the docs, not the other way round.
- [ ] **Step 4: Run and confirm it passes.** Run: `node scripts/test-homegrown-account.mjs`, then `npm run test:homegrown:api && npm run test:homegrown:orchestrator`. Expected: all pass, with no regressions in existing GHL users.
- [ ] **Step 5: Commit.** `git commit -am "feat(account): GHL contact lookup by verified email and per-contact invoices"`

---

### Task 4: `api/hgv-account.js` handler

**Files:**
- Create: `api/_hgv/supabaseAuth.js`
- Create: `api/hgv-account.js`
- Test: `scripts/test-homegrown-account.mjs` (append)
- Modify: `package.json`, adding the dependency `@supabase/supabase-js@^2.117.2` (`bun add`, matching `bun.lock`)

**Interfaces:**
- Consumes: `toCustomerInvoices` (Task 2); `findContactIdsByEmail` and `listContactInvoices` (Task 3); `sendJson` (`api/_hgv/http.js`).
- Produces:
  - `verifySupabaseToken(token, env) → Promise<{ email: string } | null>` — calls `createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY).auth.getUser(token)`. It returns null on error, when the email is missing, or when `email_confirmed_at` is missing.
  - `createAccountHandler({ verifyToken, makeGhl, now = () => new Date(), timeoutMs = 8000, log = console.error }) → (req, res) => Promise<void>`.
  - The default export is `createAccountHandler` wired to the env (`GHL_PIT || GHL_HOMEGROWN_API_TOKEN`).
  - The response is `200 { ok: true, email, invoices: CustomerInvoice[] }`.

- [ ] **Step 1: Write the failing tests** with a fake `res` (records `statusCode`, headers, body) and stubbed deps:
  - A `POST` request → 405 with `Allow: GET`.
  - No `Authorization` header → 401 `{ ok:false, error:"unauthorized" }`, and `verifyToken` isn't called.
  - `verifyToken` returns null → 401.
  - The request URL `/api/hgv-account?email=other@x.com&contactId=evil` with a token for `me@x.com` → `findContactIdsByEmail` called once with `"me@x.com"`, and never with `other@x.com` or `evil`.
  - Two contact IDs → `listContactInvoices` called for each, and the invoices are merged, de-duplicated by `_id`, mapped and sorted.
  - No contacts → 200 with `invoices: []`.
  - `makeGhl().findContactIdsByEmail` never resolves, with `timeoutMs: 20` → 503 `{ ok:false, error:"invoices_unavailable" }`.
  - GHL throws `Error("boom jane@example.com 450")` → 503. `log` is called once, and its stringified arguments contain neither `jane@example.com` nor `450`.
  - A missing GHL token in the default wiring → 503 (not 500).
- [ ] **Step 2: Run and confirm it fails.** Run: `node scripts/test-homegrown-account.mjs`. Expected: FAIL with `Cannot find module …/hgv-account.js`.
- [ ] **Step 3: Implement** `supabaseAuth.js` and `hgv-account.js`. Wrap all GHL work in one `Promise.race` against the timeout. `log` receives only `{ requestId, errorName, status }`, where `requestId = req.headers["x-vercel-id"] || "local"`. Set `Cache-Control: no-store` on every response.
- [ ] **Step 4: Run and confirm it passes.** Run: `node scripts/test-homegrown-account.mjs`. Expected: all pass.
- [ ] **Step 5: Commit.** `git add api/hgv-account.js api/_hgv/supabaseAuth.js package.json bun.lock scripts/test-homegrown-account.mjs && git commit -m "feat(account): authenticated own-invoices endpoint"`

---

### Task 5: Browser auth layer and login page

**Files:**
- Create: `src/app/account/supabaseClient.ts`, `safeNext.ts`, `useCustomerSession.ts`, `LoginPage.tsx`
- Create: `scripts/test-homegrown-account-client.mjs`; add the `test:homegrown:account-client` script
- Modify: `src/app/routes.ts` (add `account/login`), `src/app/components/SiteNavbar.tsx`

**Interfaces:**
- Produces:
  - `supabase` (a `SupabaseClient`, or `null` when the `VITE_SUPABASE_*` variables are missing, so the site still builds and runs without them and the login UI shows "Login is unavailable right now").
  - `safeNext(raw: string | null) → string`.
  - `useCustomerSession() → { ready: boolean, session: Session | null, email: string | null, sendCode(email): Promise<{ ok: true } | { ok: false, message: string }>, verifyCode(email, code): Promise<same>, signOut(): Promise<void> }`.
  - `sendCode` uses `signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: origin + "/account/login?next=" + encodeURIComponent(next) } })`. `verifyCode` uses `verifyOtp({ email, token, type: "email" })`.

- [ ] **Step 1: Write the failing tests** for `safeNext` (Review Focus 4):
  - `"/services?x=1"` → itself.
  - `null`, `""`, `"//evil.com"`, `"https://evil.com"`, `"/\\evil.com"`, `"javascript:alert(1)"` and `"account"` → `"/account"`.
  - `"/account/login"` → `"/account"`, to avoid a login loop.
- [ ] **Step 2: Run and confirm it fails.** Run: `node scripts/test-homegrown-account-client.mjs`. Expected: FAIL with `Cannot find module …/safeNext.ts`.
- [ ] **Step 3: Implement `safeNext.ts`, then the client, the hook and `LoginPage.tsx`.**
  - Login page, step 1 is an email input and a "Send code" button. Step 2 is a 6-digit `inputMode="numeric" autoComplete="one-time-code"` field, "Verify", "Resend code" and "Use a different email".
  - Errors appear inline. A Supabase rate-limit error reads "Please wait a minute before requesting another code."
  - If a session already exists or is created by the magic link, the page runs `navigate(safeNext(params.get("next")), { replace: true })`.
  - Style it with the existing `PRIMARY_BUTTON` look from `ServicesBookingFlow.tsx` (`h-11 px-6 rounded-full bg-[#111111] …`).
  - Navbar: next to "Book With Us", a "Log in" link (`/account/login`) when signed out and "My account" (`/account`) when signed in. Add the same to the mobile menu, plus "Sign out" when signed in.
- [ ] **Step 4: Run tests and build.** Run: `node scripts/test-homegrown-account-client.mjs && npm run build`. Expected: tests pass and the build succeeds, with and without `VITE_SUPABASE_*` set.
- [ ] **Step 5: Commit.** `git commit -m "feat(account): email-code login page and navbar entry"` (add the new files).

---

### Task 6: Account page: invoices, details, addresses

**Files:**
- Create: `src/app/account/invoicesApi.ts`, `profileApi.ts`, `AccountPage.tsx`
- Modify: `src/app/routes.ts` (add `account`)
- Test: `scripts/test-homegrown-account-client.mjs` (append)

**Interfaces:**
- Consumes: `useCustomerSession` (Task 5); the `/api/hgv-account` response (Task 4); the `CustomerInvoice` type (Task 2, re-declared in TS here).
- Produces:
  - `fetchMyInvoices(accessToken: string, fetchImpl = fetch) → Promise<{ kind: "ok", invoices: CustomerInvoice[] } | { kind: "unauthorized" } | { kind: "unavailable" }>`.
  - `normalizeProfileInput({ fullName, phone }) → { full_name, phone }` (trimmed; full name capped at 120 characters, phone at 30).
  - `normalizeAddressInput({ label, address }) → { label, address } | null` (null when the trimmed address is empty; label capped at 60 and address at 300).
  - `loadProfile()`, `saveProfile(input)`, `listAddresses()`, `addAddress(input)`, `updateAddress(id, input)`, `deleteAddress(id)` — thin wrappers over `supabase.from(...)`, always scoped by the session's user ID.

- [ ] **Step 1: Write the failing tests:**
  - `fetchMyInvoices` with a fake fetch: 200 → `ok`; 401 → `unauthorized` (Review Focus 5); 503 → `unavailable`; fetch rejecting → `unavailable`. The request sends `Authorization: Bearer <token>` to `/api/hgv-account`, with no query string.
  - `normalizeProfileInput({ fullName: "  Ann  ", phone: " 850 " })` deep-equals `{ full_name: "Ann", phone: "850" }`.
  - `normalizeAddressInput({ label: "", address: "   " })` → null.
- [ ] **Step 2: Run and confirm it fails.** Run: `node scripts/test-homegrown-account-client.mjs`. Expected: FAIL with a missing module.
- [ ] **Step 3: Implement the modules and `AccountPage.tsx`.**
  - Redirect to `/account/login?next=/account` when there's no session, once `ready`, and also on an `unauthorized` result.
  - Invoices section:
    - one card per invoice with number, `issueDate`, summary, total and a badge (Unpaid / Partly paid / Overdue / Paid / Cancelled);
    - a "Pay now" link (`target="_blank" rel="noopener noreferrer"`) only when `payUrl` is set, with "Amount due $X" beside it;
    - the void note on `void` invoices;
    - the exact empty-state and error copy from Global Constraints, with a "Try again" button on error.
  - "My details": name and phone inputs, the email shown read-only, and a Save button that shows "Saved".
  - "Saved addresses": a list with edit and delete, and an add form that uses the existing `AddressAutocompleteInput`.
  - Profile and address sections keep working when invoices are `unavailable`.
  - Format money with `Intl.NumberFormat("en-US", { style: "currency", currency })`.
- [ ] **Step 4: Run tests and build.** Run: `node scripts/test-homegrown-account-client.mjs && npm run build`. Expected: pass, and the build succeeds.
- [ ] **Step 5: Commit.** `git commit -m "feat(account): account page with invoices, details and saved addresses"` (add the new files).

---

### Task 7: Booking-flow integration

**Files:**
- Create: `src/app/booking/savedAddresses.ts`
- Modify: `src/app/components/ServicesBookingFlow.tsx`: the contact-reuse block (~L781, L876–883, L2093–2100), the real-estate property step (`<AddressAutocompleteInput>` ~L2643), the land property step (~L2371), and the success paths (~L1892, L1999)
- Test: `scripts/test-homegrown-returning-contact.mjs` (extend)

**Interfaces:**
- Consumes: `useCustomerSession`, `loadProfile`, `listAddresses`, `addAddress` (Tasks 5–6).
- Produces:
  - `profileAsContact(profile, email) → ReturningContact | null` (null unless name, email and phone are all non-empty).
  - `addressChoices(saved: { id, label, address }[], current: string) → { id, text }[]`, where `text = label ? label + " — " + address : address`. It hides the entry that matches `current`, comparing trimmed and case-insensitive.
  - `shouldOfferSaveAddress(saved, submittedAddress) → boolean` (false when empty or already saved, case-insensitive).

- [ ] **Step 1: Write the failing tests**, appended to `test-homegrown-returning-contact.mjs`:
  - `profileAsContact({ full_name: "A", phone: "1" }, "a@x.com")` deep-equals `{ fullName: "A", email: "a@x.com", phone: "1" }`. Leaving out the phone gives null.
  - `addressChoices([{ id:"1", label:"Home", address:"1 Main St" }], "")` deep-equals `[{ id:"1", text:"Home — 1 Main St" }]`. With current `" 1 main st "` the result is `[]`.
  - `shouldOfferSaveAddress([{ address: "1 Main St" }], "1 MAIN ST")` → false. With `"2 Oak Ave"` → true. With `""` → false.
  - The existing guest assertions remain unchanged and passing.
- [ ] **Step 2: Run and confirm it fails.** Run: `npm run test:homegrown:returning-contact`. Expected: FAIL with a missing module.
- [ ] **Step 3: Implement the helpers and wire them into `ServicesBookingFlow.tsx`.**
  - **Signed in with a complete profile:** `returningContact` becomes `profileAsContact(...)`. The banner says "Signed in as {email}" and the button reads "Use my account details". Reuse stays a tap, as it is today.
  - **Signed out:** the existing `readReturningContact` behaviour is untouched.
  - **Property steps:** under each address input, render `addressChoices` as chip buttons ("Use a saved address"). A tap calls the existing setter (`setRealEstateProperty(c => ({ ...c, address }))` / `setLandProperty({ address })`). Nothing is pre-filled.
  - **Real-estate and land success screens:** when signed in and `shouldOfferSaveAddress`, show an unticked "Save this address to my account" checkbox. If it's ticked, call `addAddress`; a failure shows a silent inline note and never blocks the booking.
  - **Social (no property):** no change except contact reuse.
- [ ] **Step 4: Run tests and build.** Run: `npm run test:homegrown:returning-contact && npm run test:homegrown && npm run test:homegrown:sqft-bands && npm run build`. Expected: all pass, and the build succeeds.
- [ ] **Step 5: Commit.** `git commit -m "feat(account): use account profile and saved addresses in booking flow"` (add the new files).

---

### Task 8: Configuration, preview check and PR

**Files:**
- Modify: `README.md` (a "Customer accounts" section: environment variables, Supabase settings, how to run the RLS check)

Needs Supabase admin access and Vercel environment access (spec open items). If either is missing, stop at Step 1 and report what's blocked.

- [ ] **Step 1: Supabase dashboard.**
  - Email provider: turn on and set "Confirm email" on. Turn password sign-in and every social provider off.
  - Email OTP length is 6. Put the magic link and `{{ .Token }}` in the template. The sender comes from the agreed address.
  - Redirect URLs: the production domain `/account/login`, and `https://*-<team>.vercel.app/account/login`.
  - Apply `supabase/customer_accounts_schema.sql` in the SQL editor.
- [ ] **Step 2: Live RLS check.** Create two throwaway users, then run `npm run check:customer-accounts:rls` with their credentials. Expected: `RLS isolation checks passed`. Delete the throwaway users afterwards.
- [ ] **Step 3: Vercel environment variables** on the production project (whichever one owns the public domain; see handoff START-HERE) for Preview and Production: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- [ ] **Step 4: Run every automated check.** Run: `npm run test:homegrown:account && npm run test:homegrown:account-client && npm run test:homegrown:returning-contact && npm run test:homegrown && npm run test:homegrown:api && npm run build`. Expected: all pass.
- [ ] **Step 5: Manual check on a preview deployment.**
  - Sign in with `dean@homegrown.marketing`, using the code and also the magic link.
  - Only Dean's invoices appear, with badges matching GHL. "Pay now" appears only on payable invoices, and the GHL page opens. **Don't pay.**
  - A second test email sees none of Dean's invoices or addresses.
  - Guest booking is unchanged.
  - Signed-in booking: the account-details banner and the saved-address chips work, and the save-address opt-in adds a row.
  - The request `?email=` is ignored (check in DevTools).
- [ ] **Step 6: PR.** Push `dhruv/customer-login` and open a PR to `mujtahidsfl/homegrown-visuals` for Muj's approval. The body summarises the scope, the environment variables and Supabase settings, the manual check results, and states that no payment was made.
