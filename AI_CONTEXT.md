# AI_CONTEXT.md — Primary AI Developer Entry Point

> **Instructions for AI Coding Assistants:**  
> When a user says *"Read AI_CONTEXT.md and continue development"* or starts a new coding session, read this entire file first. This file contains the complete system architecture, operational state, conventions, security constraints, database relationships, and strict developer rules for **`commerce-engine`** (iGotThrift).

---

## 1. Project Overview & Identity

**`commerce-engine`** (iGotThrift) is a production-ready, modular WhatsApp Commerce SaaS platform. It enables merchants to run high-converting online storefronts without a traditional web payment gateway. Order placement is handled via verified server-side stock checks and formatted WhatsApp (`wa.me`) messages sent directly to the merchant's registered WhatsApp number.

### Core Value Proposition
- **No Payment Gateway Fees:** Customers place orders directly via WhatsApp.
- **Strict Stock & Price Verification:** Orders are recalculated and stock verified on the server before generating the WhatsApp message link.
- **Edge Architecture:** Deployed on **Cloudflare Workers** with **Cloudflare D1** (SQLite relational database) and **Cloudflare R2** (Media storage CDN).
- **Tenant & Store Isolation:** Explicit merchant store ownership enforcement across stores, products, categories, images, and orders.
- **Zero-Code Branding:** Storefront theme colors, logos, and banners are updated in real time by merchants from the admin portal without code deployments.
- **Self-Service Merchant Security:** PBKDF2-HMAC-SHA256 Web Crypto password hashing, signed HttpOnly session cookies, self-service merchant password change, and tokenized password reset.
- **Fallback Infrastructure (Preserved):** Legacy Supabase (PostgreSQL/Auth/Storage) and Vercel hosting are retained strictly as dormant fallback infrastructure.

---

## 2. Production Completion Status & Verification

As of **September 2026**, **`commerce-engine` is 100% migrated to Cloudflare, feature-complete, and live**:
- **Production Domains:**
  - Public Storefront: `https://igotthrift.in`
  - Canonical Redirect: `https://www.igotthrift.in` -> `https://igotthrift.in`
  - Merchant Portal: `https://admin.igotthrift.in`
  - Media CDN: `https://assets.igotthrift.in`
  - Rollback / Preview Worker: `https://igotthrift.igotthrift-domain.workers.dev`
- **DNS Configuration:** Managed on **Cloudflare DNS** (Authoritative NS: `angela.ns.cloudflare.com`, `sage.ns.cloudflare.com`; Registrar: GoDaddy).
- **Build Status:** `npm run build` compiles with **0 errors** (Next.js 16 App Router on OpenNext Turbopack across 13 routes).
- **TypeScript:** **0 type errors** (`npx tsc --noEmit`).
- **Linting:** **0 errors** (`npm run lint`).
- **Security Audit:** PBKDF2 Web Crypto password hashing (100,000 iterations), HMAC SHA-256 signed session cookies, 0 hardcoded secrets, `.env*` properly gitignored, all sensitive routes guarded by Next.js 16 proxy middleware (`proxy.ts`).

---

## 3. Technology Stack & Key Libraries

| Component | Technology | Specific Version / Note |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | App Router with Turbopack, React 19 |
| **Deployment Engine** | OpenNext on Cloudflare Workers | `@opennextjs/cloudflare`, `wrangler.jsonc`, `open-next.config.ts` |
| **Database** | Cloudflare D1 | `igotthrift-db` (ID: `0d01bcf7-3cb7-495f-9eb1-ca63b6523208`), SQLite relational engine (`lib/db/index.ts`) |
| **Media Storage** | Cloudflare R2 | `igotthrift-media` bucket bound to `MEDIA_BUCKET`, public CDN `https://assets.igotthrift.in` (`lib/storage/index.ts`) |
| **Auth & Security** | Web Crypto API | PBKDF2-HMAC-SHA256 hashing, HMAC signed `merchant_session` cookie (`lib/auth/password.ts`, `session.ts`) |
| **Styling** | Tailwind CSS v4 | PostCSS v4 plugin, custom CSS properties for dynamic store themes |
| **Icons & UI** | Lucide Icons, `@base-ui/react` | Modern UI components, Sonner toasts |
| **Validation** | Zod v4 | Form & API input validation schemas |

