# AI and live support implementation

UI: the existing website chat button → **Connect to Human**. Agents use `/admin/dashboard` → **Support Inbox** → `/admin/support-inbox`. Only active `support_admin` and `super_admin` sessions can access the inbox. Generic `admin`, CRM Admin and Billing Admin gain no privileges. The current generic admin account must use the existing approved role-assignment process; no accounts were changed.

The widget replaces the legacy chatbot using existing buttons, inputs and website styling. History, human handoff, assignment and email status are persistent. Polling uses 3-second conversation and 8-second inbox intervals; an opted-in agent heartbeat expires after 45 seconds. Accept assigns the conversation to the signed-in agent; release allows reassignment. The assignee or a Super Admin can release/resolve; authorized agents can reopen an unassigned resolved conversation. AI stays paused after handoff, including on reopening. No leads are created or duplicated.

## Server configuration

Existing database/session configuration remains required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_SESSION_SECRET`. Never prefix private keys with `NEXT_PUBLIC_`.

| Variable | Purpose |
| --- | --- |
| `INTEGRATIONS_API_KEY` | Server-side key for the existing Gemini gateway used by `supabase/functions/chat-ai`. Set in the Next.js hosting environment; an Edge Function secret is not automatically available to Next.js. Without it, approved local service/FAQ replies and human handoff still work. |
| `RESEND_API_KEY` | Existing email provider, reused directly from the Next.js server. No SMTP transport or new runtime dependency was added. |
| `SUPPORT_EMAIL_FROM` | Verified sender; default `VedTech Services <support@vedtechservices.in>`. Verify this domain/sender in Resend. |
| `SUPPORT_EMAIL_TO` | Support recipient; default `info@vedtechservices.in`. Confirm this monitored mailbox before enabling. |
| `SUPPORT_SITE_ORIGIN` | Canonical secure inbox-link origin; default `https://vedtechservices.in`. Use your staging origin while testing staging email. |
| `SUPPORT_TRUST_PROXY` | Set `true` only if the hosting proxy overwrites `x-forwarded-for`. Otherwise start requests share a conservative global limit. No raw IP is persisted. |
| `CHAT_VERIFIED_PRICING` | Optional `true` only after an operator checks live `amc_plans` data, currency, duration and pricing approval. Seed prices are not treated as verified by default. |
| `VEDTECH_BUILD_DIR` | Optional separate Next.js output directory for local verification alongside a running dev server. |

Local environment files contained database/session variables, but no AI/email provider keys. Values were not printed or changed. Remote provider configuration was not inspected.

AI uses bounded persisted context, local service facts derived from `src/views/Services.tsx`, published knowledge-base excerpts and optionally approved database plan prices. The model selects source IDs; the server assembles the response from approved content, discarding invented source IDs and free-form generated claims. Unanswerable questions receive clarification/human-support guidance. Published knowledge-base content must be maintained as approved support material. No speculative repair steps, founding dates, hours, response guarantees or prices are generated.

## Database and reliability

Review and apply `00044_live_support.sql` through your normal migration process after existing migrations, including `00043`. Nothing was applied to a live database. `chat_sessions` is reused; normalized messages, expiring presence and distributed rate-limit buckets are added. Public tables/RPC access is revoked, RLS remains enabled, and server-only functions are granted to `service_role`. Custom signed application sessions are checked on each agent request and again by mutation functions. There is no tenant model in the existing application; support access follows its existing global support role boundary.

Visitor ownership is a 256-bit secret in an HttpOnly, SameSite Strict cookie (Secure in production); only its hash is stored. Tokens never appear in conversation links, URLs, email, or API responses. Cookie lifetime is 30 days; losing it loses visitor access. Each browser profile has one conversation. Legacy localStorage/UUID history remains in its original records but is not automatically trusted or imported into the new ownership system. The old session-token API and generic private-data access to `chat_sessions` are removed. The old `chat-ai` Edge Function source now requires service-role authorization; its deployed version must be updated or disabled during a future approved release.

