# Client review system setup

The site already uses Supabase. The review schema is in `supabase/migrations/00039_client_reviews.sql` (renumbered to remove a migration-version collision). Apply the fresh migration set only after the schema review and security issues are resolved. The review table denies direct browser access; the Next.js server accesses it with the service role key.

Configure these server environment variables in the deployment environment:

- `SUPABASE_SERVICE_ROLE_KEY` — the Supabase service role key. Keep it server-only; do not use a `NEXT_PUBLIC_` prefix.
- `ADMIN_SESSION_SECRET` — a random secret of at least 32 characters used to sign the HttpOnly admin session cookie.

The browser uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. After setting the server variables, admins must sign in again to establish the signed session used by review management.

The Google review button is intentionally inactive until a verified URL is configured in `src/data/reviews.ts` as `GOOGLE_REVIEW_URL`.
