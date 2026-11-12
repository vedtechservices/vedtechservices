# Local FAQ and portfolio administration

Implemented locally on 4 November 2026. No deployment, push, production migration, real email or remote data mutation was performed.

## FAQ behavior

The branded floating FAQ uses src/lib/localFaq.ts. Edit companyFacts, suggestedQuestions and localAnswer to maintain approved answers. Answers are based on existing services pages and link to existing AMC, contact, support and portfolio pages. There are no generated answers, price estimates, live-agent claims or provider requests. The engine normalizes case, punctuation, accents, whitespace, Wi-Fi spelling and selected common typos. Unknown questions receive a safe fallback. Reset clears the in-memory transcript; reload also clears it. It retains at most about 100 messages.

The FAQ needs neither API keys, a server conversation nor Supabase after its JavaScript loads. This is not an offline install/PWA: initial page/assets still have to load. The separate /support ticket and /contact inquiry flows require server/database connectivity. FAQ history is never silently uploaded into these flows. Existing live-support APIs/inbox retain their ownership cookies, roles and database protections, but Gemini/gateway and Resend calls have been removed from their answer/notification path. Email notification retries are no longer offered in the inbox. Legacy schema identifiers such as ai_finish remain for compatibility, without an AI provider. Unrelated legacy edge functions and other website email systems were not changed or invoked.

## Admin workflow

Sign in with an existing active super_admin account and open /admin/portfolio, also linked from the admin dashboard. No roles are granted automatically. List/search projects, add or edit, select public showcases, manage featured/order, and confirm deletion. Fields include title, slug, description, image URL/path, category, technologies, project/demo URL and GitHub URL. The JSON metadata editor validates existing case study results, client, duration/year/rating, demo features, testimonials and display metadata. Canonical project fields take precedence over duplicated historical fields in metadata.

Mutations re-check the signed HttpOnly admin session and current stored role on the server. They require a matching Origin and JSON content type, reject cross-site requests and oversized payloads, validate UUIDs, schemas and HTTPS URLs, and constrain updates/deletions to portfolio_projects and one project ID. Browser storage is not used for authorization. Client text is rendered through React escaping. The dedicated table is not added to the generic private-data proxy. Anonymous/authenticated database roles have no direct table privileges.

Images use existing local raster paths or HTTPS URLs. No upload permissions or storage policies were expanded. Deleting a project retains images, which may be shared; no unrelated records/storage objects are deleted. Existing /demo links and page layouts remain. New projects without demo URLs do not open blank demo links. New case studies do not receive invented ratings.

## Persistence and required setup

Migration: supabase/migrations/00045_portfolio_projects.sql. REVIEW AND APPLY THROUGH THE NORMAL APPROVED DATABASE PROCESS before expecting saved admin CRUD to work. It was tested only against disposable in-memory PostgreSQL. Do not run against production without approval. Existing earlier migrations are prerequisites. Existing server settings NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_SESSION_SECRET are required for admin persistence/authentication; no credentials are included in this report.

The migration creates a separate service-role-only portfolio table and imports 23 unique projects: 6 case studies, 17 demos and 12 software showcase entries, merging shared project URLs. All original representations are retained under metadata. Slugs prevent duplicate seeds; existing rows are not overwritten. This is a one-time versioned migration, not a seed job to run after editorial deletions.

Public /portfolio, /demo and /services/software fetch saved projects without cache, on mount and window focus. Featured projects sort first, then display order and slug. During database failure, a visible status accompanies the last available showcase (initially the bundled historical snapshot). Consequently, an outage before live data loads can show historical projects, including ones subsequently edited/deleted. No source edit is required for normal saved updates. The original page SEO and project/demo URLs are retained; the demo title/count adjusts to loaded data. There are no pre-existing individual project detail routes to migrate.

## Verification

- node --test tests/*.test.mjs: 184 tests passed, including FAQ normalization, fallback/reset, provider-free behavior, portfolio CRUD/public reflection, role denial, CSRF and malicious URLs, nested metadata validation and preserved seed coverage.
- node tests/portfolio-db.mjs: passed; real disposable PostgreSQL migration, repeatable seed, CRUD persistence and public-role isolation.
- node tests/live-support-db.mjs: passed; existing ownership, role, retries, persistence and race protections.
- node tests/migration-chain.mjs: all migrations 00001–00045 and existing inquiry/support/role assertions passed in disposable PostgreSQL.
- TypeScript: standalone no-emit check and build type validation passed. A concurrent check initially collided with Next regenerating build types; verification is run sequentially after build.
- npm run lint: passed with warnings (including existing any, image, hook and unused-variable warnings). No broad lint cleanup was attempted.
- Isolated npm run build with VEDTECH_BUILD_DIR=.next-local-faq-portfolio: final production build passed; no deployment.

No real authenticated browser CRUD was run against the connected Supabase instance, and no visual browser QA is claimed. Remote infrastructure availability and application of the migration remain environment prerequisites.

## Files changed

FAQ/support:
- src/lib/localFaq.ts (new)
- src/lib/supportAI.ts
- src/lib/liveSupport.ts
- src/components/common/ChatBot.tsx
- src/components/common/SupportConversation.tsx
- src/views/Support.tsx
- src/views/SupportInbox.tsx

Portfolio:
- src/data/portfolio-seed.json (new)
- src/lib/portfolio.ts (new)
- src/hooks/use-projects.ts (new)
- app/api/portfolio/route.ts (new)
- app/api/admin/portfolio/route.ts (new)
- src/views/AdminPortfolio.tsx (new)
- src/views/Portfolio.tsx
- src/views/Demo.tsx
- src/views/SoftwareServices.tsx
- src/views/AdminDashboard.tsx
- src/routes.tsx
- supabase/migrations/00045_portfolio_projects.sql (new)

Verification/documentation:
- tests/live-support.test.mjs (provider-era expectations updated; security tests retained)
- tests/local-faq-portfolio.test.mjs (new)
- tests/portfolio-db.mjs (new)
- docs/LOCAL_FAQ_PORTFOLIO.md (this report)

Original touched files are backed up under .verification/local-faq-portfolio/originals. The supplied project folder contains no Git metadata, so no pre-existing Git diff was available. Existing files were inspected and edits were limited to these features. Environment files, lockfiles and unrelated application features were not edited. Build outputs remain isolated in .next-local-faq-portfolio; Next's added verification include in tsconfig.json is removed after verification.
