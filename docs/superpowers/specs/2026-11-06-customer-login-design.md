# Customer Login and Invoice Portal — Design

Date: 2026-11-06
Owner: Dhruv (technical owner). Release approver: Muj.

## Purpose

Dean asked for repeat customers to log in so their details are saved, and for a logged-in section that lists the customer's own invoices (handoff: `LATEST-DEAN-REQUESTS.txt` HGV 06; `DEAN-CONFIRMATIONS-2026-10-29.txt` §4). Invoices already carry the booking details, so there is no separate booking-history screen.

This is the customer portal only. Dean's staff management dashboard is a separate project with its own login and must not be reused for customers.

## Requirements

1. Customers sign in with a one-time email code or magic link. No passwords.
2. Login is optional. Guest booking keeps working unchanged.
3. A signed-in customer sees only their own invoices. Authorization is enforced on the server, using the verified sign-in email. An email address or contact ID sent by the browser is never trusted.
4. Pay action only when the invoice is payable. Void invoices are never made payable. Draft invoices are not shown.
5. The saved profile holds exactly these fields: full name, phone (editable), email (read-only, from the verified login), and saved property addresses.
6. Saved addresses are offered as a one-tap choice in the booking flow. They are never filled in automatically, so every booking still starts with fresh property details (the PR 13 rule).
7. Account recovery: signing in with the email code is also how a customer recovers access.
8. Handle these cases: no invoices; paid, unpaid and void invoices; GHL being unavailable.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth provider | Supabase Auth, email OTP only | Muj's suggestion; the site already has a Supabase project; built-in recovery; verifies the email used for GHL matching |
| Profile storage | Supabase tables with RLS | Browser reads and writes its own rows directly; no server code needed for the profile |
| Invoice source | Live from GHL through a Vercel function | Always current; GHL token stays on the server; no copied data |
| Contact matching | Verified login email → GHL contact(s) | Matching by name or phone would let people see each other's invoices |
| Login requirement | Optional | No added step for first-time customers |

Rejected: storing the profile on GHL contact fields (multiple addresses are awkward and every edit writes to the live CRM); GHL's built-in client portal (sits outside the site, can't fill in the booking form, less control over what customers see).

## Architecture

### Browser (existing Vite + React site)

- New dependency `@supabase/supabase-js`, set up from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the only values exposed to the browser).
- `src/app/account/supabaseClient.ts` — the single client instance.
- `src/app/account/useCustomerSession.ts` — tracks the session, handles sign-in and sign-out.
- `src/app/account/profileApi.ts` — profile and address read/write through Supabase (RLS-scoped).
- `src/app/account/invoicesApi.ts` — calls `GET /api/hgv-account` with the session's access token.
- New routes in `src/app/routes.ts`: `account/login`, `account`.
- Header: "Log in" for guests, "My account" (with a "Sign out" menu) for signed-in customers.
- Booking flow: reads the session only. When signed in, it fills in name, email and phone and shows saved-address chips. Guests keep the existing `returningContact.ts` on-device reuse.

### Supabase (existing project)

- Auth: email OTP turned on; password and social providers turned off. Redirect URLs cover the production domain and Vercel previews.
- Migration `supabase/customer_accounts_schema.sql`:

