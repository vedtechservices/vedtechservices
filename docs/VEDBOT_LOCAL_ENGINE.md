> Current upgrade: see [VedBot support tickets](VEDBOT_SUPPORT_TICKETS.md) for the current engine, shared live project snapshot, confirmed ticket form, migration, verification and browser QA checklist. The notes below document the first local-only upgrade baseline.

# VedBot local conversation engine

Changed implementation: `src/lib/localFaq.ts`, `src/lib/businessKnowledge.ts`, `src/components/common/ChatBot.tsx`.
Tests: `tests/vedbot-conversation.test.mjs`; existing local FAQ and support module loaders updated to resolve the knowledge module and shared JSON.

Knowledge evidence:
- Services: Services, SoftwareServices, HardwareServices, NetworkingSolutions views.
- Company/locations: About view and CONTACT_INFO.md.
- Phone/email: Contact view (+91 7858971869, info@vedtechservices.in).
- Process and technologies: SoftwareServices view.
- Pricing: project quote required; published maintenance terms linked at /amc-plans. No fixed amounts or delivery promises are inferred.
- Portfolio: imports src/data/portfolio-seed.json, the same offline seed used by use-projects.ts. No duplicate project list. It does not retrieve live database edits. Refresh the shared seed when publishing updated local knowledge.

Discovery commands: skip, no/cancel, summary, reset, and “change industry to retail” (also service, features, budget, timeline). Fields stay in component memory and clear on reload. Briefs are requirements, not promises. No personal information is required. Recognizable email/phone/sensitive markers are filtered before transcript/field retention; users should omit other personal information too. No retention or submission outside component memory is implemented.

Conversation uses deterministic weighted phrase matching, explicit confidence/tie handling and bounded state. New topics stop pending discovery questions. Acknowledgements repeat the current unanswered prompt. Arbitrary language, complex corrections and full Hindi comprehension are outside its capabilities. Hindi/Hinglish support covers selected phrases only. Company objections without evidence use fallback.

The UI uses immediate local answers, safe allowlisted internal links, keyboard Escape/Enter, scroll-to-latest, editable/copyable brief, clipboard failure feedback and a reset confirmation. Existing inquiry/support APIs, authentication and database policies are unchanged.

Verification commands:
- node --test tests/live-support.test.mjs tests/local-faq-portfolio.test.mjs tests/vedbot-conversation.test.mjs
- npx.cmd tsc --noEmit
- ESLINT_USE_FLAT_CONFIG=false npx.cmd next lint
- VEDTECH_BUILD_DIR=.next-vedbot-build npm.cmd run build

Logs are in .verification/vedbot-*.log. No deployment, database mutation, commit or push was performed. Browser interaction and production integrations were not exercised.

Verified results: 69 tests passed; TypeScript passed; lint passed with warnings. Production build passed and generated all 112 pages. No browser end-to-end verification was performed.
