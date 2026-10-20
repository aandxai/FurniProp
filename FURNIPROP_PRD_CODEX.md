# FurniProp — Final Product Requirements Document & Codex Cloud Build Specification

**Version:** 1.0 (implementation baseline)  
**Date:** 2026-10-20  
**Status:** Ready for staged implementation  
**Product:** FurniProp — Fully Furnished Property Marketplace  
**Audience:** Product owner, design team, engineering team, Codex Cloud  
**Primary market:** India  

> **Codex operating instruction:** Treat this document as the source of truth for the initial build. Do not attempt to deliver all features in a single untested change. Begin with a runnable repository, implement the MVP in vertical slices, execute tests, and maintain an explicit checklist of implemented versus pending capabilities. Never present a mock integration as production-ready. Where an API key, cloud GPU, live inventory, verified project content, or third-party provider is unavailable, create an adapter, secure configuration surface, and documented mock with clear DEMO labeling.

---

## 1. Executive summary

FurniProp is a property discovery, visualization, quality-inspection, experience-zone booking, and sales platform **exclusively for fully furnished residential properties**. It should match the functional breadth of a mainstream Indian property-discovery portal (search, listing pages, developer projects, favorites, leads) while creating an original brand and original UI, not copying protected assets, code, or exact 99acres layouts.

The primary buyer journey is:

**Discover furnished property → View project details → Open dedicated visualizer → Choose unit and furnishing variants → See live itemized price → Inspect actual furniture product quality → Find/book nearby experience zone → Save configuration/request quote → Speak with sales → Visit/book property.**

FurniProp differentiators:
1. **Fully furnished listings by default.** Every published property has at least one developer-approved complete furnishing package; clearly disclose what is included.
2. **Dedicated project visualizer.** Separate URL for each project/unit type, with approved visual variants, combinations, dynamic pricing, and saved configurations.
3. **Product-quality demos.** Product hotspots, factual specifications, material close-ups, real product videos/certificates where available; distinguish rendered product previews from physical demonstrations.
4. **Nearby experience zones.** Book visits to physical sample homes or demonstration sites; accurately label whether the site is an exact unit replica or a comparable furnishing display.

**Marketing constraint:** “India's first” or “world's first” is an unverified claim, not an implementation assumption. Use factual product language until independently substantiated and legally reviewed.

### 1.1 Initial commercial model
- Developer subscription/listing fee.
- Furnishing margin/commission.
- Qualified leads / developer commissions under approved contracts.
- Future: sponsored discovery, visualizer SaaS, financing/transaction partnerships.

### 1.2 Assumptions to encode as configuration, not hardcoded truth
- Pilot: one Indian city, 5–10 developers, 15–25 projects, 3 furnishing tiers, 2–3 experience zones; all indicative.
- New-sale residential properties first. Expand later to rentals, resale, additional cities.
- Responsive website / PWA first. Native mobile applications are out of MVP scope.
- INR, India formatting, Asia/Kolkata dates, mobile-first UX.
- English UI for MVP; Hindi and Gujarati localization readiness (Phase 2).
- No online property purchase, money collection, or ownership transfer in MVP.

---

## 2. Product boundaries and release phases

### P0 — MVP, required to call the product functional
- Customer: home/search with filters, project cards, project details, auth, favorites, inquiries, shareable visualizer, package comparison, saved configuration, pricing, product-quality panel, experience-zone discovery/booking, user dashboard.
- Developer: scoped sign-in, own projects, units and prices, leads, appointments, quotation review, analytics summary; administrative approval controls.
- Admin: authentication/MFA where supported, role permissions, user/developer/project approvals, property and inventory CMS, furnishing catalog, packages, compatible variants, visualizer scenes and assets, price rules, lead CRM, experience zones/slots, operational analytics, audit log.
- Core backend: durable PostgreSQL persistence, seed/demo data, validated API, server-side pricing, consent events, rate limiting, object-storage abstraction, automated tests.
- Real visual change: implement approved **image-based or 360° scene variants** as functional fallback. For real-time 3D, implement an adapter/placeholder contract but **do not represent static image swaps as an operational Unreal Engine stream**.

