# Ved Tech audit verification ? 22 October 2026

Workspace: D:\Projects\New folder (2)\Traval_services. This is the relocated Ved Tech project. Existing fixes were retained. No deployment, hosted schema/data/provider changes, credential rotation, real email send, dependency installation, ZIP creation, or security-header change occurred.

**Status: local verification passed; the full project audit and release readiness remain incomplete.** The staging/provider and security items below remain open. There is no Git repository in this workspace; source review used the eight saved pre-audit copies in .verification/audit. A complete upstream diff/history cannot be reconstructed.

## Reviewed changes and confirmed corrections

| File | Root cause and resulting behavior |
| --- | --- |
| app/api/private-data/route.ts | Admin-only billing guard incorrectly blocked customer reads; verified customers can read their own invoices/AMC records, while billing writes stay restricted. Customer upserts are denied. Employee delete/upsert and arbitrary inserts are denied; part requests require an assigned repair and server-authored pending status. Email ownership comparisons escape SQL LIKE wildcards. Ticket feedback uses its UUID foreign key, checks ownership, and strips forged fields. Relation selectors obey role boundaries; quoted-selector bypass and credential-column alias leaks are blocked. RPC results are sanitized. Cross-origin mutations are rejected. |
| app/api/private-functions/route.ts | Support-provider operations now require support_admin/super_admin and same-origin requests, preserving separate billing/super-admin function permissions. |
| app/api/admin/session/route.ts | Raw backend login exceptions were exposed; responses now return a safe 503. Email/password lengths are bounded. |
| src/views/CustomerDashboard.tsx | Simulated payment marked renewal paid without confirmed payment. Removed that handler, delay, writes, client-secret logging, card/CVV fields and Stripe/success claims. Existing renewal dialog now links to /contact for billing. /admin/billing, invoice history and AMC display remain. Authenticated browser verification still requires an approved staging account. |
| supabase/functions/monitor-slas/index.ts | Authorization was inside an HTML helper referencing an unavailable request; moved before request-handler database/provider work. |
| supabase/functions/preview-sla-email/index.ts | Same misplaced authorization defect corrected at the handler boundary. |
| supabase/functions/sendgrid-webhook/index.ts | Previously read signature headers without verifying them. Verifies ECDSA/SHA-256 over timestamp + original bytes before database access; missing configuration fails closed. Database failures now return 503 and accurate processed/failed counts, rather than false success. |
| supabase/functions/supabase/functions/ai-kb-assistant/index.ts | Misplaced duplicate legacy webhook retired with 410; OPTIONS returns 204. The real top-level AI function remains. |
| tests/audit-regressions.test.mjs | Regressions cover billing ownership, employee restrictions, feedback ownership, cross-origin rejection, quoted/aliased selectors, safe login failures, support role matrices, SLA guards, real cryptographic signature validation, webhook persistence failure, retired endpoint, and absence of fake payment UI. |
| tests/migration-chain.mjs | Executes all 44 migrations in disposable PostgreSQL, inquiry SQL assertions and full-chain support/role-assignment workflows. |

Signature protocol reference: [SendGrid verification requirements](https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/getting-started-event-webhook-security-features). Provider signing/settings were not changed.

## Final commands and evidence

All commands ran from the workspace above. Logs are under .verification/audit.

