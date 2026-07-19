# commerce-engine

**commerce-engine** is a modular, high-performance, single-tenant / multi-tenant WhatsApp Commerce SaaS platform built with **Next.js 16 (Turbopack)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage, RLS)**.

Designed as a lightweight ecommerce solution inspired by modern, high-converting digital storefronts, `commerce-engine` allows merchants to showcase curated catalogs with rich media, manage stock and category taxonomies, and receive verified customer orders directly via WhatsApp.

---

## Technical Stack

- **Framework:** Next.js 16 (App Router with Turbopack, React 19)
- **Database & Auth:** Supabase (PostgreSQL with RLS, Supabase Auth, Storage Buckets)
- **Styling:** Tailwind CSS v4, Lucide Icons, `tw-animate-css`
- **Validation & State:** Zod, React Context (`CartContext`, `MerchantContext`), Sonner toasts
- **Deployment:** Vercel (Frontend & Proxy), Supabase (Managed Postgres & Storage)

---

## Core Features

- 🏪 **Public Storefront (`/store/[slug]`):** Dynamic theme color injection, responsive product grid, category tab filters, detail page with multi-image gallery.
- 🛍️ **WhatsApp Checkout:** Server-side price recalculation, stock quantity verification, DB order logging, and pre-formatted `wa.me` customer order link generation.
- 🔐 **Merchant Dashboard (`/dashboard`):** Protected merchant admin portal for managing products, categories, stock levels, and store branding assets.
- 🖼️ **Asset Management:** Direct browser-to-Supabase Storage image uploads for product galleries, store logos, and custom hero banners.
- 🛡️ **Row Level Security (RLS):** Strict PostgreSQL tenant isolation ensuring merchants can only read and mutate their own store data.

---

## Project Documentation Sitemap

For full architectural blueprints, setup guides, and operational workflows, refer to the master documentation suite:

| Document | Purpose |
| :--- | :--- |
| [AI_CONTEXT.md](./AI_CONTEXT.md) | **Primary AI Entry Point** — Architecture rules, code conventions, state representation, and system map for AI developers. |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Comprehensive system architecture, module boundaries, routing layout, and tenant isolation mechanics. |
| [docs/DATABASE.md](./docs/DATABASE.md) | Complete PostgreSQL database reference (tables, triggers, indexes, RLS policies, storage bucket rules). |
| [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) | Step-by-step Supabase initialization, authentication settings, bucket configuration, and migration execution guide. |
| [docs/CLIENT_PROVISIONING.md](./docs/CLIENT_PROVISIONING.md) | Repeatable workflow for deploying independent merchant stores from the `commerce-engine` master repository. |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Vercel production deployment guide, environment variable configuration, and custom domain mapping. |
| [docs/PRODUCTION_CHECKLIST.md](./docs/PRODUCTION_CHECKLIST.md) | Pre-launch security audit, verification tests, and operational launch checklist. |
| [docs/DEVELOPMENT_HISTORY.md](./docs/DEVELOPMENT_HISTORY.md) | Consolidated record of initial project specifications, architectural decisions, and V1 build milestones. |

---

## Quickstart (Local Development)

### 1. Prerequisites
- Node.js 20+
- npm / pnpm / yarn
- A Supabase project

### 2. Environment Setup
Copy the example environment file and configure your Supabase credentials:

```bash
cp .env.example .env.local
```

Populate `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_DEFAULT_STORE_SLUG=demo
```

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
```

Open `http://localhost:3000` to launch the local application.

---

## License & Ownership

Private SaaS Engine — All rights reserved.