### P1 — Post-MVP expansion
- Map-first discovery, compare up to four properties, saved-search notifications, advanced individual SKU substitution, downloadable PDF quotes, funnel BI, multilingual content, granular financing tools, advanced reviews, improved real-time 3D if infrastructure available.

### P2 — Future ecosystem
- Unreal Pixel Streaming/VR where affordable and supported, live physical product video demonstrations, native apps, AI recommendation, transaction/booking/payment flows, furniture fulfillment tracking, white-label developer product.

### Explicit MVP exclusions
- Scraping/republishing property listings or images without rights.
- Claiming independent regulatory verification automatically without an actual verification workflow.
- Fake customer reviews/testimonials or invented project names presented as live inventory.
- PCI/card collection, property title/ownership transfer, mortgage underwriting.
- Complex multi-user live VR collaboration.

---

## 3. Users and roles

| Role | Description | Rights |
|---|---|---|
| Guest | Anonymous buyer | Browse published projects, see publicly disclosed prices, view visualizer demo, search zones |
| Buyer | Verified customer | Save projects/configurations, inquire, book zones, manage account |
| Developer Owner | Developer organization administrator | Manage only their organization's drafts/projects, staff and leads |
| Developer Staff | Sales/project operator | Scoped leads, inventory, appointments, offers as permitted |
| Furnishing Partner | Catalog and availability contributor | Update own products and evidence subject to approval |
| Zone Manager | Physical experience-zone staff | Slots, check-in, attendance, feedback for assigned zones |
| Operations Admin | FurniProp operations | Approvals, catalog/project moderation, zone operations |
| Finance Admin | Commercial operator | Rates, quote review, approved finance reports; not unrestricted PII exports |
| Super Admin | Platform owner | RBAC, platform configuration, full audit access |

**Security invariant:** All authorization is enforced server-side at route and query scope. Developer organization A must never access organization B's leads, projects, unpublished media, pricing agreements, or bookings, even through changed IDs or API queries.

---

## 4. Information architecture and routes

Recommended route structure (adjust to Next.js App Router conventions):

**Public**
- `/` — homepage
- `/properties` — listing search and filters
- `/properties/[projectSlug]` — project details
- `/visualizer/[projectSlug]/[unitTypeSlug]` — dedicated interactive configuration page
- `/experience-zones` — zone discovery
- `/experience-zones/[zoneId]` — zone details and bookings
- `/login`, `/signup`, `/privacy`, `/terms`, `/contact`

**Buyer**
- `/account` — overview
- `/account/saved-properties`
- `/account/configurations`
- `/account/appointments`
- `/account/inquiries`

**Developer** (auth + tenant scope)
- `/developer` dashboard
- `/developer/projects`, `/developer/projects/[id]`
- `/developer/inventory`, `/developer/leads`, `/developer/appointments`, `/developer/quotes`, `/developer/settings`

**Admin** (role gated)
- `/admin` overview
- `/admin/users`, `/admin/developers`, `/admin/projects`, `/admin/inventory`
- `/admin/catalog/products`, `/admin/catalog/materials`, `/admin/packages`
- `/admin/visualizers`, `/admin/pricing`, `/admin/leads`, `/admin/experience-zones`
- `/admin/appointments`, `/admin/quotes`, `/admin/analytics`, `/admin/audit-logs`, `/admin/settings`

---

## 5. Buyer application detailed functional requirements

### 5.1 Home and discovery
- Search: city, locality, project, landmark (typeahead using stored entities).
- Filters: furnished total price range, 1–6+ BHK, carpet area, property type (apartment/villa/row house/penthouse/studio), possession (ready/under construction/date), furnishing tier, visualizer available, experience zone available.
- Sort: relevance, furnished starting price ascending/descending, most recent, possession date.
- Listing card: real furnished image; project, locality, developer; size, BHK, possession; **starting furnished total**; availability; visualizer and zone badges; favorite action.
- Pagination or accessible infinite scroll; consistent URL query parameters for shareable filters.
- Search and listing SEO metadata (SSR/ISR where appropriate).
- No empty confusing state; clear resets and suggestions.

**Listing price rule:** Never show an unfurnished-only base price as the headline price. Show “Starting at ₹X including Furnishing Package A” with an itemized breakdown available. If charges are excluded, visibly disclose them.