| Command | Result | Exit | Log |
| --- | --- | ---: | --- |
| node --test tests/*.test.mjs | 165 passed; 0 failed/skipped | 0 | resumed-tests-final.log |
| node tests/migration-chain.mjs | 00001?00044 in order, inquiry persistence/retry/quota/rollback/RLS, full-chain support persistence/handoff/reply and audited role assignment | 0 | resumed-migrations-final.log |
| node tests/live-support-db.mjs | Ownership, rejected roles, idempotent retries, AI/handoff race, atomic audit rollback, email claims/retries/expiry, rate limits and public access denial | 0 | resumed-support-db.log |
| npm.cmd run lint | No errors; 587 warnings remain | 0 | final-lint.log |
| VEDTECH_BUILD_DIR=.next-pagespeed-build; npm.cmd run build | Complete build, 112 generated pages | 0 | final-build.log |
| node node_modules/typescript/bin/tsc --noEmit | Passed after build-type generation | 0 | final-types.log |
| node .verification/audit/runtime-smoke.mjs | 62 HTTP checks; 45 sitemap URLs; mobile search; chat initially deferred and closes/reopens; no browser page errors | 0 | runtime-smoke-verified-final.log |
| node .verification/audit/config-and-bundles.mjs | No configured private values found in 140 built client JS files | 0 | config-and-bundles.log |
| node .verification/tbt/lab.mjs final-mobile | Three mobile Lighthouse runs on the same final build | 0 | final-lighthouse.log |

PowerShell build syntax: $env:VEDTECH_BUILD_DIR='.next-pagespeed-build'; npm.cmd run build. The final compiled API artifact was also checked for the credential-selector correction.

Earlier verification failures are retained: three browser harness runs exited 1 because of DOM URL normalization, selecting the hidden desktop search trigger on mobile, and an element-list typo. Correcting the harness produced the exit-0 result above; application code was not altered to conceal these failures. Interim builds interrupted for final code changes and the earlier incomplete build-final.log are not counted as successful builds. The earlier completed resumed-build was followed by final-build after the last API correction.

Runtime server was bound to 127.0.0.1:3117 with database URL redirected to localhost and AI/email keys disabled. Browser chat responses were mocked 503 and review data mocked empty. This checks unavailable-service handling and interaction behavior, not successful provider delivery or authenticated billing/support UI. Canonical URL, sitemap and robots remained intact; routes, SEO generators and security headers were not edited.

## Migration and configuration limits

Disposable PGlite PostgreSQL used fixture auth/storage schemas and roles; no hosted Supabase connection was used. All migration SQL executed unmodified, including 00043 before 00044. The inquiry fixture rolls back its records; support fixture databases are discarded. This does not reproduce hosted Auth, Storage, Realtime, PostgREST schema cache or true multi-process contention. Promise-based concurrency checks on a single disposable database do not prove distributed concurrency safety.

Local presence check found database/session variables configured; AI gateway, Resend and SendGrid webhook verification keys absent. Only booleans were recorded. Hosted values, sender verification, SMTP, OAuth/OTP redirect allowlists and actual email receipt remain unverified. Previous reports identify a remotely configured project missing support schema 00044; that historical finding was not rechecked or repaired on the hosted project.

Deno is unavailable here. Changed Edge Functions were executed through local TypeScript/VM tests with mocked infrastructure and real Node cryptography; native Deno imports/runtime/deployment were not verified. Next production build excludes these functions.

## Mobile TBT evidence

Final build ID: TdVczm694HjwAWG-mgVs8. Lighthouse 13.5.0 mobile defaults with simulated throttling, sequential fresh browser runs, same local build and server configuration throughout. Reports, network logs and traces: .verification/tbt/final-mobile-{1,2,3}.*.

| Run | TBT ms | LCP ms | Estimated unused JS bytes |
| --- | ---: | ---: | ---: |
| 1 | 308.0 | 3139.6 | 33715 |
| 2 | 92.5 | 2072.9 | 33715 |
| 3 | 203.5 | 2103.7 | 33715 |
| Median | 203.5 | 2103.7 | 33715 |

Prior unchanged-build mobile runs were TBT 267.5/130/81 ms, LCP 2469.5/2065.6/2356.2 ms, unused JS 33703/33715/33715 bytes. An earlier CLI capture reported 2083.4 ms TBT; its process did not terminate and was interrupted, so it is not a completed CLI check. The older review's 3147 ms local and 2326.5 ms public values are single runs from different conditions. These are not a controlled causal before/after comparison. No TBT improvement is claimed and no homepage performance redesign was made.

Saved CPU profiling identifies webpack module loader t; React hook/component rendering l9, fiber traversal oq/ik; and Scheduler w. These are minified runtime names interpreted from their function bodies, not proven application-level hotspots. The slow trace also includes native layout (~166 ms) and paint (~119 ms) tasks. CPU samples and raw trace durations are not Lighthouse simulated TBT and must not be added together. Without source maps and repeatable task attribution, no additional application-specific TBT fix is justified. Chat was already interaction-loaded: profiling observed 0 initial chat requests, 1 on opening, additional chunks only after interaction, and no page errors. Completed chat changes were not repeated.

## Remaining blockers and next steps

1. Run isolated hosted-Supabase staging with the full migration chain; verify PostgREST schema exposure, real Auth/Storage/Realtime, two independent visitor profiles, two competing agents and approved customer/admin/employee accounts. Do not deploy or apply production migrations until approved and these checks pass.
2. Configure staging AI/email/SMTP and SendGrid signing through an authorized operator, then verify actual test-mailbox receipt, branded OTP validity/expiry, redirects, sender configuration, provider failures and retries. No real customer email was sent. Online payment/AMC renewal remains intentionally unavailable until server-verified payment confirmation/webhooks exist.
3. SendGrid event deduplication/replay control is unresolved. A valid captured signature can be replayed; a failed batch can cause already persisted events to be retried. Review a persistent sg_event_id uniqueness/retention migration and historical duplicates before enabling the webhook. Native Deno checks are also required.
4. Ordinary CRM CRUD and its audit insert remain separate operations; audit-insert errors can be ignored after a committed mutation. Use a reviewed transactional RPC/migration before claiming atomic CRM auditing. Audited role assignment itself passed atomic PostgreSQL tests.
5. Login endpoints lack a verified distributed brute-force limiter. Existing public review/ticket limits use process memory and caller-forwarded IP headers. Legacy direct public insert grants can bypass application-level limits/validation. Review perimeter limits, trusted proxy configuration and a compatible grant/migration rollout; do not weaken guards to make tests pass.
6. Employee repair UI still submits cost fields that the server deliberately denies, so repair-save UX needs a separately reviewed correction that retains billing boundaries. Authenticated role/navigation flows and the broader table-permission matrix are not exhaustively browser-verified.
7. Lint has 587 existing warnings. Mobile TBT/LCP remain variable and production field performance is unverified. Keep deployment blocked until the security/staging items above are resolved; this report does not certify full-project audit completion.
