
  # Create Hero Section

  This is a code bundle for Create Hero Section. The original project is available at https://www.figma.com/design/WPODGoPTx17WVXExlZMq59/Create-Hero-Section.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  ## Customer accounts

  Customers can optionally log in with a one-time email code (Supabase Auth). Signed-in customers get an `/account` page listing their own GHL invoices, their saved details and saved property addresses, which the booking flow can reuse. Design: `docs/superpowers/specs/2026-11-06-customer-login-design.md`.

  **Environment variables** (Vercel Preview + Production; see `.env.example`):
  - Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. If unset, login links are hidden and guest booking works as before.
  - Server (`api/hgv-account.js`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, plus the existing `GHL_PIT` / `GHL_HOMEGROWN_API_TOKEN`.

  **Supabase settings:**
  - Authentication → Providers: Email on, with "Confirm email". Password sign-in and all social providers off.
  - Email template: include both the magic link and `{{ .Token }}` (6-digit code). Sender: the agreed Homegrown address.
  - URL configuration: add `<production domain>/account/login` and the Vercel preview pattern as redirect URLs.
  - SQL editor: run `supabase/customer_accounts_schema.sql` (safe to re-run).

  **Checks:**
  - `npm run test:homegrown:account` — invoice endpoint, GHL lookups, invoice mapping.
  - `npm run test:homegrown:account-client` — login redirect guard, invoices client, input limits.
  - `npm run check:customer-accounts:rls` — live check that one customer can't read or change another's rows. Needs `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` locally; creates and deletes two temporary users. Never put the service-role key in Vercel.
