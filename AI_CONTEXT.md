# AI_CONTEXT.md — Primary AI Developer Entry Point

> **Instructions for AI Coding Assistants:**  
> When a user says *"Read AI_CONTEXT.md and continue development"* or starts a new coding session, read this entire file first. This file contains the complete system architecture, operational state, conventions, security constraints, database relationships, and strict developer rules for **`commerce-engine`**.

---

## 1. Project Overview & Identity

**`commerce-engine`** is a production-ready, modular WhatsApp Commerce SaaS platform. It enables merchants to run high-converting online storefronts without a traditional web payment gateway. Instead, order placement is handled via verified server-side stock checks and formatted WhatsApp (`wa.me`) messages sent directly to the merchant's registered WhatsApp number.

### Core Value Proposition
- **No Payment Gateway Fees:** Customers place orders directly via WhatsApp.
- **Strict Stock & Price Verification:** Orders are recalculated and stock verified on the server before generating the WhatsApp message link.
- **Tenant Isolation:** Multi-tenant PostgreSQL architecture enforcing Row Level Security (RLS) across stores, products, categories, images, and orders.
- **Zero-Code Branding:** Storefront theme colors, logos, and banners are updated in real time by merchants from the admin portal without code deployments.
- **Self-Service Merchant Security:** Logged-in password changes and self-service email recovery (`/forgot-password` → `/auth/callback` → `/reset-password`).
- **Isolated Deployment Strategy:** Each client receives an independent Supabase project, Vercel deployment, and GitHub clone of `commerce-engine`.

---

## 2. Production Completion Status & Verification

As of **July 2026**, **`commerce-engine` is 100% feature-complete, generalized, and verified**:
- **Build Status:** `npm run build` compiles with **0 errors** (Next.js 16 Turbopack across 13 routes).
- **TypeScript:** **0 type errors**.
- **Linting:** **0 errors and 0 warnings** (`npm run lint`).
- **Security Audit:** 0 hardcoded service-role keys, 0 exposed database credentials, `.env*` properly gitignored, all sensitive routes guarded by Next.js 16 proxy middleware.
- **Password Management:** Self-service merchant password change (`ChangePasswordForm`) and email recovery flow (`/forgot-password`, `/auth/callback`, `/reset-password`) fully implemented with Supabase Auth API.

---

## 3. Technology Stack & Key Libraries