```sql
create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  address text not null check (length(trim(address)) > 0),
  created_at timestamptz not null default timezone('utc', now())
);
create index customer_addresses_user_idx on public.customer_addresses(user_id);

alter table public.customer_profiles enable row level security;
alter table public.customer_addresses enable row level security;

create policy "own profile" on public.customer_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own addresses" on public.customer_addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

The booking flow stores a property as one autocompleted string (`realEstateProperty.address`, `landProperty.address` in `ServicesBookingFlow.tsx`), so a saved address is the same single string plus an optional label.

### Vercel function `api/hgv-account.js` (GET, invoices only)

1. Read `Authorization: Bearer <access token>`. If it's missing, return 401.
2. Verify the token with Supabase (`auth.getUser(token)` using server-side `SUPABASE_URL` + `SUPABASE_ANON_KEY`). If it's invalid or expired, return 401. Ignore any email or contact ID in the query string or body.
3. Take the verified `email` from the token. If it isn't present or confirmed, return 401.
4. Look up the GHL contact(s) with exactly that email through `createGhlClient` (`api/_hgv/ghl.js`), which uses the server token.
5. For each matched contact, list invoices filtered by `contactId`. Leave out drafts. Sort newest first.
6. Return only the following, per invoice:
   `{ number, issueDate, dueDate, total, amountDue, currency, status, summary, payUrl? }`
   - `status` is normalized to `unpaid | partially_paid | overdue | paid | void`.
   - `payUrl` is present only for `unpaid | partially_paid | overdue`.
   - `summary` is a short service description built from the line item names.
7. GHL calls time out after 8 s and return `503 { error: "invoices_unavailable" }`.
8. Logs contain no amounts, addresses, names or emails. They hold only the error class and the request ID.

## What customers see

- **`/account/login`**: an email field, then "Send code". Next comes a 6-digit code field with "Resend" (Supabase's rate limit applies). The magic link in the same email signs them in directly. After sign-in they go back to the page they came from (for example the booking flow), or to `/account` by default. Signing in for the first time creates the account.
- **`/account`**:
  1. *Invoices*: number, date, summary, total and a status badge.
     - Unpaid, partly paid or overdue: amount due and a **Pay now** button (opens the GHL payment page in a new tab).
     - Paid: badge only.
     - Void: a "Cancelled" badge and a note to contact Homegrown if they think it's wrong.
  2. *My details*: name and phone editable, email read-only.
  3. *Saved addresses*: add, edit, delete.
- **Booking flow, signed in**: contact fields filled in; "Use a saved address" chips on the property step; after the booking, an opt-in "Save this address?" checkbox.

## Errors and edge cases

| Case | Behaviour |
|---|---|
| No GHL contact or no invoices | "No invoices yet. If you booked with a different email, contact us at …" |
| GHL unavailable or timed out | Invoices section shows "Couldn't load invoices — try again". Profile and addresses still work. |
| Session expired | Redirect to `/account/login`, then back to the page |
| Wrong or expired code | Inline error and a resend option |
| Email matches several GHL contacts | All their invoices are listed together |
| Booked under a different email | Not shown, on purpose. The page links to support. |

## Testing

- `scripts/test-homegrown-account.mjs` (`npm run test:homegrown:account`), with stand-in Supabase and GHL calls:
  - Missing or invalid token gets a 401.
  - An email or contact ID in the request is ignored.
  - Only the matched contact's invoices are returned.
  - `payUrl` appears only for payable statuses; void, paid and draft invoices never get one.
  - Drafts are left out.
  - The response holds only the agreed fields.
  - A GHL timeout returns 503.
- Extend `scripts/test-homegrown-returning-contact.mjs`:
  - Profile filling works.
  - Picking a saved address fills the fields; the property step stays blank otherwise.
  - The guest path is unchanged.
- An RLS check script: user A cannot read or write user B's profile or addresses.
- Manual check on a preview deployment:
  - Sign in with Dean's agreed test email (`dean@homegrown.marketing`); only his invoices appear, with the correct badges and buttons.
  - A second test email can't see the first one's data.
  - No real payment is made: "Pay now" is only checked to open the GHL page.

## Rollout

1. Supabase:
   - Turn on email OTP and set redirect URLs.
   - Agree the email template and sender (ideally `info@homegrown.marketing` once it's verified).
   - Apply the migration.
2. Vercel environment variables for the production project: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
3. Open a PR to `mujtahidsfl/homegrown-visuals`; Muj approves the release.
4. After release: one controlled production sign-in with Dean's test email.

## Out of scope

- The staff dashboard and staff login.
- Booking history beyond invoices.
- Changing, resending or un-voiding invoices.
- Real payment tests (agreed separately).
- Showing invoices booked under a different email.

## Open items (needed from Muj or Dean)

- Admin access to the existing Supabase project.
- The sender address for login emails.
