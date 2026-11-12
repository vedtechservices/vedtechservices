# SEO baseline before development

Captured 2026-11-05 before changing SEO source. This is a local source baseline, not an index/ranking/traffic report.

## Existing architecture

- Next.js App Router uses app/page.tsx and app/[...slug]/page.tsx with src/routes.tsx / app/RouterView.tsx for the existing compatibility views. app/locations/page.tsx and app/locations/[city]/page.tsx are separate server-rendered location routes.
- src/lib/seo.ts owns public metadata, canonical URLs, Open Graph, Twitter and JSON-LD. LegacyHelmet and PageMeta in src/components/common/PageMeta.tsx are no-ops, so their old per-view metadata/schema is not active.
- Canonical host: https://vedtechservices.in. The live read-only www request redirected to this host. No hostname/DNS/redirect change is planned.
- Central schema includes Organization, WebSite, WebPage, BreadcrumbList, service/industry Service, hub ItemList and existing-article BlogPosting. City pages have Organization, WebPage, Service and BreadcrumbList; the directory has WebPage/BreadcrumbList/ItemList.
- app/sitemap.ts contains 45 URLs: central public pages, /locations, 11 Phase 1 cities and 8 existing blog articles. app/robots.ts allows public crawling, disallows private-area path prefixes, and declares the canonical sitemap.
- There are 100 city URLs: 11 indexable under the existing Phase 1 rule and 89 noindex/follow. These rules and the city dataset will be preserved.
- Existing internal links connect the main navigation, footer, service/industry hubs and location directory. Public navigation labels Portfolio currently lead to /demo. /portfolio is a distinct existing case-study route, not a replacement for /demo.
- Service page images that exist already use project-title or descriptive alt text. New additions introduce no images, fonts, animation libraries or third-party scripts. Existing main H1s are preserved; new sections start at H2.

## Confirmed gaps and bounded plan

- /portfolio exists and has content, but central metadata returns Page Not Found and noindex. Add the missing entry, canonical and CollectionPage schema; do not rename either portfolio route.
- Unmatched public catch-all paths reach the client homepage replacement rather than a real 404. Reject only unknown public paths before rendering; preserve all 71 configured routes and private-area handling.
- Gurugram and Bhopal already have city URLs; Samastipur does not. Improve existing guides and the existing contact page instead of creating new city pages. Keep Bhopal noindex unchanged.
- Contact information in Organization schema is sparse. Reuse published contact data without invented ratings, hours, prices, GPS coordinates, awards or local project claims.
- Add intent-specific enquiry guidance and contextual links to existing service pages. No existing title or description is rewritten except the missing /portfolio metadata.

## Evidence and missing dependencies

Read docs/FULL_AUDIT_VERIFICATION.md, docs/PAGESPEED_REVIEW.md, the current SEO sources and public service/contact/portfolio data. docs/FULL_PROJECT_AUDIT.md is absent: the prior full audit was interrupted and is not treated as a completed report. No unrelated audit/security testing is part of this SEO phase.

No Search Console connection, verified export, current indexing report, analytics access or keyword-volume tool is available. No live rankings, volumes, traffic, index counts or Core Web Vitals measurements are invented.

## Existing public URL inventory

The immutable machine-readable baseline [seo-baseline.json](seo-baseline.json) records full pre-change titles, descriptions, canonical directives, robots flags, schema types, source heading text and source hashes for every URL below. Public H1/H2/H3 source expressions are retained there; dynamic expressions are source evidence rather than a claim about rendered output.

