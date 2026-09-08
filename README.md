# commerce-engine (iGotThrift)

**commerce-engine** is a modular, high-performance WhatsApp Commerce SaaS platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **OpenNext**, and deployed on **Cloudflare Workers**, **Cloudflare D1 (SQL)**, and **Cloudflare R2 (Media Storage)**.

Designed as a lightweight ecommerce solution inspired by modern digital storefronts, `commerce-engine` allows merchants to showcase curated catalogs with rich media, manage stock and category taxonomies, and receive verified customer orders directly via WhatsApp.

---

## Technical Stack (Active Production)

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Edge Deployment Engine:** OpenNext (`@opennextjs/cloudflare`) on **Cloudflare Workers**
- **Database Backend:** **Cloudflare D1** (`igotthrift-db`, SQLite relational engine)
- **Media Storage:** **Cloudflare R2** (`igotthrift-media`, served via `https://assets.igotthrift.in`)
- **Authentication:** Web Crypto PBKDF2-HMAC-SHA256 password hashing + signed HttpOnly session cookies stored in D1
- **DNS & Custom Domains:** **Cloudflare DNS** (Registrar: GoDaddy)
  - Storefront: `https://igotthrift.in`
  - Canonical Redirect: `https://www.igotthrift.in` -> `https://igotthrift.in`
  - Merchant Portal: `https://admin.igotthrift.in`
  - Media CDN: `https://assets.igotthrift.in`
  - Rollback / Preview Worker: `https://igotthrift.igotthrift-domain.workers.dev`
- **Fallback Infrastructure (Preserved):** Legacy Vercel frontend & Supabase (PostgreSQL/Auth/Storage) retained strictly as dormant backup infrastructure.

---

## Core Features

- 🏪 **Public Storefront (`https://igotthrift.in`):** Dynamic theme color injection, responsive product grid, category tab filters, detail page with multi-image gallery.
- 🛍️ **WhatsApp Checkout:** Server-side price recalculation, stock quantity verification, D1 DB order logging, and pre-formatted `wa.me` customer order link generation.
- 🔐 **Merchant Dashboard (`https://admin.igotthrift.in`):** Protected merchant admin portal for managing products, categories, stock levels, and store branding assets.
- 🖼️ **R2 Media Asset Management:** Direct browser-to-R2 image uploads for product galleries, store logos, and custom hero banners served via `https://assets.igotthrift.in`.
- 🛡️ **D1 Tenant & Store Isolation:** Explicit store ownership verification enforcing strict merchant data boundary isolation.

---

## Project Documentation Sitemap

For full architectural blueprints, setup guides, and operational workflows, refer to the master documentation suite:

| Document | Purpose |
| :--- | :--- |
| [AI_CONTEXT.md](./AI_CONTEXT.md) | **Primary AI Entry Point** — Architecture rules, Cloudflare D1/R2 services, auth mechanisms, and system map. |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Comprehensive system architecture, module boundaries, routing layout, and Cloudflare Worker proxy mechanics. |
| [docs/DATABASE.md](./docs/DATABASE.md) | Complete database reference (Cloudflare D1 SQLite tables, indexes, and schema design). |
| [docs/CLIENT_PROVISIONING.md](./docs/CLIENT_PROVISIONING.md) | Workflow for provisioning new merchant stores on Cloudflare D1 & R2. |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Cloudflare Workers (Wrangler + OpenNext) production deployment guide, environment bindings, and custom domains. |
| [docs/PRODUCTION_CHECKLIST.md](./docs/PRODUCTION_CHECKLIST.md) | Pre-launch security audit, verification tests, and operational launch checklist for Cloudflare. |
| [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) | *[Legacy Fallback]* Supabase initialization guide retained for historical reference. |
| [docs/DEVELOPMENT_HISTORY.md](./docs/DEVELOPMENT_HISTORY.md) | Consolidated record of initial project specifications and build history. |

---

## Quickstart (Local Development)

### 1. Prerequisites
- Node.js 20+
- npm / pnpm
- Cloudflare Wrangler CLI (`npx wrangler`)

### 2. Local Environment Setup
Populate `.env.local`:
```env
NEXT_PUBLIC_DEFAULT_STORE_SLUG=igotthrift
```

### 3. Local D1 Database Initialization
To bootstrap local D1 database schema and developer seeds:
```bash
npx wrangler d1 execute igotthrift-db --local --file=d1/schema.sql
npx wrangler d1 execute igotthrift-db --local --file=d1/seed.sql
```

### 4. Install Dependencies & Run
```bash
npm install
npm run dev
```

Open `http://localhost:3000` to launch the local storefront application.

---

## Deployment Workflow

- **Local Preview:** `npx wrangler dev`
- **Production Build:** `npm run build`
- **Cloudflare Worker Deploy:** `npx wrangler deploy` (Manual deploy workflow currently active; CI/CD pipeline pending).

---

## License & Ownership

Private SaaS Engine — All rights reserved.