### 5.2 Project detail
Required fields:
- Name, unique slug, address, map coordinates, locality/city, developer, RERA number and official verification link where applicable, legal disclosures.
- Furnished gallery with media type and explicit labels: `actual furnished photo`, `rendered representation`, `sample home`, `conceptual illustration`.
- Property/unit inventory, carpet area, BHK, price, availability, project phase and possession date.
- Amenities, floor plans, specifications, furnishing inclusions/exclusions, package availability, warranty/product partners, relevant product evidence.
- Four clear CTAs: **Open Visualizer**, **Check Product Quality**, **Visit Experience Zone**, **Request Quote**.
- Contact form with consent checkbox and validated phone/email. De-duplicate inquiries.
- Similar furnished projects based on city/budget/size.

### 5.3 Dedicated visualizer: centerpiece of FurniProp
**Entry point:** `/visualizer/[projectSlug]/[unitTypeSlug]` accessible from project detail; never modal-only.

**Page layout:**
1. Left/central: large interactive visual viewport (responsive, touch gestures); room selector; optional before/after; photo/360 viewer fallback.
2. Right/bottom: package selector, theme, allowed finish options, furniture changes, upgrades; exclusions and stock/compatibility messages.
3. Persistent total price summary and CTA actions.

**Package combinations:** Standard / Premium / Luxury / Custom names are configurable per developer and project. One `UnitType` may have multiple packages, with permitted substitutions and upgrades. All visible combinations must be approved and supported by valid SKU/package associations.

**Functional actions:**
- Select unit type and package; update preview **and** pricing immediately from an authoritative backend quote response.
- Optionally change finishes/colors/materials and select compatible upgrades.
- Visual assets map to approved combinations; if exact image/scene not available, show clear “visual preview not available for this combination,” never silently display a false exact representation.
- Persistent session configuration state in URL or authenticated server record; link can be shared with access controls.
- Save configuration (login required, preserve guest choices through login).
- Export/share summary; request final quotation; book related experience zone.
- Display property amount, base furnishing package, upgrade adjustments, discounts, applicable taxes/fees with explanations and calculated total.
- Clear labels: `Indicative`, `Price last updated`, `Subject to unit availability`, `Valid until` where applicable.

**Quote algorithm:**
```
PropertyBasePrice
+ FurnishingPackagePrice
+ Sum(SelectedCompatibleUpgradePriceDeltas)
+ ApplicableItemizedTaxesAndFees
+ DeliveryAndInstallationIfApplicable
- ApprovedDiscounts
= IndicativeFurnishedTotal
```
Use integer paise or a safe decimal money type, never JavaScript floating-point arithmetic for financial calculations. Preserve itemized tax calculation and prevent double taxation. Compute and validate on server; clients cannot submit trusted totals. A saved quote references price-list and package versions.

**Visualizer integration contract:**
```
VisualizerProvider {
  getCapabilities(projectId, unitTypeId): { modes, selectableAttributes, availableScenes };
  loadScene(sceneId, supportedDeviceContext): SceneLoadResult;
  applySelection(sceneId, configuration): SceneSelectionResult;
  capturePreview(sceneId, configuration): MediaAssetReference;
  disposeSession(sessionId): void;
}
```
- `ImageVariantProvider` (P0) uses authorized furnished imagery/optional panoramas and scene mappings.
- `WebGLProvider` (optional P1) for optimized interactive 3D models.
- `UnrealPixelStreamingProvider` (future/P1–P2) for cloud streamed UE scene; requires external UE build, GPU server orchestration, bandwidth controls, credentials and cost monitoring. Implement interface but no misleading simulated live streaming.
- Under slow network or unsupported browser, image-based viewer works and price engine remains usable.

### 5.4 Product-quality viewer
- Clickable item hotspots or accessible list, mapped by `sceneObjectId` to `ProductSKU`.
- Product profile: SKU, brand, category, dimensions, materials, finishes, manufacturing/supplier information, warranty, price impact, real photos, close-up videos, certification files where verified.
- Label evidence types (manufacturer-supplied / FurniProp-verified / rendered preview).
- Compare approved alternatives (P1); substitutions must be permissioned and not change a purchased offer silently.
- Allow linking a product to physical experience zone coverage if actually present.