| Existing path | Pre-change title | Index flag |
| --- | --- | --- |
| /portfolio | Page Not Found  /  VedTech Services | false |
| / | IT Services for Businesses  /  Software, Web, Hardware & Support  /  VedTech | true |
| /about | About VedTech Services — Expert IT Partner in Bihar, India | true |
| /services | Business IT Services  /  Software, Hardware & Support  /  VedTech | true |
| /services/software | Software Development Services  /  Custom Software & Apps  /  VedTech | true |
| /services/hardware | Computer Repair & IT Infrastructure Services  /  VedTech | true |
| /services/it-support | Business IT Support & AMC Plans  /  Helpdesk  /  VedTech | true |
| /services/web-development | Website Development Company  /  Business Websites & Web Apps | true |
| /services/mobile-app-development | Mobile App Development  /  Android, iOS & Cross-Platform Apps | true |
| /services/hardware-repair | Computer & Laptop Repair Services  /  Hardware Support  /  VedTech | true |
| /services/networking-solutions | Business Networking Solutions  /  LAN, Wi-Fi & Network Security | true |
| /industries | Industry IT Solutions  /  Education, Corporate, Retail & More  /  VedTech | true |
| /industries/educational-institutions | IT Solutions for Educational Institutions  /  School Technology  /  VedTech | true |
| /industries/corporate-offices | IT Solutions for Corporate Offices  /  Networks & Cloud  /  VedTech | true |
| /industries/retail-shops | Retail IT Solutions  /  POS, Billing & Inventory  /  VedTech | true |
| /industries/startups-smes | IT Solutions for Startups & SMEs  /  Software & Support  /  VedTech | true |
| /industries/healthcare | Healthcare IT Solutions  /  Patient Systems & Data Security  /  VedTech | true |
| /industries/manufacturing | Manufacturing IT Solutions  /  ERP & Industrial Networking  /  VedTech | true |
| /why-us | Why Choose VedTech Services — Fast, Reliable IT Support in Bihar | true |
| /amc-plans | IT AMC Plans & Pricing — VedTech Services Annual Maintenance Contracts | true |
| /support | Customer Support Center  /  VedTech Services | true |
| /contact | Contact VedTech Services — Get Free IT Consultation  /  24/7 Support | true |
| /privacy | Privacy Policy — VedTech Services | true |
| /terms | Terms of Service — VedTech Services | true |
| /blog | VedTech Services Blog — IT Tips, Guides & Technology Insights | true |
| /demo | Live Project Portfolio — VedTech Services  /  17 Projects | true |
| /blog/1 | 10 Essential IT Security Tips for Small Businesses in 2026 - VedTech Blog | true |
| /blog/2 | Why Your Business Needs a Professional Website in 2026 - VedTech Blog | true |
| /blog/3 | Complete Guide to IT AMC Plans: What You Need to Know - VedTech Blog | true |
| /blog/4 | Mobile App vs Website: What's Right for Your Business? - VedTech Blog | true |
| /blog/5 | How to Choose the Right IT Service Provider for Your Business - VedTech Blog | true |
| /blog/6 | Top 5 Technology Trends for Indian SMEs in 2026 - VedTech Blog | true |
| /blog/7 | How to Troubleshoot Slow Internet on Windows 11 - VedTech Blog | true |
| /blog/8 | How-to: Set Up a Dual Monitor Workplace - VedTech Blog | true |
| /locations/bengaluru | Software development company in Bengaluru  /  VedTech Services | true |
| /locations/chennai | Software development company in Chennai  /  VedTech Services | true |
| /locations/delhi | Software development company in Delhi  /  VedTech Services | true |
| /locations/gurugram | Software development company in Gurugram  /  VedTech Services | true |
| /locations/hosur | Software development company in Hosur  /  VedTech Services | true |
| /locations/hyderabad | Software development company in Hyderabad  /  VedTech Services | true |
| /locations/kota | Software development company in Kota  /  VedTech Services | true |
| /locations/mumbai | Software development company in Mumbai  /  VedTech Services | true |
| /locations/noida | Software development company in Noida  /  VedTech Services | true |
| /locations/pune | Software development company in Pune  /  VedTech Services | true |
| /locations/tiruppur | Software development company in Tiruppur  /  VedTech Services | true |
| /locations/ahmedabad | Software development company in Ahmedabad  /  VedTech Services | false |
| /locations/bhubaneswar | Software development company in Bhubaneswar  /  VedTech Services | false |
| /locations/chandigarh | Software development company in Chandigarh  /  VedTech Services | false |
| /locations/coimbatore | Software development company in Coimbatore  /  VedTech Services | false |
| /locations/durgapur | Software development company in Durgapur  /  VedTech Services | false |
| /locations/faridabad | Software development company in Faridabad  /  VedTech Services | false |
| /locations/gandhinagar | Software development company in Gandhinagar  /  VedTech Services | false |
| /locations/ghaziabad | Software development company in Ghaziabad  /  VedTech Services | false |
| /locations/greater-noida | Software development company in Greater Noida  /  VedTech Services | false |
| /locations/guwahati | Software development company in Guwahati  /  VedTech Services | false |
| /locations/haridwar | Software development company in Haridwar  /  VedTech Services | false |
| /locations/indore | Software development company in Indore  /  VedTech Services | false |
| /locations/jalandhar | Software development company in Jalandhar  /  VedTech Services | false |
| /locations/jamnagar | Software development company in Jamnagar  /  VedTech Services | false |
| /locations/jamshedpur | Software development company in Jamshedpur  /  VedTech Services | false |
| /locations/kanpur | Software development company in Kanpur  /  VedTech Services | false |
| /locations/karnal | Software development company in Karnal  /  VedTech Services | false |
| /locations/kochi | Software development company in Kochi  /  VedTech Services | false |
| /locations/kolkata | Software development company in Kolkata  /  VedTech Services | false |
| /locations/lucknow | Software development company in Lucknow  /  VedTech Services | false |
| /locations/ludhiana | Software development company in Ludhiana  /  VedTech Services | false |
| /locations/mangaluru | Software development company in Mangaluru  /  VedTech Services | false |
| /locations/meerut | Software development company in Meerut  /  VedTech Services | false |
| /locations/mohali | Software development company in Mohali  /  VedTech Services | false |
| /locations/moradabad | Software development company in Moradabad  /  VedTech Services | false |
| /locations/nagpur | Software development company in Nagpur  /  VedTech Services | false |
| /locations/nashik | Software development company in Nashik  /  VedTech Services | false |
| /locations/navi-mumbai | Software development company in Navi Mumbai  /  VedTech Services | false |
| /locations/panaji | Software development company in Panaji  /  VedTech Services | false |
| /locations/panipat | Software development company in Panipat  /  VedTech Services | false |
| /locations/patna | Software development company in Patna  /  VedTech Services | false |
| /locations/raipur | Software development company in Raipur  /  VedTech Services | false |
| /locations/rajkot | Software development company in Rajkot  /  VedTech Services | false |
| /locations/rourkela | Software development company in Rourkela  /  VedTech Services | false |
| /locations/siliguri | Software development company in Siliguri  /  VedTech Services | false |
| /locations/surat | Software development company in Surat  /  VedTech Services | false |
| /locations/thane | Software development company in Thane  /  VedTech Services | false |
| /locations/thiruvananthapuram | Software development company in Thiruvananthapuram  /  VedTech Services | false |
| /locations/thrissur | Software development company in Thrissur  /  VedTech Services | false |
| /locations/udaipur | Software development company in Udaipur  /  VedTech Services | false |
| /locations/vadodara | Software development company in Vadodara  /  VedTech Services | false |
| /locations/vapi | Software development company in Vapi  /  VedTech Services | false |
| /locations/varanasi | Software development company in Varanasi  /  VedTech Services | false |
| /locations/vellore | Software development company in Vellore  /  VedTech Services | false |
| /locations/visakhapatnam | Software development company in Visakhapatnam  /  VedTech Services | false |
| /locations/chhatrapati-sambhajinagar | Software development company in Chhatrapati Sambhajinagar  /  VedTech Services | false |
| /locations/hubballi-dharwad | Software development company in Hubballi-Dharwad  /  VedTech Services | false |
| /locations/kolhapur | Software development company in Kolhapur  /  VedTech Services | false |
| /locations/ajmer | Software development company in Ajmer  /  VedTech Services | false |
| /locations/bikaner | Software development company in Bikaner  /  VedTech Services | false |
| /locations/gwalior | Software development company in Gwalior  /  VedTech Services | false |
| /locations/kollam | Software development company in Kollam  /  VedTech Services | false |
| /locations/kottayam | Software development company in Kottayam  /  VedTech Services | false |
| /locations/alwar | Software development company in Alwar  /  VedTech Services | false |
| /locations/amritsar | Software development company in Amritsar  /  VedTech Services | false |
| /locations/anand | Software development company in Anand  /  VedTech Services | false |
| /locations/bareilly | Software development company in Bareilly  /  VedTech Services | false |
| /locations/belagavi | Software development company in Belagavi  /  VedTech Services | false |
| /locations/bhavnagar | Software development company in Bhavnagar  /  VedTech Services | false |
| /locations/bhopal | Software development company in Bhopal  /  VedTech Services | false |
| /locations/cuttack | Software development company in Cuttack  /  VedTech Services | false |
| /locations/dehradun | Software development company in Dehradun  /  VedTech Services | false |
| /locations/dhanbad | Software development company in Dhanbad  /  VedTech Services | false |
| /locations/gorakhpur | Software development company in Gorakhpur  /  VedTech Services | false |
| /locations/hisar | Software development company in Hisar  /  VedTech Services | false |
| /locations/jodhpur | Software development company in Jodhpur  /  VedTech Services | false |
| /locations/kakinada | Software development company in Kakinada  /  VedTech Services | false |
| /locations/kozhikode | Software development company in Kozhikode  /  VedTech Services | false |
| /locations/madurai | Software development company in Madurai  /  VedTech Services | false |
| /locations/mysuru | Software development company in Mysuru  /  VedTech Services | false |
| /locations/nellore | Software development company in Nellore  /  VedTech Services | false |
| /locations/prayagraj | Software development company in Prayagraj  /  VedTech Services | false |
| /locations/puducherry | Software development company in Puducherry  /  VedTech Services | false |
| /locations/ranchi | Software development company in Ranchi  /  VedTech Services | false |
| /locations/salem | Software development company in Salem  /  VedTech Services | false |
| /locations/solapur | Software development company in Solapur  /  VedTech Services | false |
| /locations/sonipat | Software development company in Sonipat  /  VedTech Services | false |
| /locations/tiruchirappalli | Software development company in Tiruchirappalli  /  VedTech Services | false |
| /locations/vijayawada | Software development company in Vijayawada  /  VedTech Services | false |
| /locations/jaipur | Software development company in Jaipur  /  VedTech Services | false |
| /locations/ambala | Software development company in Ambala  /  VedTech Services | false |
| /locations/jabalpur | Software development company in Jabalpur  /  VedTech Services | false |
| /locations/kannur | Software development company in Kannur  /  VedTech Services | false |
| /locations/mathura | Software development company in Mathura  /  VedTech Services | false |
| /locations/nainital | Software development company in Nainital  /  VedTech Services | false |
| /locations/shillong | Software development company in Shillong  /  VedTech Services | false |
| /locations/ujjain | Software development company in Ujjain  /  VedTech Services | false |
| /locations/agra | Software development company in Agra  /  VedTech Services | false |
| /locations/bokaro | Software development company in Bokaro  /  VedTech Services | false |
| /locations | Software & Website Projects by City  /  VedTech Services | true |

The baseline includes 135 public URLs: 26 fixed compatibility routes, 8 existing article URLs, the location directory and 100 existing cities. API/private paths are not public SEO targets.

## Preservation contract

- Existing route strings, city rows, blog data, robots rules and existing sitemap entries stay intact.
- Existing indexed-page metadata remains unchanged. /portfolio is the documented exception because its metadata was missing.
- No approved redirect plan is required: no existing URL is removed, renamed or redirected.
- Source snapshots are in .verification/seo-phase/before; the public JSON baseline remains in docs for repeatable regression checks. No secrets are included.
