# Homegrown Visuals Cutover

This runbook moves website booking intake, exact appointment matching, photographer ownership, and invoice creation away from the fragile Make booking chain. It does not remove unrelated Make scenarios.

## Current State

- Production website booking intake uses the idempotent orchestrator.
- The last verified production website commit is `3e8e1a1`; the October 19 repairs are prepared separately on `codex/homegrown-booking-repairs`.
- The migration branch was merged from `codex/hgv-orchestrator-migration`.
- All three replacement GHL workflows are published.
- Confirmed bookings create and email one itemized GHL invoice by default. Set `HGV_INVOICE_AUTOSEND_MODE=draft` only as an emergency pause for invoice delivery.
- The old broad appointment matcher and old automatic invoice webhook are unpublished.
- The five Make booking-intake scenarios remain available only for the rollback window and should receive no traffic from the current website bundle.
- Preview APIs and GHL Booking Jobs passed a guarded end-to-end test with no charge and cleanup.
- All eighteen website calendars were verified on September 1, 2026. The sixteen 60-360 minute calendars now use their labeled duration; the two 30-minute calendars remain at 30 minutes.
- The original pre-change calendar snapshot is stored at `../outputs/homegrown-calendar-backup-2026-09-01T16-10-47-250Z.json` for rollback.

## October 9, 2026 Follow-up

- The user specified that Dean must see every booking, including Brayden's shoots.
- Published request workflow `81104824-8502-4f36-b82c-27ac151251e7` version 8 and confirmation workflow `f47e1aff-9ba6-4782-bc5e-1045898d3b6b` version 69 copy `homegrownventuresllc@gmail.com` on their active internal emails. The exact opportunity owner remains the primary recipient. Both CC fields were verified after reload; no test messages were sent, so future execution and inbox placement still need verification.
- The dedicated sender `mg.homegrownvisualsmedia.com` is inactive and unverified. SPF, DKIM, CNAME and DMARC are verified in GHL; both MX records at host `mg` are missing. Required destinations are `mxa.mailgun.org` and `mxb.mailgun.org`, each priority 10. DNS is hosted by Wix. No DNS changes were made.
- Dean and Brayden have separate linked Google calendars with no visible connection warning. Actual Google events were not accessible for verification. Dean needs visibility of Brayden's work calendar; the user requested account-side instructions.
- The original audit reported 404 invoice links. The October 19 review found that its URL parser included closing square brackets from GHL message formatting. Treat those historical alarms as unconfirmed; the corrected check finds all five current unpaid payment links reachable. A synthetic appointment also referenced a deleted opportunity; customer records were not recreated.
- Pipeline confirmation and appointment status need separate review. A confirmation email does not prove that the calendar appointment status changed or that a Google event exists.
- Recovery and audit evidence are saved in `/Users/michaelmoughames2gmail.com/Documents/Codex/2026-10-09/i-x20/outputs/`.

## Live Make Inventory

Disable only these intake scenarios after the orchestrator cutover is stable:

- `4584900` - Real Estate | Standard Package
- `4584902` - Real Estate | Zillow Package
- `4587602` - Real Estate | Luxury Package
- `4726687` - Vacant Land Package
- `4726781` - Real Estate | 5500+ SQFT Contact us Form

Keep these active unless they receive a separate migration and test:

- Appointment Confirmed
- Appointment Cancelled
- Home Grown | Check for Payment Status
- Invoice Paid --> Update Opportunity Tag (invoicepaid)
- Main Page
- Social Media Package
- Footer/contact and other non-booking scenarios

## Replacement GHL Workflows

- `acfc1e5f-6cdf-4769-a6e1-72e48e647500` - `[MIGRATION] Appointment Intake - Exact Booking`
- `81104824-8502-4f36-b82c-27ac151251e7` - `[MIGRATION] Awaiting Confirmation - Exact Owner`
- `5c9de72d-4c42-4bb8-a926-04bb4fac6b0f` - `[MIGRATION] Draft Invoice - Exact Booking` (creates and emails the invoice; the historical workflow name is unchanged)

## Cutover Order