### 5.5 Experience zone explorer and booking
- For project/unit/package, show matched nearby zones based on opted-in geolocation or manually selected location.
- Show distance only when route/coordinate calculation is available; otherwise show locality and address without fabricated metrics.
- Each zone: official name/address/coordinates, representative projects/packages, exact replica vs comparable furnishing designation, products available to inspect, images, opening/visit hours, directions link, accessibility notes, capacity.
- Slot booking: dates/time slots in Asia/Kolkata, capacity limits, transactional reservation to avoid double booking; confirmation/reschedule/cancel; optional check-in QR token.
- Zone manager attendance/no-show feedback and salesperson follow-up.
- Zones can represent multiple projects; explicit linkage table plus equivalence type.

### 5.6 Account, favorites, inquiries
- Email/phone-based account flow through a trusted auth provider or verified OTP provider; no development OTP in production.
- Favorite projects, saved configurations, inquiry statuses, scheduled visits, notification preferences.
- Leads from inquiry/quote/zone visits captured with consent, buyer identity, attribution, chosen project/configuration and timestamp.
- Prevent spam with API rate limiting, bot mitigation, and deduplication.

---

## 6. Admin Command Center

A first-class secure web application with operational dashboards and filtered views.

### 6.1 Main dashboard
- Active/pending/rejected projects; total developers; inventory summary.
- Unique visitors, project views, visualizer starts, configuration saves, inquiries, zone bookings, attended visits, qualified leads, closed deals.
- Funnel by date, geography, project, developer, campaign; event definitions must be explicit.
- Operational alerts (pending approval, stale prices, expiring quotes, discontinued SKUs, booking conflicts, unassigned leads).
- Seed dashboard metrics must be labeled **sample/demo**, never masquerade as live production numbers.

### 6.2 Developer verification and projects
- Create/invite developer users; organization status and commercial agreement metadata.
- Create/edit/delete (soft delete)/archive projects; draft → submitted → under review → approved → published → paused/rejected.
- Required submission validation (mandatory legal fields, authorized media, verified price data, at least one furnishing package, representative images).
- Reasoned approvals/rejections; audit entries containing actor, timestamp, change summary.
- Import supported structured CSV files for inventory where useful; validation errors downloadable.

### 6.3 Inventory
- Projects → phases/towers → floors → unit types → physical units.
- Unit-specific availability and base pricing; `AVAILABLE`, `ON_HOLD`, `BOOKED`, `SOLD`, `UNAVAILABLE`.
- Support different carpet areas, floor premiums, facing/premium components as explicit pricing rules.
- Available project metadata and expiration thresholds to flag stale records.

### 6.4 Furniture catalog and packages
- SKU CRUD: code, title, category, supplier/brand, product dimensions, finish/material, warranties, cost/sale prices, supply status, linked evidence and media, 3D assets.
- Approved replacement items for discontinued products.
- Package builder: room-level list, required items, optional items, SKU quantity, allowed substitutions, room/size compatibility, price, tax category, version, release status.
- Prevent package publishing with broken product links or missing required costs, media disclosures, compatibility rules.
- Media upload validation, accepted MIME types, size limits, admin review, signed URLs.

### 6.5 Visualizer CMS
- Map projects and unit types to scenes, room cameras, preview images, hotspots, furniture SKUs and material options.
- Define variant availability and asset coverage; publish scene versions.
- Preview configurations internally before publishing.
- Support both static/image fallback and future UE integration metadata.

### 6.6 Pricing & quotes
- Rule edit with draft/review/active status and audit trail.
- Currency INR; standardized taxes and inclusion flags; time-limited promotional rules.
- Never silently overwrite existing quote snapshots; quote history and validity visible.
- Manual quote approval/rejection, with reason and optional approved discount limit.

### 6.7 CRM & appointments
- Leads searchable/filterable by source, status, project, owner, date; assignment and reassignment.
- Lead states: `NEW`, `CONTACTED`, `QUALIFIED`, `VISIT_SCHEDULED`, `VISITED`, `QUOTE_SENT`, `NEGOTIATION`, `BOOKED`, `LOST`, `CLOSED`.
- Follow-up tasks, outcome notes, activity log, visibility per developer, deduplication, optional CSV export for authorized roles.
- Experience zone capacity/calendar, exceptions/holidays, staff assignment, reschedules, check-in and feedback.

