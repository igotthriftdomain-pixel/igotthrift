# Development History & Architectural Milestone Log

> **Note:**  
> This document preserves the historical development milestones, original project specifications, and architectural evolution of the **`commerce-engine`** platform (built initially as the iGotThrift V1 release). For current implementation details, consult [AI_CONTEXT.md](../AI_CONTEXT.md) and [docs/ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 1. Project Conception & Objectives

The platform was conceived as a lightweight, high-performance WhatsApp Commerce SaaS platform inspired by modern Shopify themes. Rather than integrating complex web payment gateways (Stripe, Razorpay), the platform focuses on direct merchant-to-customer ordering over WhatsApp (`wa.me`).

### Initial Technical Targets
- Single Next.js application powering both Merchant Admin and Public Storefront.
- Multi-tenant PostgreSQL database via Supabase.
- Strict tenant isolation using Row Level Security (RLS).
- Direct browser-to-bucket image uploads via Supabase Storage.

---

## 2. Chronological Build Milestones

### Milestone 1: Project & Architecture Blueprint
- Defined Next.js 16 App Router folder layout with feature-driven architecture (`features/auth`, `features/store`, `features/products`, `features/categories`, `features/storefront`, `features/checkout`).
- Selected Supabase as standard backend (PostgreSQL, Auth, Storage).

### Milestone 2: Core Database Schema (Migrations 001–008)
- Designed schema tables: `profiles`, `stores`, `categories`, `products`, `product_images`.
- Created automated triggers: `update_updated_at_column` and `handle_new_user` (auto-creating public profile when an auth user registers).
- Added 12 performance indexes for foreign keys, slugs, and ownership lookups.

### Milestone 3: Authentication & Next.js 16 Routing Transition
- Implemented `@supabase/ssr` server client factory.
- Migrated legacy Next.js middleware to Next.js 16 Edge Proxy (`proxy.ts`), guarding `/dashboard`, `/products`, `/categories`, and `/settings`.
- Relocated `/login` page outside the `(merchant)` route group to prevent layout guard circular redirects.

### Milestone 4: Merchant Dashboard & Catalog Management
- Developed Merchant Portal UI with dark theme admin shell (`Sidebar`, `Header`).
- Built Products CRUD (`/products`, `/products/new`, `/products/[id]/edit`) with status filters, pricing fields, stock management, and soft-delete capabilities (`deleted_at`).
- Built Categories CRUD (`/categories`) with drag-and-drop sort order reordering via Postgres RPC (`reorder_categories`).

### Milestone 5: Brand Customization & Image Upload Pipeline
- Built Store Settings UI (`/settings`) for editing store name, description, WhatsApp number, theme color, address, and social links.
- Integrated direct file upload pipeline for store logos (`stores/{store_id}/logo.png`), banners (`stores/{store_id}/banner.png`), and product galleries (`products/{store_id}/{product_id}/{image_uuid}.webp`).
- Implemented dynamic storefront CSS custom property injection (`--store-primary`).

### Milestone 6: Public Storefront & Cart Context
- Built dynamic storefront route `/store/[slug]` with hero banner, category tab filters, and responsive product grid.
- Developed Product Detail page `/store/[slug]/product/[productSlug]` with multi-image gallery thumbnail selector.
- Created client-side `CartContext` with `localStorage` persistence and stock quantity limit caps.

### Milestone 7: Server-Verified WhatsApp Checkout & Order Logging
- Created `013_orders.sql` migration creating the `public.orders` logging table.
- Implemented `checkoutAction` server action to recalculate cart totals using DB prices and verify stock availability server-side.
- Automated `stock_quantity` decrements upon order submission.
- Built WhatsApp message formatter (`formatWhatsAppMessage`) and `wa.me` URL generator.

### Milestone 8: Security Hardening & Storage RLS Split (Migration 014)
- Identified Supabase Storage RLS issue with combined `FOR ALL` policies.
- Created `014_storage_policies_fix.sql` splitting storage policies into explicit `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies.
- Conducted full audit verifying 0 exposed service keys and 100% build pass rate.

### Milestone 9: Master Engine Generalization (`commerce-engine`)
- Renamed project package identity to `commerce-engine` in `package.json` and `package-lock.json`.
- Removed hardcoded `/store/igotthrift` redirects from `proxy.ts` and `app/page.tsx`, replacing them with dynamic `NEXT_PUBLIC_DEFAULT_STORE_SLUG`.
- Updated cart storage key to tenant-isolated `ce_cart_${storeId}` in `cart-context.tsx`.
- Removed customer-specific copy and placeholders from `app/login/page.tsx`, `storefront-footer.tsx`, and `store-settings-form.tsx`.
- Decoupled seed demo data from migration sequence in `009_seed_demo_store.sql`, creating reusable `supabase/provisioning/create-client-store.sql` and `supabase/seed/demo.sql`.
- Updated master documentation suite (`AI_CONTEXT.md`, `README.md`, `docs/*`).
