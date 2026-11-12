# VedBot support tickets: implementation and verification

## Changed files

- `src/lib/localFaq.ts`: confidence scoring, extra typo/Hinglish/Hindi phrases, shorter repeat greetings, repeated-unknown recovery, contextual suggestions, service discovery/corrections and injection of current public projects.
- `src/hooks/use-projects.ts`: exposes the same raw project snapshot to VedBot that powers the existing showcase. Its existing same-origin public request refreshes current data; local seed remains the fallback. The deterministic answer engine performs no network/provider calls.
- `src/components/common/ChatBot.tsx`: support form entry, contextual prompts and clear separation of local FAQ/brief versus submitted requests.
- `src/lib/supportTicket.ts`, `src/components/common/SupportTicketForm.tsx`: shared validation, review, explicit consent, cancellation, submission lock, retry recovery, number copy, status reads and confirmation card.
- `src/lib/liveSupport.ts`, `app/api/chat/session/route.ts`: extend the existing cookie-owned session API with ticket submission and owned status lookup. Never accept a browser role, owner, target conversation or transcript for ticket creation.
- `app/api/admin/support/route.ts`, `src/views/SupportInbox.tsx`: existing authorized inbox gains number/category/priority/contact/created fields, ticket search and status/category/priority/assignment filters. Assignment, public conversation history, status transitions and sensitive-action audit use the existing support_mutate path. No internal-note storage is added or exposed.
- `supabase/migrations/00046_support_ticket_submission.sql`: additive ticket fields, sequence and atomic submission RPC on existing chat_sessions/support_messages. No parallel ticket table or endpoint.
- Tests: `support-ticket.test.mjs`, `support-ticket-db.mjs`, `support-ticket-http.mjs`; extended `vedbot-conversation.test.mjs`; adapted the isolated loader in `support-initialization.test.mjs` to support ordered session lookup.

## Why the old flow did not create these tickets

The chatbot was exclusively local and linked to a separate support page. Cookie-owned live support already persisted sessions, messages, ownership, roles, rate limiting and an admin inbox, but its handoff lacked a numbered/idempotent ticket submission. The legacy /api/support/tickets and support_tickets workflow serves the separate support page/Admin Tickets feature. It is preserved, not duplicated or migrated into the Support Inbox.

## Migration requirement and rollback

Migration 00046 depends on the existing schema through 00044 (normal migration order also includes 00045). It has NOT been applied to a remote/production database. Apply only through the normal reviewed migration workflow before using ticket submission. Missing schema/RPC returns safe 503 setup/unavailable feedback; FAQ answers continue locally without backend credentials.

The migration adds ticket_number (unique), ticket_request (unique idempotency UUID), category, medium default priority and creation timestamp to chat_sessions. It removes the unique owner_hash constraint, replacing it with an ordered owner index so one cookie can own multiple requests. All ownership reads now filter the hash and select the newest session or an explicitly owned ID/submission key/ticket number. Existing live sessions remain supported. Existing RLS/revocations and support role/audit behavior are retained.

Ticket allocation uses a restricted non-cycling PostgreSQL sequence. Format is VTS-YYYY-NNNNNN with the year taken in Asia/Kolkata. Counter is global, does not reset at year change, expands past six digits and may have gaps on rollback. PostgreSQL sequence allocation plus unique constraints protects concurrent numbering; an advisory transaction lock serializes each owner's submissions. Ticket creation, contact data, status and initial messages commit together. Conflicting reuse of an idempotency key is rejected. A failed unique-number write rolls back the transaction; retry advances the sequence.

Preferred rollback is to disable the ticket entry/submission action while retaining ticket data, columns, sequence and compatible cookie-scoped ordered lookup. Do not simply restore the old unique owner constraint: multiple sessions per owner may now exist. A destructive schema rollback needs an export/backup and an explicit archival/consolidation plan first; it would drop the view's appended fields, ticket RPC/helpers, ticket columns and sequence, then restore the former view. No destructive rollback was executed or automated.

## Privacy and recovery