1. Completed: correct and verify the sixteen GHL calendar durations. Existing appointments were left unchanged.
2. Completed: add the server-side orchestrator variables to Vercel Production without adding `VITE_HGV_BOOKING_SUBMISSION_MODE` yet.
3. Completed: merge the migration branch to `main` and wait for a healthy production deployment while the website remains on Make.
4. Completed: run the guarded no-charge production API test and clean up every synthetic record and draft invoice.
5. Completed: verify the confirmed-booking workflow has valid client email/SMS and owner email/SMS actions and disable the blank-recipient action.
6. Completed: publish the exact appointment, exact-owner, and exact-invoice workflows and unpublish the two replaced broad workflows.
7. Completed: set Vercel Production `VITE_HGV_BOOKING_SUBMISSION_MODE=orchestrator` and redeploy.
8. Submit one controlled no-charge website booking, schedule it, verify exact opportunity ownership, notifications, and draft invoice, then clean up.
9. Leave the five Make intake scenarios active but dormant for one browser-cache window. Confirm they receive no new executions from the new bundle, then pause them. Do not delete them during the rollback window.
10. Run the health check and record the final evidence.

## Rollback

1. Remove or set Production `VITE_HGV_BOOKING_SUBMISSION_MODE=make`, then redeploy.
2. Unpublish the three migration workflows.
3. Republish the old broad appointment and old invoice-trigger workflows.
4. Ensure the five Make intake scenarios are active.
5. If calendar duration rollback is required, run the guarded calendar script with the backup file generated during apply.

## Acceptance Checks

- A repeat client creates exactly one new opportunity with the new address and booking ID.
- Scheduling updates only that opportunity and assigns its actual Dean/Brayden calendar owner.
- Luxury and restricted video services expose only Dean's calendar.
- Round-robin services respect both Dean and Brayden availability.
- The client receives booking-received and confirmed messages with date and times populated.
- The assigned photographer receives both request and confirmation notifications, and Dean is copied on both internal emails for every booking.
- Dean can view both photographers' bookings in Google Calendar after the work-calendar sharing setup is verified.
- Booking confirmation creates one itemized invoice containing the property address.
- Retrying website, appointment, or invoice requests does not duplicate records.
- Cancellation stops reminders without deleting the opportunity.
- No automatic payment or charge is enabled.

## October 19, 2026 repairs prepared for release

- Published `Social Media Inquiry - Acknowledgment` (`98a25833-5042-462c-89a9-74b92601efc9`, version 6). Its Opportunity Created trigger is limited to the Partnership & Retainer pipeline. It waits one minute for opportunity fields to settle, then checks whether the opportunity’s Special Requests field is exactly `Inquiry SMS follow-up: requested`. Only that branch contains the acknowledgment SMS; the None branch ends without a message. Re-entry and multiple opportunities are enabled. It uses the location’s existing default messaging number. Automatic enrollment and both consent branches were verified with an isolated contact that had no phone number: the opted-in branch reached SMS and skipped for No Phone number; the other branch ended without SMS. Real carrier delivery still needs an agreed test recipient.
- The website inquiry handler creates an idempotent GHL contact/opportunity and ledger entry. The SMS marker is generated server-side only for a literal `sms_consent: true`; customer message text cannot impersonate it. Nonconsenting inquiries are still recorded. The existing direct owner email, agency backup, and sheet copy remain after successful intake. No inquiry invoice or calendar appointment is created.
- The browser waits for a successful intake response before clearing the form. Temporary errors retain the entered details. Inquiry success uses inquiry-specific wording.
- Returning clients can explicitly reuse name, email, and phone stored on their device for 30 days. Property details, access codes, and SMS consent are excluded. The form offers a Forget control.
- A guarded live invoice test exposed indexed GHL Booking Job searches missing an accepted record. Lookups now fall back to exact property matching over paginated records. Appointment matching checks the complete contact set before resolving repeat-client jobs. Scans fail explicitly after 100 pages or a nonadvancing cursor.
- The live draft-only test passed after this repair: duplicate booking and invoice suppression, deleted synthetic opportunity recovery, itemized invoice, and property address. No charge was made. Synthetic test records were cleaned up. Google event creation and real inbox/carrier delivery remain unverified.
- Website edits require a reviewed release through the repository’s production deployment. The inquiry SMS workflow alone does not update the production website. Keep legacy Make intake available until the new website deployment has been verified and old browser traffic has drained.
- Wix sending-domain setup and Google calendar sharing remain account-side tasks. The separate dashboard is an independent sample-data foundation; live accounts and login are deferred by request.