---

## 4. Application Architecture & Folder Structure

```
commerce-engine/
├── app/                        # Next.js App Router root
│   ├── (merchant)/             # Route group for protected merchant dashboard
│   │   ├── layout.tsx          # Merchant layout (Sidebar, Header, Auth guard check)
│   │   ├── dashboard/          # Dashboard home (/dashboard)
│   │   ├── products/           # Product list (/products), new (/products/new), edit (/products/[id]/edit)
│   │   ├── categories/         # Category manager (/categories)
│   │   └── settings/           # Store branding, WhatsApp & Account Security (/settings)
│   ├── login/                  # Merchant login page (/login) with "Forgot password?" link
│   ├── forgot-password/        # Password recovery request page (/forgot-password)
│   ├── reset-password/         # Set new password page (/reset-password)
│   ├── auth/callback/          # Password reset token callback route
│   ├── store/                  # Customer storefront routes
│   │   └── [slug]/             # Dynamic storefront (/store/[slug])
│   │       ├── layout.tsx      # Storefront theme provider layout
│   │       ├── page.tsx        # Storefront home page (hero, categories, product grid)
│   │       └── product/        # Product detail route
│   ├── layout.tsx              # Root HTML/body layout
│   ├── page.tsx                # Root redirect page (redirects / to DEFAULT_STORE_SLUG)
│   └── favicon.ico
├── features/                   # Modular feature domains
│   ├── auth/                   # Login, change password, forgot password, reset password actions & schemas
│   ├── store/                  # Store service layer, actions, schemas (`features/store/service.ts`)
│   ├── products/               # Product CRUD, R2 image uploads, table views (`features/products/service.ts`)
│   ├── categories/             # Category CRUD, reordering actions (`features/categories/service.ts`)
│   ├── storefront/             # Public store views, cart context (`features/storefront/service.ts`)
│   └── checkout/               # WhatsApp order validation & wa.me generator (`features/checkout/service.ts`)
├── lib/                        # Core infrastructure layer
│   ├── db/                     # Direct Cloudflare D1 database driver (`lib/db/index.ts`)
│   ├── storage/                # Cloudflare R2 storage driver (`lib/storage/index.ts`)
│   ├── auth/                   # Web Crypto PBKDF2 & session cookie helpers (`password.ts`, `session.ts`)
│   └── utils.ts                # General utilities
├── d1/                         # Cloudflare D1 SQL schemas & migrations
│   ├── schema.sql              # Master D1 SQLite database schema
│   ├── seed.sql                # Local development seed data script
│   └── migrations/             # Wrangler D1 migration files (`0001_initial_schema.sql`)
├── supabase/                   # [Legacy Fallback] Supabase SQL migrations & provisioning scripts
├── proxy.ts                    # Next.js 16 routing proxy & domain rewrite middleware
├── open-next.config.ts         # OpenNext Cloudflare adapter config
├── wrangler.jsonc              # Cloudflare Worker configuration & D1/R2 bindings
├── docs/                       # Complete system documentation suite
├── README.md                   # Repository overview
└── AI_CONTEXT.md               # This file
```

---

## 5. Architectural Blueprint & Data Flow

### A. Authentication & Session Management
- **Password Security:** Passwords are hashed using PBKDF2-HMAC-SHA256 (100,000 iterations, 16-byte salt via Web Crypto API) in `lib/auth/password.ts`.
- **Session Cookies:** Upon successful login, an HttpOnly, Secure, SameSite=Lax `merchant_session` cookie is issued containing the user ID, store ID, and an HMAC-SHA256 signature.
- **Middleware Guard (`proxy.ts`):** Unauthenticated requests to `/dashboard`, `/products`, `/categories`, `/settings` redirect to `/login`. Authenticated requests to `/login` redirect to `/dashboard`.