Only category, issue description, contact name and email are submitted, following existing handoff policy. No phone is collected. Contact email is visitor-supplied and is not verified; authorization relies on the existing random HttpOnly, Secure-in-production, SameSite=Strict ownership cookie (30 days). Ticket number or email alone cannot retrieve these tickets. Saved status can be checked by number only with the matching cookie. No cross-device recovery or email delivery is added. Unknown/expired ownership requires official /contact or /support assistance.

Drafts/retry keys remain in component memory, never browser storage. Explicit consent precedes server storage. Closing hides and preserves a draft; Cancel draft clears unsent data. FAQ reset clears only local FAQ/brief state. A saved ticket remains saved. While submission is uncertain, fields are frozen, and retry reuses the exact key/payload. Recovery checks that exact submission key with cookie ownership; after reload, users must check the saved latest request before choosing an explicitly separate new request. No automatic submission on greeting, FAQ fallback, brief generation, reset or opening the form.

Only reviewed fields are sent: no FAQ transcript, generated project brief, browser-provided ownership, status or roles. Public support_messages history is explicitly selected. No internal-note source is queried. Text renders through React; navigation links remain allowlisted internal routes. No AI, external messaging or email integration is added. No secrets or conversation contents are logged.

## Verification and limits

Logs: `.verification/vedbot-ticket-{tests,db,types,lint,build,http}.log`.

- Unit/module tests cover deterministic language/context, injected project updates, fallback, privacy, validation, consent/review/cancel, retry/double-submit behavior, malformed confirmation responses, route ownership, rate failures, enumeration and admin search/role filters.
- Disposable in-memory PGlite tests execute actual migrations/RPCs: validation, queued concurrent uniqueness/retries, multiple owned requests, forced collisions, transaction rollback/recovery, India year boundary, >6 digit numbers, inbox data, assignment/status/audit, RLS/grant denial and rate limits. PGlite serializes commands; these tests do not simulate multi-connection lock contention or a deployed Supabase/PostgREST environment.
- Local production HTTP smoke tests avoid database credentials and check homepage availability, unauthorized status/admin access and cross-origin rejection.
- React form tests drive component events using a hook harness. They are not browser layout, screen-reader or authenticated end-to-end verification.
- Deterministic phrase matching supports selected Hindi/Hinglish phrases, not arbitrary language understanding. Project snapshot updates depend on the existing public route; offline use shows its shared seed. Existing legacy Support page/Admin Tickets behavior is unchanged.

## Manual browser QA checklist (disposable/local data only)

1. Desktop and narrow mobile: open VedBot, type greetings/typos/Hinglish, test Travel -> booking discovery -> pricing, change fields, skip, copy/edit brief and reset. Confirm FAQ still works with backend unavailable.
2. Open support form with keyboard; check focus containment, Escape/Close, scrolling, labels, validation, review/edit, consent and Cancel draft. Confirm no submission before the final button. Verify no FAQ transcript in request payload.
3. With a disposable migrated database: confirm a ticket, copy its number, refresh status, reload/reopen with the same cookie, create a separate second request and look up the first by number. Verify FAQ reset does not delete either ticket.
4. Interrupt the submission response, then retry/double-click: verify one ticket and stable number. Close/reopen an uncertain form; recover the exact submission. Reload after failure and check saved request before creating another.
5. Open another browser/profile or remove the ownership cookie. A known number/ID/key must not reveal status or messages. Check missing migration/backend/429 feedback without false success.
6. Sign in as support_admin/super_admin: find ticket by number, use all filters, inspect contact/category/priority/date/history, accept, reply, release, resolve and reopen. Verify another assigned agent cannot take over without existing permissions. Check activity log entries.
7. As generic/billing/full-access admin and anonymous visitor: inbox endpoints remain denied. Ensure no internal notes are present in customer responses. Check screen-reader announcements and clipboard fallback manually.

No production data changes, migration application, deployment, email, commit or push are part of this work.

Final automated results: 93 module/component-event tests passed; new ticket and existing live-support disposable PostgreSQL suites passed; TypeScript passed; lint passed with warnings; production build passed (112 pages); credential-free local production HTTP smoke checks passed. Authenticated browser end-to-end behavior and multi-connection database contention remain unverified.