### 6.8 Platform operations
- Admin role assignment with minimal privileges; MFA for sensitive admin roles.
- Moderation history, audit logs, access events.
- Consent and user data handling tools aligned with applicable Indian law; retention/deletion/export subject to legal review.
- Configurable emails/messages; no sending through an unconfigured provider.
- Platform settings: currency, locale, support contacts, notification templates, feature flags, media limits, integration keys via environment/secrets.

---

## 7. Developer and partner portals

Developer organization users can:
- View dashboard for **their own** projects/leads and inventory.
- Propose/create draft projects, update approved inventory and submit changes for moderation.
- View configuration selections attached to leads, arrange site visits, create authorized quotes.
- See zone bookings linked to their projects and conversion funnel summaries.
- Track billing/commissions only after commercial model is configured (P1).

Furnishing partners (P1 unless easy to include during MVP): upload own SKU specifications/prices/media for moderation; see approval status but no other partners' data.

Experience zone managers: check daily slots, check in appointments, register attendance and feedback. Never access unrelated customer histories.

---

## 8. Data model (minimum recommended entities)

Use UUIDs or cuid IDs; relational constraints, timestamps, soft delete where appropriate, tenant organization keys, and index important filters.

**Identity:** `User`, `AuthAccount`, `Role`, `Permission`, `UserRole`, `Organization`, `OrganizationMembership`, `ConsentRecord`.

**Properties:** `City`, `Locality`, `Developer`, `Project`, `ProjectMedia`, `ProjectAmenity`, `Tower`, `UnitType`, `Unit`, `UnitPricing`, `FloorPlan`, `ProjectApproval`.

**Catalog:** `Supplier`, `ProductSKU`, `ProductMedia`, `ProductQualityEvidence`, `Material`, `FurnishingPackage`, `FurnishingPackageVersion`, `PackageItem`, `CompatibilityRule`, `ProductReplacement`.

**Visualization:** `VisualizerScene`, `VisualizerSceneVersion`, `SceneRoom`, `SceneHotspot`, `SceneVariantAsset`, `Configuration`, `ConfigurationSelection`, `ConfigurationShareLink`.

**Commerce/price:** `PriceRule`, `PriceListVersion`, `Quotation`, `QuotationLineItem`, `DiscountApproval`.

**Engagement:** `Favorite`, `Lead`, `LeadActivity`, `LeadAssignment`, `FollowUpTask`, `ExperienceZone`, `ZoneProjectMapping`, `ZoneProductMapping`, `ZoneAvailabilityRule`, `ZoneTimeSlot`, `Appointment`, `Notification`, `AnalyticsEvent`, `AuditLog`.

Entity invariants:
- Every published listing references at least one valid current furnished package.
- Project has exactly one owning developer organization and appropriate publication state.
- Configuration persists chosen unit type, package **version**, selections and scene version.
- Quotation persists full itemized amounts and source pricing versions; never recalculated retroactively without issuing a new version.
- `Appointment` slot capacity enforced atomically in DB transaction.
- Media include copyright/authorization status and `mediaRepresentationType`.
- `Lead` attribution/events must respect user privacy consent.

---

## 9. API contract (representative REST endpoints)

Use typed request/response schemas (Zod or equivalent), pagination, standardized error codes, audit events, and owner/tenant checks.

**Public**
- `GET /api/projects?city=&locality=&bhk=&minPrice=&maxPrice=&furnishingTier=&hasVisualizer=&hasZone=&sort=&page=`
- `GET /api/projects/:slug`
- `GET /api/projects/:id/unit-types`
- `GET /api/projects/:id/packages?unitTypeId=`
- `GET /api/visualizers/:sceneId/capabilities`
- `POST /api/pricing/estimate` **server-calculated** with validated unit/package/version/selections
- `GET /api/products/:skuId/quality`
- `GET /api/experience-zones?projectId=&lat=&lng=&city=`
- `GET /api/experience-zones/:id/slots?date=`

