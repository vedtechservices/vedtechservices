# Production fixes: verified status — 19 October 2026

## Latest results

- `node --test tests/contact.test.mjs tests/auth-amc.test.mjs`: **21 passed, 0 failed** (mocked API/handler tests).
- `node node_modules/typescript/bin/tsc --noEmit`: **exit 0**, including the latest rate-limit/validation changes.
- Existing PostgreSQL **18.6** was found at `C:/Program Files/PostgreSQL/18/bin`; nothing was installed. A fresh cluster in `.verification/pg-local`, bound only to `127.0.0.1:55439`, ran migration **00042** and `tests/inquiry-db.sql`: **exit 0**. The cluster was shut down successfully afterward.
- Database test used the exact lead/contact table definitions from 00018/00040, lead constraints from 00030, and equivalent hardened grants/RLS from 00041. AMC was stubbed only for its database privilege check; actual AMC API authorization is covered by mocked route tests. This was a targeted PostgreSQL fixture, not a complete hosted Supabase clone.
- SQL test passed: new inbox/CRM persistence, same-ID retries, preservation of existing lead details/status/notes, forced lead-failure rollback, 10/hour email quota, accepted retries at quota, rejection/rollback of an 11th submission, RLS enabled, and anonymous/authenticated privilege denial. Truly simultaneous database submissions remain untested. Their additional test was blocked by an approval-review service usage limit and was not executed.
- Production data, hosted configuration, emails and deployments were not changed. No live end-to-end success is claimed.

## Build diagnosis

Process metadata identified an active project `next dev` process and its server, not a stale production build. They were left running. The previous builds shared `.next` with this dev server; output contention is possible but unproven. Old build trace shows module/minification work, not an emitted compiler error.

A separate source copy at `.verification/isolated-build` reused existing dependencies without reinstalling them and wrote its own `.next`. Node v24.20.0, 8 CPUs, 7920 MiB total RAM, 402 MiB initially free. Command: `node node_modules/next/dist/bin/next build` (resolved existing executable, isolated working directory). **Compiled successfully in 2.2 minutes**, then reached lint/type checking. The **180-second watchdog terminated the project-owned build tree successfully**: elapsed 181 seconds, child exit **1**, runner exit **124**. Full build success is NOT verified. The extra-lockfile/workspace-root warning came from the isolated copy; no compiler diagnostic was emitted.

Current host checks found only about 343–757 MiB free. Earlier runs recorded paging/OOM errors, but RAM is not a confirmed sole cause. The new evidence demonstrates progress and a timeout that expires after compilation. An adequately resourced independent build environment/CI is not connected here. Do not keep repeating short builds on this host or kill unrelated processes. Next safe build check: clean CI checkout, existing lockfile, compatible Node version, adequate available memory, no concurrent dev/build output, `npm run build` with a 10-minute ceiling; retain actual exit code/logs. Only exit 0 verifies the build. The 180-second retry did not test a resourced environment.

## Code/security review

Contact API accepts only name/email/phone/service/message/requestId for database writes. It rejects malformed/non-object JSON, incorrect field types, overlong fields and invalid email/UUID; returns 400/413/429/503 accurately and generic database errors. Public submissions intentionally require no customer/admin login. The service key stays server-side; client-supplied status/admin_notes/roles are ignored. The 16 KiB check occurs after reading the body, so edge request-size/abuse protection remains relevant.

00042 now enforces **10 accepted inquiries per normalized email per rolling hour**, using a transaction advisory lock and an `(email, created_at)` index. Retrying an accepted UUID does not consume quota. Rate-limit failure rolls back both writes; API returns 429 with Retry-After 3600. This is not a per-IP/global limiter: attackers can rotate or spoof email addresses. Add edge protection before production exposure.

Migration adds nullable request_id/indexes and a SECURITY INVOKER, service_role-only RPC. It keeps RLS policies enabled, revokes direct contact INSERT from PUBLIC/anon/authenticated, and broadens no admin permissions. New inquiries create leads; exact-match existing emails append notes without overwriting identity, status, assignment or existing notes. Inserted fields have no foreign keys; existing score/deal defaults satisfy checks. SQL syntax and rollback behavior were executed successfully on PostgreSQL 18. Existing data is not deleted or backfilled. Email uniqueness is case-sensitive; legacy mixed-case records require separately reviewed reconciliation.

