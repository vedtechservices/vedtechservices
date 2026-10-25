# Local PageSpeed review — 21 October 2026

No deployment or ZIP was created. This folder has no Git repository, so an original change diff/history was unavailable. Existing optimizations were inspected in place and retained: lazy route imports, responsive Next images, server metadata/structured data, and already named review/chat controls. No original Lighthouse report file or report-specific URL was supplied; the reported 820 ms TBT and approximately 213 KiB unused JS are historical reference figures, not a reproduced baseline.

## Measurements

Fresh Lighthouse 13.5.0 mobile navigation runs against the public homepage and the final local production build:

| Check | Public homepage | Local production |
| --- | ---: | ---: |
| Performance | 58 | 61 |
| Accessibility | 83 | 92 |
| Best practices | 96 | 100 |
| SEO | 100 | 100 |
| LCP | 3850.303 ms | 3315.086 ms |
| TBT | 2326.5 ms | 3147 ms |
| Estimated unused JS | 211947 bytes (~207 KiB) | 33715 bytes (~33 KiB) |
| Long tasks | 12 | 11 |
| Button names | Fail: 1 | Pass |
| Link names | Fail: 2 | Pass |
| Image aspect ratios | Fail: header logo | Pass |

Artifacts: `pagespeed-live-mobile.json` and `pagespeed-local-mobile.json` at the project root. Live run: 2026-10-21 01:43 IST; local run: 01:45 IST. These are single lab runs against different hosts, with simulated mobile throttling; they do not prove deployment gains or isolate the effects of this session's changes. The public run warned of slower-than-expected host CPU. The original 820 ms result was not reproduced. The first local audit failed with `NO_NAVSTART`; the successful retry replaced its JSON. The server was restarted with network access after initial remote-image requests failed with EACCES.

## Findings and changes

- LCP: the hero text is present in production HTML; mobile hero device images are already hidden and have responsive sizes. The local LCP element is the hero description paragraph. LCP remains above 2.5 seconds; no additional hero preload was added without image-LCP evidence.
- JavaScript: existing lazy routes already separate administrative/CRM screens. Added an interaction-loaded chat module so the public page initially renders only its launcher. Support code remains mounted after activation to preserve close/reopen behavior. Build-reported homepage first-load JS is 180 kB, shared JS 105 kB; these are build figures, distinct from Lighthouse unused-byte estimates.
- TBT and long tasks: **not resolved**. Local audit found React/runtime tasks of 1834 ms and 705 ms, and a webpack task of ~459 ms. Main-thread breakdown included ~3234 ms script evaluation and ~2476 ms style/layout. Route splitting and chat deferral do not establish that the 820 ms target is met. Further profiling of hydration, the long homepage DOM, and animated/blurred visual effects is needed before selecting further changes.
- Accessibility: named the mobile search trigger, three mobile theme buttons, and Facebook/Twitter links. Already named review and chat controls were retained. Lighthouse confirms button/link-name passes on the default mobile homepage. Existing color contrast failures remain (10 audit items).
- Logo: source is 905 × 1012. Both logo components now declare the real intrinsic dimensions; the header uses `object-contain` within its existing footprint. Local Lighthouse confirms the aspect-ratio audit passes.
- Security: added `Content-Security-Policy: frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`, and `Cross-Origin-Opener-Policy: same-origin-allow-popups` globally through Next headers. These were verified in local HTTP responses. The CSP deliberately leaves script, style, connection, form, and child-frame sources unrestricted; it is frame protection, **not a strict XSS policy**. Popup-compatible COOP is less isolating than `same-origin`. External sites can no longer frame these pages; any intentional embedding/hosting preview requires review. No HSTS, COEP, script nonces, or source allowlists were added.

Header references: [MDN frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors), [MDN COOP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy).

## Validation

- `npm.cmd run lint`: exit 0, 589 warnings, no errors. Warnings include existing explicit-any, unused variables, hook dependencies, unescaped entities, and image/link guidance. Not a warning-free result.
- `npx.cmd tsc --noEmit`: exit 0, no diagnostics.
- `$env:VEDTECH_BUILD_DIR='.next-pagespeed-build'; npm.cmd run build`: final build exit 0, 112 generated pages. Build lint also emitted warnings. The isolated output directory preserves the existing development output.
- `node --test tests/support-initialization.test.mjs tests/live-support.test.mjs`: exit 0, 37 passed, 0 failed/skipped.
- HTTP smoke checks: `/`, `/contact`, `/services/web-development`, `/locations/delhi`, `/robots.txt`, `/sitemap.xml` returned 200 with all three new headers. Final HTML contains the named search trigger and chat launcher, original SEO title, and canonical `https://vedtechservices.in`. Robots directives and its sitemap URL are intact; sitemap contains 45 URLs. SEO generators, canonical definitions, routes, sitemap and robots source files were not edited.
- Headless Chrome mobile smoke: zero chat requests before interaction; one mocked request upon first opening; chat opens, closes, reopens; named mobile theme buttons appear; no JavaScript page errors. Chat endpoint returned a mocked 503, avoiding real support records. This verifies lazy loading and error/reopen behavior, not successful live support delivery. See `pagespeed-browser-results.json` and `pagespeed-http-results.json`.
- Both successful Lighthouse commands exited 0; local console-error audit passed. Lint/type/build logs are `pagespeed-lint.log`, `pagespeed-types.log`, and `pagespeed-build.log`.

Full form submission, authentication, email, database, and external integration end-to-end tests were not performed. Source routes and handlers are unchanged. Social links retain their pre-existing `#` destinations. The first chat interaction now waits for its module download. Production CDN/header propagation and field performance remain unverified because nothing was deployed.

## Source files changed in this session

1. `next.config.ts` — compatible frame protection and COOP headers.
2. `src/components/layouts/Header.tsx` — logo dimensions/fit and mobile theme names.
3. `src/components/layouts/Footer.tsx` — logo dimensions and social link names.
4. `src/components/common/SearchCommand.tsx` — accessible search trigger name.
5. `src/components/layouts/MainLayout.tsx` — use deferred chat launcher.
6. `src/components/common/SupportChatLauncher.tsx` — new interaction-loaded launcher.
7. `src/components/common/ChatBot.tsx` — optional initial-open state for deferred mounting.
8. `docs/PAGESPEED_REVIEW.md` — this review.

Verification also generated the logs/results above, `.next-pagespeed-build`, an npm Lighthouse cache `.pagespeed-npm-cache`, and TypeScript's incremental cache. No dependency manifest was changed.