**Buyer/authenticated**
- `POST /api/configurations`, `GET /api/me/configurations`
- `POST /api/favorites`, `DELETE /api/favorites/:projectId`
- `POST /api/leads`, `GET /api/me/leads`
- `POST /api/appointments`, `PATCH /api/appointments/:id`, `GET /api/me/appointments`
- `POST /api/quotes/request`, `GET /api/me/quotes`

**Developer (tenant-scoped)**
- `GET /api/developer/projects`, `POST /api/developer/projects`
- `PATCH /api/developer/projects/:id`
- `GET /api/developer/leads`, `PATCH /api/developer/leads/:id`
- `GET /api/developer/appointments`, `GET /api/developer/quotes`

**Admin**
- CRUD under `/api/admin/projects`, `/api/admin/developers`, `/api/admin/catalog`, `/api/admin/packages`, `/api/admin/scenes`, `/api/admin/price-rules`, `/api/admin/experience-zones`, `/api/admin/users`.
- Approval actions and audit log under dedicated role-gated endpoints.

No request-provided user ID/tenant ID is trusted for authorization; derive from verified server session.

---

## 10. Design system and UX direction

- Brand: **FurniProp**, distinctive design inspired by modern premium interiors, **not a pixel clone** of 99acres.
- Aspirational property photography; hero/gallery images **always show furnished spaces** and carry accurate representation labels.
- Accessible visual hierarchy, abundant whitespace, clean typography, warm-neutral surfaces, one coherent brand accent (final palette design decision).
- Responsive: 360px mobile through wide desktop; desktop admin dense tables, mobile admin functional where feasible.
- Consistent buttons, chips, forms, image tiles, searchable combobox, breadcrumbs, sticky CTA panels, toasts, confirmations, loading skeletons, empty states.
- Minimum contrast and keyboard-navigation targets aligned with WCAG 2.2 AA for core actions.
- All sample assets and project descriptions conspicuously marked `DEMO`.
- Do not use unauthorized brand logos, copied proprietary images, unlicensed property imagery, or external media requiring undisclosed usage rights.

---

## 11. Technical architecture & infrastructure

**Preferred implementation:**
- Web application: Next.js App Router + React + TypeScript.
- Styling: Tailwind CSS + accessible component primitives, consistent shared UI package.
- Forms/validation: React Hook Form + Zod (or equivalent).
- Server: Next.js route handlers/server actions organized into business domain modules (modular monolith initially).
- Persistence: PostgreSQL + Prisma ORM (migrations committed).
- Search: PostgreSQL indexed search for MVP; adapter for OpenSearch/Elasticsearch as scale demands.
- Auth: trusted auth library/service (e.g. Auth.js or managed auth) with persistent sessions and RBAC; secure session cookies; MFA for privileged accounts where feasible.
- Media: storage adapter for S3-compatible object store; local development/test fallback; upload MIME/size validation.
- Analytics: privacy-aware events with clear meanings; lightweight dashboard aggregations.
- Testing: Vitest/Jest for unit and service tests; Playwright for key E2E flows.
- CI: GitHub Actions for lint/typecheck/tests/build.
- Deployment: container-ready or managed web hosting plus managed Postgres/object storage; documented environment variables.
- API/auth secrets never committed; `.env.example` uses placeholders.

Architecture requirements:
1. Separate **business pricing logic** from rendering UI.
2. Separate developer/admin authorization from public/customer view logic.
3. Service interfaces for real-time 3D, maps, OTP, messaging, file storage, analytics.
4. Structured logging and non-sensitive error messages.
5. Input validation, CSRF/session safeguards where applicable, output escaping, rate limiting.
6. Prevent SQL injection, XSS, open redirect, IDOR; maintain audit trails.
7. Account for concurrent inventory changes and appointment slot contention.
8. No direct public writes to price tables or seller-scoped documents.

### Deployment mode
- `DEMO_MODE=true`: seeded fictitious demo projects/users with highly visible DEMO labeling; mock notification/provider adapters; demo sign-in only in development/test environments.
- `DEMO_MODE=false`: require live configured integrations, verified content/admin approval before any listing goes public; do not accept mock OTP or seed credentials.

---

## 12. Performance, security, privacy, quality