Frontend prevents concurrent clicks, preserves retry UUID for unchanged data and replaces it after edits. CRM reads permit the schema-defined full_access_admin plus support/super-admin; AMC RPC remains billing/super-admin only. LocalStorage is a UI hint, not server authorization. Existing AMC notification races across tabs/remounts remain outside these targeted fixes.

## Manual production checklist — NOT applied

### Supabase

1. Confirm the production project matches the app URL and publishable/server credentials. Local required variable names are set, but hosted values are inaccessible. The server credential is an opaque Supabase secret, so JWT decoding cannot establish its role/project.
2. Authentication ? URL Configuration: **Site URL `https://vedtechservices.in`**; allow exact redirect **`https://vedtechservices.in/dashboard`**. Remove localhost/development URLs from this production project. The code explicitly supplies that production redirect. See [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
3. Authentication ? Email Templates: apply `supabase/templates/client-otp.html` to **Magic Link** and **Confirm Signup**; subject **Your VedTech Services sign-in code**. Preserve `{{ .Token }}` for the UI's email-code verification. This template intentionally has no magic-link button. Check no custom template still embeds localhost. See [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates).
4. Authentication ? SMTP settings: enable custom SMTP; enter provider host, port, username/password; use a provider-verified sender address and sender name **VedTech Services**. Configure provider-required SPF/DKIM and DMARC appropriately; verify sending limits and Auth rate limits. Keep credentials in dashboard/server configuration. Supabase's default sender is restricted and not intended for production. See [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
5. Validate 00018, 00030, 00040 and 00041 prerequisites and actual constraints/grants against production read-only. Review index size/lock budget and backup availability. Run 00042 and the integration test in a disposable Supabase staging project first; add simultaneous-request tests. Never execute the test trigger on production.
6. Rollout needs coordination: 00042 revokes direct inserts used by older Contact clients. Arrange a brief submission-maintenance window or an explicitly reviewed two-phase rollout; do not blindly apply it ahead of compatible application code. Apply the validated migration only after authorization, confirm PostgREST schema cache exposes the new RPC, deploy the compatible app only after authorization, then test controlled submissions/CRM visibility. Do not undo the server-only permissions to work around a deployment mismatch.
7. Test a controlled existing customer: receive branded code, verify valid code, reject expired/invalid code, confirm dashboard identity and production URLs. Neither delivery nor branding is verified by the repository template alone.

### Vercel

1. Project Settings ? Environment Variables ? **Production**: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET` (32+ characters). Public/server credentials must belong to the same intended project. Only the first two may be browser-exposed. Do not print values. Configure Preview separately for staging.
2. Build & Development Settings: correct repository/root directory, **Next.js** preset, build command **`npm run build`**, default Next output directory, supported Node version consistent with CI. No `.vercel/project.json`/Git metadata exists in this workspace to verify hosted linkage or baseline diff.
3. Domains: verify `vedtechservices.in` resolves to this project, valid TLS, and the chosen canonical hostname. Keep the redirect allowlist aligned with actual browser URLs.
4. Firewall ? Configure ? Custom Rule: scope to path **`/api/contact`**, method **POST**; review traffic in log mode, then configure per-client-IP rate limiting with a 429 response at a threshold tested against legitimate shared-network traffic. Confirm plan support. Do not trust a browser-supplied IP header as the limiter identity. Database per-email limiting does not replace this. See [WAF rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules).
5. Environment changes apply to new deployments, not existing ones. Redeploy only when authorized, after successful CI/staging and coordinated migration rollout. See [environment variables](https://vercel.com/docs/environment-variables).

## Remaining blockers / scope

No successful production build, no connected adequately resourced build runner, no hosted dashboard inspection, no live persistence/OTP verification, and no simultaneous database test. Updated code is limited to contact validation/rate-limit handling, 00042 and essential tests; report and ignored `.verification` artifacts record evidence. No Home.tsx edit, unrelated refactor, dependency installation, production migration or deployment occurred in this continuation. Exact upstream diff remains unavailable without Git metadata.

## CRM authorization correction — latest continuation

Root cause: migration 00018 can_manage_crm explicitly recognizes full_access_admin, but the protected API grouped CRM tables under a support-only guard. CRMDashboard reads customers/customer_segments; LeadManagement reads leads and uses crmOperation for CRUD. Neither page calls an RPC for these failing loads. Their signed-cookie requests reach /api/private-data through ProtectedQuery; the 403 originated in its role guard, not Supabase RLS or an absent session.

Changed app/api/private-data/route.ts: permit super_admin, support_admin and the schema-defined full_access_admin for CRM tables, while retaining distinct support/billing/super-admin guards. full_access_admin is NOT aliased to super_admin and cannot invoke check_expiring_amcs or support-only RPCs. No database policies, grants, stored roles or frontend identity were changed. Generic admin and unknown roles remain denied; if the affected account actually has that role, an authorized super-admin must deliberately assign the appropriate existing role. The affected browser/account was not inspected.

Changed src/lib/reviewServer.ts: reject trailing token segments and invalid signed payload ID/expiry types. Fresh admin_users role/is_active lookup remains authoritative, so role changes, disabled/deleted accounts and forged cookie-role claims do not elevate access.

Tests: tests/crm-authorization.test.mjs adds CRM CRUD role matrices, billing/support/super permission separation, real HMAC session parsing, role refresh, disabled/deleted accounts, expired/malformed/tampered sessions and rejection before data dispatch. tests/auth-amc.test.mjs now transpiles to the actual project's ES2020 target so Set iteration in tested route code matches production. Existing AMC tests retain billing-only checks, one-request guarding and error reporting. No production or schema changes were made.

Latest CRM verification: 96 tests passed (node --test --test-reporter=dot tests/contact.test.mjs tests/auth-amc.test.mjs tests/crm-authorization.test.mjs), combined command exit 0; TypeScript --noEmit exit 0. Browser/account-specific verification remains pending.


## Confirmed remaining CRM cause — current account

The user supplied the signed-in local `/api/admin/session` result: authenticated=true, admin.role=admin. This endpoint obtains the role through currentAdmin's fresh admin_users lookup after verifying the signed cookie. The current failure is therefore the stored role assignment, not invalid-session parsing or loss of full_access_admin mapping. No account identity, token or credentials need to be recorded here.

CRMDashboard's first load reads customers, then customer_segments. LeadManagement reads leads; its create/update/delete requests use the same protected API via crmOperation. For the confirmed admin role, the shared CRM guard rejects these operations with 403 before database dispatch. The exact browser interaction/network request was not captured, but each of these operations is denied by the same verified role decision. Invalid sessions produce 401 instead. full_access_admin remains allowed for CRM and denied for billing/support-only operations.

Small follow-up changes:
- Private-data denials include CRM_ROLE_REQUIRED, the current stored role, the table/action and explicit super-admin-assignment guidance. No permission set was broadened.
- CRM dashboard/lead read errors display the actual server message instead of only a generic loading failure.
- Admin Management's existing add/edit role selectors now include CRM Admin (full_access_admin), which was previously missing. Defaults and stored accounts remain unchanged. The API still permits role assignment only by a signed-in super_admin; generic admin cannot promote itself.
- Tests cover signed-session -> session endpoint -> CRM read/write decisions for stored full_access_admin/admin, conflicting cookie/body role claims, invalid-session reads/writes, and super-admin-only assignment. Existing billing/AMC restriction tests remain.

Required action: an authorized super-admin must explicitly assign full_access_admin to the intended account if CRM access is approved. This role is defined by migration 00018 can_manage_crm; it is not a super-admin alias and must not be replaced with billing_admin or support_admin merely to bypass a denial. No role assignment, account mutation, deployment or production-data change was performed. End-to-end CRM loading remains intentionally blocked for the current generic admin account until that authorized assignment.

Verification for this follow-up: 99 mocked/API/session regression tests passed, exit 0; TypeScript --noEmit passed, exit 0. The current account remains admin and was not modified.

