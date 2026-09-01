# Homegrown Visuals Cutover

This runbook moves website booking intake, exact appointment matching, photographer ownership, and invoice creation away from the fragile Make booking chain. It does not remove unrelated Make scenarios.

## Current State

- Production website booking intake uses the idempotent orchestrator.
- Production is deployed from `main` at `7c11967`.
- The migration branch was merged from `codex/hgv-orchestrator-migration`.
- All three replacement GHL workflows are published.
- The old broad appointment matcher and old automatic invoice webhook are unpublished.
- The five Make booking-intake scenarios remain available only for the rollback window and should receive no traffic from the current website bundle.
- Preview APIs and GHL Booking Jobs passed a guarded end-to-end test with no charge and cleanup.
- All eighteen website calendars were verified on September 1, 2026. The sixteen 60-360 minute calendars now use their labeled duration; the two 30-minute calendars remain at 30 minutes.
- The original pre-change calendar snapshot is stored at `../outputs/homegrown-calendar-backup-2026-09-01T16-10-47-250Z.json` for rollback.

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
- `5c9de72d-4c42-4bb8-a926-04bb4fac6b0f` - `[MIGRATION] Draft Invoice - Exact Booking`

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
- The assigned photographer receives both request and confirmation notifications.
- Booking confirmation creates one itemized invoice containing the property address.
- Retrying website, appointment, or invoice requests does not duplicate records.
- Cancellation stops reminders without deleting the opportunity.
- No automatic payment or charge is enabled.