Initial measurable targets (subject to pilot load validation):
- LCP on key mobile pages at p75 ≤ 2.5 seconds on representative networks.
- Indexed search API p95 ≤ 800 ms under defined pilot load; paginated responses.
- Scene load target ≤ 15 sec on supported broadband where scenes exist; functional image fallback on constrained devices.
- Core listing/inquiry availability target: 99.9% monthly after production operations are established.
- Restrict access to personally identifiable information and admin data by least privilege.
- Enforce admin MFA if supported by selected auth integration.
- Encrypt data in transit; secure hosting, backups, restore test and alerts.
- Implement explicit inquiry/marketing consent, privacy/terms links, retention and deletion request workflow, subject to counsel review under Indian privacy rules.
- Treat RERA details, project claims, taxes, registration charges, advertised total price and brokerage disclosures as legal-review items; do not invent regulatory compliance claims.

---

## 13. Analytics event taxonomy and KPIs

Capture server/client events without unconsented sensitive data, where applicable:
- `project_impression`, `project_view`, `search_performed`, `search_filter_applied`
- `visualizer_opened`, `package_selected`, `variant_changed`, `configuration_saved`
- `quality_product_opened`, `zone_viewed`, `appointment_booked`, `appointment_attended`
- `inquiry_submitted`, `quote_requested`, `quote_sent`, `lead_qualified`, `booking_confirmed`

Event dimensions: project ID, unit type ID, package version, source/referrer if consented, device class, coarse region and timestamp. Avoid placing full phone/email in analytics payloads.

Pilot KPI goals (hypotheses, not established benchmarks): visualizer opens ≥25% of eligible project page viewers; saves ≥15% of visualizer sessions; inquiry conversion ≥5% of project detail sessions; zone attendance ≥65% of confirmed bookings; >95% required listing data completeness; 100% authoritative price calculation on issued quotes.

---

## 14. Acceptance tests — must pass for MVP

1. **Search:** Given published demo projects with valid furnishing packages, user can filter by city/BHK/fully furnished price and navigate to correct details.
2. **Price integrity:** Listing headline = lowest available approved fully furnished configuration, not bare shell price.
3. **Visualizer:** From project page user opens dedicated route; switching approved packages changes the preview asset and calls validated pricing estimate; price changes reflect approved rules.
4. **Unknown variant:** If no asset corresponds to exact selected combination, show honest unavailable state, not incorrect imagery.
5. **Saved configuration:** Logged-in buyer saves and returns to selection with project, unit type, package version, upgrades intact.
6. **Product demo:** Selected scene furniture hotspot opens matching SKU evidence and accurately labels rendered vs actual images.
7. **Zone:** Project with linked zone exposes zone, availability and booking; duplicate concurrent capacity-exceeding requests cannot both succeed.
8. **Lead:** Inquiry captured with explicit consent and configuration context; admin/developer with rights sees assigned lead.
9. **Admin:** Admin creates project, uploads media, maps package, configures approved price, publishes; public search updates.
10. **Publishing validation:** Project without furnishing package or required disclosure cannot publish.
11. **Tenant isolation:** Developer A cannot read/edit Developer B's projects, customers, quotes, or bookings, including via direct API call.
12. **Quote:** Server computes itemized total using decimal-safe math; historical quote stays stable after new price rules activate.
13. **Authentication:** Protected routes redirect unauthorized users; no development bypass active in production.
14. **Media/legal:** Demo/listing assets have documented source, representation label and permission metadata.
15. **CI:** Typecheck, lint, service tests, role/permission tests, and core Playwright E2E tests pass; no hardcoded secrets.

---

## 15. Delivery sequence / engineering backlog

### Milestone M0 — Repository and architecture
- Scaffold Next.js TypeScript/Tailwind; establish design tokens and shared components.
- Prisma schema, PostgreSQL setup, migrations, seed scripts, `.env.example`.
- Auth/session and RBAC middleware + server enforcement.
- Readme, scripts, CI, test harness.
- Demo fixture projects, unit types, package choices, fictional furnished images placeholders with visible watermark/labels.

**Definition of done:** Fresh clone can run locally with documented commands; tests pass; role-separated demo pages accessible in development.

### Milestone M1 — Property portal
- Homepage, search/filter results, cards, project details, responsive gallery, user registration/login, favorites.
- Admin creates and approves a project; developer manages own draft inventory.
- Server search returns published valid listings only.

