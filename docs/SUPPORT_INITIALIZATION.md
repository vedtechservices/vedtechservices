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
