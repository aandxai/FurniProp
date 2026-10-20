# FurniProp progress

## Completed in this build

- M0: Next.js/TypeScript/Tailwind scaffold, PostgreSQL 17 container setup, Prisma schema and migration file, repeatable fictional seed data, password/session authentication, buyer/developer/admin roles, original DEMO visual assets, documentation and CI workflow.
- M1 buyer slice: home, furnished project search with city/BHK/total-price filters, details, sign-up/sign-in, saved favorites, consented inquiries and account overview.
- M1 operations slice: organization-scoped developer projects and leads, draft unit/package creation, submission and validated DEMO admin publishing. Direct cross-organization project access returns 404.
- Early M2 slice: dedicated image variant visualizer, approved package switching and authoritative server estimate in integer paise. Distinct images are mapped to approved packages.
- Validation: lint, typecheck, 5 database/service tests, production build, 5 Chromium browser tests, and local HTTP smoke requests pass.

## Pending for the full P0 MVP

- Verified email/phone identity, admin MFA, rate limiting, audit logs and privacy retention/deletion tools.
- Full visualizer selections, configuration save/share, product SKU evidence and quality viewer, quote snapshots, discounts and itemized legally reviewed taxes/fees.
- Experience-zone CMS, real site verification, atomic slot booking, appointment lifecycle and zone-manager portal.
- Full inventory and furnishing catalog CMS, media upload/review, comprehensive developer/admin CRUD and workflow approvals.
- Lead assignment/CRM statuses, notifications, analytics event definitions and funnel reporting.
- Additional accessibility, security, performance and deployment testing.

## External prerequisites for launch

- Authorized real project listings and images, verified legal/RERA details, approved furnishing SKU/package data, prices, charges and warranty evidence.
- Identity, notification and object storage providers; verified physical experience zones and schedules.
- Legal, privacy and operational review. No claim of regulatory verification or production readiness is made.

## Run commands

`npm ci`, `bash scripts/setup-local.sh`, `npm run dev`; then `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. See [README.md](README.md) for prerequisites and details.
