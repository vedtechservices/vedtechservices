# Support initialization diagnosis

Root cause: local Next.js configuration points to a remote Supabase database without migration `00044_live_support.sql`. Read-only checks authenticated successfully: the original `chat_sessions.id` query returned 200, but `owner_hash` was missing (PostgreSQL `42703`), `support_rate_limits` and `support_messages` were missing (`PGRST205`), and OpenAPI metadata contained none of `support_rate`, `support_mutate`, or `support_notification`.

Previously `start()` called the missing rate-limit RPC first; the error became an uninformative 503. A missing/invalid visitor cookie is normal on the first request and is not the cause. The database URL/service key are configured and authenticate. AI/email credentials are unrelated to this initialization failure. No raw keys, cookies, tokens, user records, or connection strings were logged.

Changes:

- `src/lib/liveSupport.ts`: read-only migration preflight before mutation; sanitized operation/error-code logging; actionable `SUPPORT_SCHEMA_REQUIRED` response; failed checks do not poison retry state. Successful checks are cached for 30 seconds.
- `app/api/chat/session/route.ts`: include the safe error code while preserving HTTP 503. Never manufacture a session or weaken ownership/rate limiting.
- `src/components/common/SupportConversation.tsx`: initialization must create/resume a persisted session and then verify the browser's ownership cookie through GET.
- `src/components/common/ChatBot.tsx`: explicit initialization/loading/retry states; disable input and handoff until conversation loading succeeds; retries remain available after connection errors; prevent concurrent initialization.
- `tests/support-initialization.test.mjs`: migration/configuration failures, recovery, ownership continuity, no writes on missing schema, blocked cookies, and safe response/logging tests. Existing isolated PostgreSQL tests cover messages, handoff, duplicate/concurrent requests, ownership and authorization.

Safe next step: configure an **isolated local/staging Supabase project** with the project's migration chain through 00044, then put that target's matching URL, publishable key and service-role key in `.env.local` and restart Next.js. Keep keys out of chat and source control. Do not mix keys from different projects. Review migration dependencies before applying the full chain; use [LIVE_SUPPORT.md](LIVE_SUPPORT.md) for provider setup and staging checks. No production migration or account/data change is authorized or was performed.

The currently configured remote project intentionally remains unmigrated and will continue to return a truthful 503. This code change cannot make that backend support conversations without its schema. No automatic migration, fallback database, in-memory session, or fake success was added. Docker's daemon is unavailable locally; PostgreSQL behavior is verified in the disposable PGlite test database instead of modifying the remote project.

Verified against the built local API (read-only preflight only):

```json
{"error":"Support setup is incomplete. Please use /support or /contact while it is configured.","code":"SUPPORT_SCHEMA_REQUIRED"}
```

HTTP status was 503, no cookie was issued, and the sanitized server log contained `operation=initialization_schema`, `backendCode=42703`, `category=schema_required`. No session/rate-limit mutation was attempted.

Validation: 139 tests passed (exit 0); migrations 00043/00044 and ownership/message/handoff/authorization checks passed in isolated PostgreSQL (exit 0); TypeScript passed (exit 0); full production build passed using isolated output (exit 0, lint warnings remain); built-API diagnostic reproduction passed (exit 0). Logs: `support-init-tests.log`, `support-init-db.log`, `support-init-types.log`, `support-init-build.log`. Real chat creation on the configured remote target remains blocked by its missing migration; live email/provider/staging verification remains pending.

## Reconfirmed regression diagnosis - 22 October 2026

The configured old path Vedtech_services is absent. Work continued in the relocated project at D:/Projects/New folder (2)/Traval_services, preserving the prior audit fixes. There is no Git repository, so no Git diff or verified last-working commit is available.

**The chatbot is NOT fixed end to end.** The current application requires the live-support schema from 00044, but its configured remote database does not expose that schema. Read-only checks performed today confirmed:

- Server-key zero-row SELECT on chat_sessions.id: HTTP 200.
- SELECT on chat_sessions.owner_hash,status: HTTP 400 / PostgreSQL 42703 (missing column).
- support_messages and support_rate_limits: HTTP 404 / PGRST205.
- Service-role OpenAPI metadata: support_rate, support_mutate and support_notification absent.
- Publishable-key zero-row read: HTTP 200. URL, publishable key and server key are configured and authenticate against that URL. This does not independently establish that it is the operator's intended project.
- INTEGRATIONS_API_KEY and RESEND_API_KEY are absent from the resolved local Next.js environment. Values were never printed. AI-key absence is separate from the initial schema failure; without it, the code uses approved static FAQ fallback rather than a real model call.

An isolated LOCAL DEVELOPMENT server reproduced the exact POST /api/chat/session body {"action":"start"}. Actual response: HTTP 503, code SUPPORT_SCHEMA_REQUIRED, original setup-incomplete message, no Set-Cookie. Sanitized server diagnostic: operation=initialization_schema, backendCode=42703, category=schema_required. Preflight stopped before rate/session mutations. An additional diagnostic-only network preload blocked external write requests; it did not mock any successful response or alter application source.

The saved older source under .verification/isolated-build uses chat_sessions.messages/session_token and the chat-ai Edge Function. The current widget/API use HttpOnly visitor ownership, normalized support_messages, rate limiting, and live-support RPCs from 00044. This is evidence of application/schema version drift, not evidence that the current ownership-based implementation previously worked against this exact database. Reverting to the legacy token API or enabling handoff without a verified session would not safely repair it. No application, environment, migration or role change was made in this investigation.

Connect to Human is correctly disabled because ready/usable require a verified persisted conversation. The UI is reporting the actual missing-schema condition; changing its message or manufacturing readiness would hide the failure.

Changes in this continuation: tests/support-initialization.test.mjs adds regression coverage showing authentication, permission and connection errors do not become setup-incomplete, and rate limiting remains HTTP 429. This document records the current evidence. Diagnostic scripts/logs are under .verification/chat-regression.

| Command | Result | Exit |
| --- | --- | --- |
| node .verification/support-schema-check.mjs | Read-only diagnosis completed; required remote schema is MISSING, not healthy | 0 |
| node .verification/chat-regression/config-check.mjs | Zero-row public-key check 200; configuration presence recorded as booleans | 0 |
| node .verification/chat-regression/reproduce-dev.mjs | Exact genuine development HTTP 503 and sanitized server error reproduced without writes | 0 |
| node --test tests/support-initialization.test.mjs tests/live-support.test.mjs | 39 passed, 0 failed/skipped | 0 |
| node tests/live-support-db.mjs | Disposable PostgreSQL: ownership, persistence, retries, role boundaries, handoff/AI race, email claims and RLS assertions passed | 0 |
| $env:VEDTECH_BUILD_DIR='.next-pagespeed-build'; npm.cmd run build | Complete production build; 112 generated pages; existing lint warnings remain | 0 |
| node node_modules/typescript/bin/tsc --noEmit | Passed after build | 0 |

No successful live session initialization, real AI response/follow-up, browser refresh/reopen persistence, or staging human handoff was verified. Existing automated tests use fixtures/disposable PostgreSQL; they are not substitutes for those end-to-end checks.

Required safe resolution:

1. Provide an approved isolated local/staging Supabase project, or the path to its existing private configuration file. Do not paste secrets into chat. An authorized staging operator must apply the complete migration chain through 00044, including 00043 in order, and verify the tables, service-role-only RPC grants and PostgREST schema cache. No production migration is authorized or was attempted.
2. Point local Next.js to that staging project's matching NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY; configure ADMIN_SESSION_SECRET as documented and restart the server. Merely changing the service key will not add the missing schema.
3. Configure the valid server-side INTEGRATIONS_API_KEY for the existing AI gateway. An Edge Function secret alone does not populate the Next.js server environment. Keep email credentials disabled for this requested no-email verification.
4. On staging, create a real test conversation, verify its HttpOnly ownership cookie with GET, send a benign test message, confirm the real gateway response and persisted reply, send a follow-up, and test refresh/close/reopen. Then exercise handoff/persistence with an approved support_admin/super_admin test account and a second visitor profile. Email should remain unsent; without a key its failed notification status must remain truthful.

Until those prerequisites are available, the only safe outcome is this confirmed diagnosis and blocked status. Production data/schema/settings, existing security controls, legacy records and unrelated source changes were preserved.