### B. Tenant Isolation & Store Ownership
- **Data Isolation:** Every business table (`stores`, `categories`, `products`, `orders`) stores `store_id` (UUID).
- **Merchant Verification:** On login or API actions, `getStoreByOwner(userId)` checks the store `owner_id`. All data operations are scoped explicitly by `store_id`.

### C. Public Storefront Resolution
- **Domain Routing:** `https://igotthrift.in` (or subdomains like `admin.igotthrift.in`) are evaluated by `proxy.ts`.
- **Theme Injection:** Storefront layout extracts `store.theme_color` and injects CSS custom properties (`--store-primary`, `--store-primary-hover`).

---

## 6. Database Schema Summary (Cloudflare D1)

```
   users (id, email, password_hash, created_at, updated_at)
      │
      ▼ (FK: profiles.id -> users.id)
   profiles (id, email, full_name, avatar_url, updated_at)
      │
      ▼ (FK: stores.owner_id -> users.id)
   stores (id, owner_id, name, slug, description, logo_url, banner_url, whatsapp_number, theme_color, currency_code, currency_symbol, ...)
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼ (FK: store_id)                ▼ (FK: store_id)                ▼ (FK: store_id)
   categories                      products                        orders
   (id, store_id, name,            (id, store_id, category_id,     (id, store_id, customer_name,
    slug, sort_order, active)       name, slug, price, stock,       customer_phone, customer_address,
                                    published_at, deleted_at)      cart_snapshot, total_amount, status)
                                      │
                                      ▼ (FK: product_id)
                                  product_images
                                  (id, product_id, storage_path, display_order)
```

---

## 7. Storage Bucket & Asset Architecture (Cloudflare R2)

- **R2 Bucket Name:** `igotthrift-media` (Bound as `MEDIA_BUCKET` in `wrangler.jsonc`)
- **Public Domain:** `https://assets.igotthrift.in` (`NEXT_PUBLIC_R2_PUBLIC_URL`)
- **Storage Driver (`lib/storage/index.ts`):** Direct upload, retrieval, and delete operations via Cloudflare Worker R2 binding.

---

## 8. Current Environment Variables

```env
# Default Storefront Routing
NEXT_PUBLIC_DEFAULT_STORE_SLUG=igotthrift

# Production Public R2 Media Domain (Configured in wrangler.jsonc)
NEXT_PUBLIC_R2_PUBLIC_URL=https://assets.igotthrift.in
```

---

## 9. Developer Rules & Conventions

When modifying or expanding **`commerce-engine`**, AI developers MUST strictly adhere to the following rules:

1. **Next.js 16 Proxy Convention:** Do NOT create a `middleware.ts` file in the root directory. Next.js 16 uses `proxy.ts` exported with `export async function proxy(request: NextRequest)`.
2. **Cloudflare D1 Query Execution:** All database operations must go through `lib/db/index.ts` using prepared D1 statements.
3. **Cloudflare R2 Asset Uploads:** Product, logo, and banner uploads must use `lib/storage/index.ts` against the `MEDIA_BUCKET` binding.
4. **Never Trust Client Prices:** In checkout workflows, always recalculate prices on the server by querying `products` directly in D1.
5. **Soft Deletion for Products:** Products must never be hard-deleted if orders exist. Set `deleted_at = DATETIME('now')`.
6. **No Exposed Secrets:** Never place `SESSION_SECRET` or private tokens in `NEXT_PUBLIC_` variables or client-side code.
7. **No Git Commits or Unscheduled Deploys:** Never run `git commit`, `git push`, or `wrangler deploy` without explicit user request.