Messages have UUID request IDs and atomic conversation locks. Retries preserve IDs, and conflicting duplicate bodies are rejected. Only the assigned agent can reply. Messages retain agent IDs and server-authored audit entries. AI completion commits only while its request still owns an AI-mode conversation. Rate limits, length limits, bounded history pages, cross-origin checks and safe error responses are enforced on the server. Visitor contact is explicitly supplied, unverified, used only for support and included in plain-text notification email after consent.

Email claims and immutable outbox payloads prevent concurrent/repeated notifications. Resend receives a stable idempotency key per conversation. A provider acceptance is shown as accepted, not guaranteed inbox delivery. Failures preserve the pending conversation and expose a retry action in both UIs. Crashed sends can be retried after a one-minute claim timeout with the same payload/key. Retries stop after 23 hours, before [Resend's documented 24-hour idempotency window](https://resend.com/docs/dashboard/emails/idempotency-keys); an uncertain status requires an operator to reconcile provider logs before any manual resend. Reopening uses the same conversation and does not create a second notification. Email is attempted synchronously on handoff; there is no background worker or delivery webhook. If nobody retries after a failed send, the request remains visible in the inbox without another email attempt.

Establish an approved retention schedule: remove expired presence and rate buckets older than a day, and delete resolved conversations/messages/contact/outbox payloads after your support retention period. Conversation deletion cascades messages. Retain audit records under the existing audit policy. These cleanup operations are intentionally not run automatically by this change. Configure provider quotas and perimeter bot protection before public launch; proxy trust and rate thresholds need traffic validation.

## Verification and release gate

Application tests: `node --test tests/*.test.mjs`. Types: `npx.cmd tsc --noEmit`. Production build: `npm.cmd run build`; use `$env:VEDTECH_BUILD_DIR='.next-support-build'` for isolation from local dev artifacts.

Database tests: `node tests/live-support-db.mjs`. This uses a temporary workspace-only `@electric-sql/pglite` PostgreSQL WASM runtime, not a production connection or application dependency. Install it with `npm.cmd install --prefix .tmp-support-db --no-save --package-lock=false --ignore-scripts @electric-sql/pglite`. The fixture creates the existing admin/activity definitions and migration 00036 in a disposable database, then executes migrations 00043/00044. It checks ownership, role rejection, message persistence, concurrent idempotent retries, AI/handoff races, atomic audit rollback, notification claims/failures/retries/expiry, rate limiting and denied public reads/RPC calls. This validates PostgreSQL behavior for the affected schema; it does not replace running the entire migration chain in a fresh Supabase staging instance.

Before an approved release: run the full migration chain on isolated Supabase staging; verify two browser profiles cannot read each other's chats; test two agents racing to accept and an agent disconnect/release; verify refresh/reconnect/mobile behavior; configure the gateway and Resend, check actual receipt and retry handling in a test mailbox, confirm the logged-in-only inbox email link, and exercise provider failures. These live service/browser checks require credentials and staging and remain unverified. Do not apply production migrations or deploy until they pass.

Recorded local results:

| Check | Result | Exit code |
| --- | --- | --- |
| Application tests | 132 passed, 0 failed | 0 |
| Isolated PostgreSQL affected-schema migrations/tests | 00043/00044 passed | 0 |
| TypeScript | Passed | 0 |
| Full production build, isolated output | Passed; lint warnings remain | 0 |
| Isolated production HTTP smoke | Homepage 200; protected APIs/legacy token 401; cross-origin mutation 403 | 0 |

The first build using shared `.next` output compiled but failed prerendering with a missing manifest/runtime module (exit 1). Separate `.next-support-build` output passed, including the final build and HTTP checks. Docker was unavailable; the database runtime was installed only under `.tmp-support-db` with no application dependency changes. No deployment, production migration, production data change or email send was performed.