| Component | Technology | Specific Version / Note |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Uses `proxy.ts` convention (middleware replacement) with Turbopack |
| **Language** | TypeScript 5 | Strict typing enabled (`tsconfig.json`) |
| **Database** | Supabase PostgreSQL | Managed Postgres with RLS policies and extensions |
| **Auth** | Supabase Auth | Cookie-based session management via `@supabase/ssr` with email password recovery |
| **Storage** | Supabase Storage | `store-assets` public bucket for logos, banners, product images |
| **Styling** | Tailwind CSS v4 | PostCSS v4 plugin, custom CSS properties for dynamic store themes |
| **Icons & UI** | Lucide Icons, `@base-ui/react` | Modern, clean UI components |
| **Toast & Form** | Sonner, Zod v4 | Form validation schemas & toast notifications |

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
│   ├── forgot-password/        # Password recovery email request page (/forgot-password)
│   ├── reset-password/         # Set new password page (/reset-password)
│   ├── auth/                   # Supabase Auth callback handler
│   │   └── callback/           # /auth/callback - exchanges token code & redirects to /reset-password
│   ├── store/                  # Customer storefront routes
│   │   └── [slug]/             # Dynamic storefront (/store/[slug])
│   │       ├── layout.tsx      # Storefront theme provider layout
│   │       ├── page.tsx        # Storefront home page (hero, categories, product grid)
│   │       └── product/        # Product detail route
│   │           └── [productSlug]/ page.tsx
│   ├── layout.tsx              # Root HTML/body layout (Geist font, Sonner toast provider)
│   ├── page.tsx                # Root redirect page (redirects / to DEFAULT_STORE_SLUG)
│   └── favicon.ico
├── features/                   # Modular feature domains
│   ├── auth/                   # Login, change password, forgot password, reset password schemas & actions
│   │   ├── actions.ts          # `loginAction`, `logoutAction`, `changePasswordAction`, `requestPasswordResetAction`, `resetPasswordAction`
│   │   ├── components/         # `ChangePasswordForm` (Account security component)
│   │   ├── schema.ts           # Zod validation schemas
│   │   └── service.ts          # Auth user retrieval (`getCurrentUser`)
│   ├── store/                  # Merchant store management, actions, schemas, types, service helpers
│   ├── products/               # Product CRUD, image uploads, table components, editor forms
│   ├── categories/             # Category CRUD, reordering actions, table views
│   ├── storefront/             # Public store views, product grid, gallery, cart context provider
│   └── checkout/               # WhatsApp order validation actions, checkout sheet UI, wa.me link generator
├── components/                 # Shared UI components
├── lib/                        # Core infrastructure helpers (`lib/supabase/server.ts`, `client.ts`, `middleware.ts`)
├── supabase/                   # Migration scripts & SQL schemas
│   ├── migrations/             # 001 through 014 SQL migrations (Clean schema definitions)
│   ├── provisioning/           # Reusable client provisioning SQL template (`create-client-store.sql`)
│   └── seed/                   # Optional local development demo data (`demo.sql`)
├── proxy.ts                    # Next.js 16 routing proxy & route protection middleware
├── docs/                       # Complete system documentation suite
├── README.md                   # Repository overview
└── AI_CONTEXT.md               # This file
```

---

## 5. Architectural Blueprint & Data Flow

### A. Authentication & Session Management
- **Proxy Middleware (`proxy.ts`):** Intercepts `/dashboard`, `/products`, `/categories`, and `/settings`.
- **Session Check:** Uses `updateSession(request)` in `lib/supabase/middleware.ts` to refresh `@supabase/ssr` cookies.
- **Unauthenticated Access:** Redirects protected route visits to `/login`.
- **Already Authenticated:** Accessing `/login` while logged in redirects to `/dashboard`.
- **Merchant Layout Guard:** `app/(merchant)/layout.tsx` performs server-side check via `getCurrentUser()`. Calls `redirect("/login")` if unauthenticated.

### B. Merchant Password Management
1. **Authenticated Change Password (`/settings`):**
   - `<ChangePasswordForm />` renders an Account Security card inside `/settings`.
   - Validates inputs via `changePasswordSchema` (min 6 chars, passwords match).
   - Calls `changePasswordAction()` → updates password via `supabase.auth.updateUser({ password })`.
2. **Unauthenticated Forgot Password Flow (`/forgot-password` → `/auth/callback` → `/reset-password`):**
   - Merchant clicks "Forgot password?" on `/login`.
   - On `/forgot-password`, merchant enters email → calls `requestPasswordResetAction({ email }, origin)`.
   - Supabase dispatches email containing recovery URL: `${origin}/auth/callback?next=/reset-password`.
   - Clicking link invokes `app/auth/callback/route.ts` → calls `supabase.auth.exchangeCodeForSession(code)` and redirects to `/reset-password`.
   - On `/reset-password`, merchant sets new password → calls `resetPasswordAction()` → redirects to `/login`.

### C. Tenant Isolation & Store Ownership
- **Data Isolation:** Every business table (`stores`, `categories`, `products`, `orders`) stores `store_id` (UUID).
- **Merchant Lookup:** On login, `getStoreByOwner(user.id)` fetches the single `stores` row where `owner_id = user.id`.
- **Context Injection:** `app/(merchant)/layout.tsx` wraps dashboard in `<MerchantProvider store={store}>`.
- **Row Level Security (RLS):** Tables enforce `owner_id = auth.uid()` or `store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())`.

### D. Public Storefront Resolution
- **Route:** `/store/[slug]` (or root `/` resolving to `NEXT_PUBLIC_DEFAULT_STORE_SLUG`).
- **Resolution:** `getStoreBySlug(slug)` queries `public.stores` by `slug`.
- **Dynamic Styling:** Storefront layout extracts `store.theme_color` and injects CSS custom properties (`--store-primary`, `--store-primary-hover`, `--store-accent`).

---

## 6. Database Schema Summary

The database uses PostgreSQL with Supabase RLS.

```
  auth.users (Supabase Managed)
      │
      ▼ (Trigger: handle_new_user)
  public.profiles (id, email, updated_at)
      │
      ▼ (FK: stores.owner_id -> profiles.id)
  public.stores (id, owner_id, name, slug, description, logo_url, banner_url, whatsapp_number, theme_color, currency_code, currency_symbol, ...)
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼ (FK: store_id)                ▼ (FK: store_id)                ▼ (FK: store_id)
  public.categories               public.products                 public.orders
  (id, store_id, name,            (id, store_id, category_id,     (id, store_id, customer_name,
   slug, sort_order, active)       name, slug, price, stock,       customer_phone, customer_address,
                                   published_at, deleted_at)      cart_snapshot, total_amount, status)
                                      │
                                      ▼ (FK: product_id)
                                  public.product_images
                                  (id, product_id, storage_path, display_order)
```

---

## 7. Storage Bucket & Asset Architecture

- **Bucket Name:** `store-assets` (Public bucket)
- **Path Schemes:**
  - Logos: `stores/{store_id}/logo.png` (or `.webp`)
  - Banners: `stores/{store_id}/banner.png` (or `.webp`)
  - Product Gallery: `products/{store_id}/{product_id}/{image_uuid}.webp`
- **Storage RLS Policies (Migration 014):**
  - **SELECT:** Public read access allowed for `store-assets`.
  - **INSERT/UPDATE/DELETE:** Restricted to store owners where `name LIKE 'stores/' || store_id || '/%'` or `name LIKE 'products/' || store_id || '/%'`.

---

## 8. Current Environment Variables

```env
# Supabase Backend Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI...

# Default Storefront Routing
NEXT_PUBLIC_DEFAULT_STORE_SLUG=demo
```

---

## 9. Developer Rules & Conventions

When modifying or expanding **`commerce-engine`**, AI developers MUST strictly adhere to the following rules:

1. **Next.js 16 Proxy Convention:** Do NOT create a `middleware.ts` file in the root directory. Next.js 16 uses `proxy.ts` exported with `export async function proxy(request: NextRequest)`.
2. **No Ad-Hoc Styling Utilities:** Use Tailwind CSS classes consistent with existing shadcn/ui components. Maintain high-contrast dark/light mode support using `dark:` variants.
3. **Never Trust Client Prices:** In checkout workflows, always recalculate prices on the server by querying `public.products` directly.
4. **Soft Deletion for Products:** Products must never be hard-deleted from Postgres if orders exist. Set `deleted_at = NOW()`.
5. **Idempotency in DB Migrations:** All new SQL migrations must use `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` statements.
6. **No Exposed Service Keys:** Never place `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_` variables or client-side code.
7. **No Hardcoded Store Slugs in Code:** Always retrieve storefront slug dynamically from route params or `NEXT_PUBLIC_DEFAULT_STORE_SLUG`.