**DoD:** Fully furnished demo listing from admin is visible in public search with correct filters and price.

### Milestone M2 — Visualizer and pricing
- Dedicated visualizer route.
- Image/360 variant engine; package selector; materials/upgrade controls with compatibility.
- Server-side price estimate; price rule admin; configuration save/share.
- SKU product quality hotspots and viewer; visualizer CMS.

**DoD:** Customer changes package and sees right visual plus price; configuration/quote linked to versioned product data.

### Milestone M3 — Experience zones, bookings, CRM
- Zone/slots CMS and discovery; project/package linkage and exact/comparable labels.
- Appointment booking with concurrency safety; user and zone manager views.
- Leads, quote requests, assignment, CRM activity, notifications via adapter.

**DoD:** Customer completes browse → visualizer → booking → inquiry; developer sees correct lead, admin sees funnel.

### Milestone M4 — Production hardening
- SEO, accessibility, security review, rate limiting, operational analytics, monitoring.
- E2E coverage, responsive QA, staged cloud deployment instructions, privacy/legal checklist.

**DoD:** Full MVP acceptance suite passes; production checklist documents real provider credentials and outstanding legal/content verification.

---

## 16. Codex Cloud instructions — execution protocol

When this file is provided to Codex:

1. Read the entire PRD. Begin by writing `IMPLEMENTATION_PLAN.md` with architecture, routes, schema, phased tasks, dependencies and risk register.
2. Inspect existing repository first; do not overwrite working code unnecessarily.
3. Prefer incremental PRs/commits per milestone and working vertical slice; do not attempt a one-shot complete marketplace.
4. Implement **M0 first**, then M1–M4 in order. If operating in a single task window, prioritize an executable M0 and part of M1 rather than untestable breadth.
5. Implement backend pricing, validation, auth and role scope before attaching business-critical UI actions.
6. Create realistic-but-fictitious DEMO content and make it visually obvious throughout the app.
7. No live visualizer claim until a real scene provider exists. Use `ImageVariantProvider` with genuinely changing approved variants.
8. Use no provider credentials or secret values in source control; emit `.env.example` and setup docs.
9. Run formatting/lint/typecheck/unit tests/build; fix errors. Add Playwright tests for search, visualizer price changes, admin publishing, and tenant isolation.
10. Maintain `PROGRESS.md` listing completed requirements, incomplete features, external integration blockers, and exact run commands.
11. At the end of each milestone, summarize changes, tests run/results, screenshots or preview guidance if available, and recommended next tasks.
12. Stop rather than invent compliance status, real estate inventory, experience-zone schedules, financial data or actual 3D assets.

### Recommended first Codex task prompt

> Read `FURNIPROP_PRD_CODEX.md` in full. Build FurniProp according to its specification, beginning with Milestone M0 and a working vertical slice of M1. Create `IMPLEMENTATION_PLAN.md` and `PROGRESS.md`. Use Next.js App Router, TypeScript, Tailwind, PostgreSQL, Prisma and secure role-aware authentication. Seed clearly fictional DEMO projects and furnishing packages. Implement an original premium real estate marketplace design rather than copying 99acres assets or layouts. Ensure the admin/developer roles are server-isolated. Write tests, run typecheck/lint/build, and document how to launch. Do not claim Unreal live visualizer integration; add an adapter and implement real image-based variant switching in M2. Continue through remaining milestones incrementally only when earlier milestones are tested and working.

---

## 17. Launch readiness gates

Do **not** call the app production-ready unless all are true:
- All P0 flows work end to end with live persisted data and valid authorization.
- At least one actual authorized project, furnished photo set, approved SKU/package list, current prices and consent/legality checks are available.
- Admin can publish/retract a project and correct pricing/inventory.
- Customer can navigate the visualizer and inspect truthful product quality details.
- Booking capacity/slots, lead notifications, CRM permissions are tested.
- Visualizer fallback and service-unavailable UX are present.
- Security/privacy/legal checklist is reviewed with appropriate professionals.
- Monitoring, backup, migration, safe deployment/rollback and secrets management are configured.

### Product promise

**FurniProp is not just a listing portal with furnished photos. It is a connected system of furnished-property discovery, configuration, price transparency, product-quality evidence, experience-zone visits, and developer sales operations.**
