# FurniProp implementation plan

The attached PRD dated 20 October 2026 is the product specification. This repository was empty at the start of implementation. Work is delivered in tested vertical slices, with all fictional content marked DEMO.

## Architecture

- Next.js App Router, TypeScript and Tailwind for the web UI and route handlers.
- PostgreSQL with Prisma migrations for durable catalog, identity, saved data and operations.
- Server-side session cookies backed by hashed tokens in PostgreSQL. Every protected query derives the user and organization from the session.
- Domain functions for project publishing, search, pricing, and future booking. Money is stored as integer paise.
- Demo-only fictional seed data. No external listing, media, OTP, email or 3D provider is represented as live.

## Routes and phased tasks

| Phase | Scope |
| --- | --- |
| M0 | Scaffold, design tokens, Prisma schema/migration, local PostgreSQL, seeded DEMO accounts/content, session auth, role checks, docs and tests. |
| M1 | Home, search and filters, project details, favorites, inquiries, tenant-scoped developer projects and admin publishing controls. |
| M2 | Dedicated visualizer, approved image variants, versioned package and pricing estimate, configurations, product evidence. |
| M3 | Experience zones, atomic capacity booking, CRM and quote requests. |
| M4 | Accessibility, security, privacy and deployment hardening, browser tests and real provider integration. |

## Main data groups

Identity: users, sessions, organizations. Listings: projects, unit types, furnishing packages and media disclosures. Engagement: favorites, inquiries. The first visualizer slice maps approved package images. Later migrations add price list/quote snapshots, full scene variants, products and zone slots.

## Dependencies and risks

- Local development requires Node.js 20+ and PostgreSQL 17. Docker is the documented local PostgreSQL provider.
- Production auth needs a verified email/phone provider and admin MFA; seeded demo accounts are disabled outside demo mode.
- Demo visuals are original illustrations labeled conceptual. Real projects, authorized media, RERA and legal disclosures are external prerequisites for launch.
- Dynamic taxes/fees and legally compliant advertised pricing require commercial and legal review before live use.
