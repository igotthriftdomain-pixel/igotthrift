# System Architecture Blueprint

This document details the high-level architecture, module boundaries, routing layout, and multi-tenant data structures of **`commerce-engine`**.

---

## 1. High-Level Architecture Overview

`commerce-engine` is built as a single Next.js 16 application backed by Supabase. It presents two primary operational portals:

1. **Merchant Portal (Protected Admin):** Used by store owners to manage products, categories, stock allocations, theme colors, and store details.
2. **Customer Storefront (Public E-Commerce):** Used by shoppers to browse catalog items, view product image galleries, filter by categories, build a shopping cart, and place orders via WhatsApp.

```
                              ┌──────────────────────────────────┐
                              │          Client Browser          │
                              └────────────────┬─────────────────┘
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
         ┌──────────────────────────────┐              ┌──────────────────────────────┐
         │      Merchant Dashboard      │              │      Customer Storefront     │
         │         (/dashboard)         │              │        (/store/[slug])       │
         └──────────────┬───────────────┘              └──────────────┬───────────────┘
                        │                                             │
                        │ (Server Actions & SSR)                      │ (Server Components & Actions)
                        ▼                                             ▼
         ┌────────────────────────────────────────────────────────────────────────────┐
         │                              Next.js 16 App Router                         │
         │                    (proxy.ts Route Protection Middleware)                  │
         └──────────────────────────────────────┬─────────────────────────────────────┘
                                                │
                                                ▼
         ┌────────────────────────────────────────────────────────────────────────────┐
         │                               Supabase Backend                             │
         │   ┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────┐   │
         │   │   Supabase Auth      │ │ PostgreSQL (+ RLS)   │ │  Storage Bucket   │   │
         │   │ (Email & Password)   │ │ (Multi-Tenant DB)    │ │  (store-assets)   │   │
         │   └──────────────────────┘ └──────────────────────┘ └───────────────────┘   │
         └────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Router & Layout Structure

The application uses Next.js 16 App Router conventions with two route groups:

```
app/
├── (merchant)/                 # Layout boundary for authenticated merchant admin
│   ├── layout.tsx              # Merchant shell: Sidebar + Header + Server-side Auth Guard
│   ├── dashboard/              # /dashboard - Overview metrics & store quick links
│   ├── products/               # /products - Catalog table view
│   │   ├── new/                # /products/new - Add product form
│   │   └── [id]/edit/          # /products/[id]/edit - Edit product form
│   ├── categories/             # /categories - Category taxonomy & drag-reorder
│   └── settings/               # /settings - Branding, theme color & WhatsApp settings
├── login/                      # /login - Merchant authentication page (outside (merchant))
├── store/                      # Public storefront route group
│   └── [slug]/                 # /store/[slug] - Dynamic storefront by slug
│       ├── layout.tsx          # Storefront shell: injects dynamic CSS theme colors & CartProvider
│       ├── page.tsx            # Storefront home: hero banner, categories, product grid
│       └── product/
│           └── [productSlug]/  # /store/[slug]/product/[productSlug] - Product detail page
├── layout.tsx                  # Root layout: Geist font, Sonner toast notifications
└── page.tsx                    # Root landing page: redirects / to NEXT_PUBLIC_DEFAULT_STORE_SLUG
```

---

## 3. Route Protection & Auth Middleware (`proxy.ts`)

Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. Route protection operates in a two-tier defense structure:

### Tier 1: Edge Proxy (`proxy.ts`)
```ts
const PROTECTED_ROUTES = ["/dashboard", "/categories", "/products", "/settings"];
const LOGIN_ROUTE = "/login";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  if (pathname === "/") {
    const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || "demo";
    url.pathname = `/store/${defaultSlug}`;
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isLoginRoute = pathname === LOGIN_ROUTE;

  if (isProtectedRoute || isLoginRoute) {
    const { user, supabaseResponse } = await updateSession(request);

    if (!user && isProtectedRoute) {
      url.pathname = LOGIN_ROUTE;
      return NextResponse.redirect(url);
    }
    if (user && isLoginRoute) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }
  return NextResponse.next();
}
```

### Tier 2: Merchant Layout Guard (`app/(merchant)/layout.tsx`)
```ts
export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const store = await getStoreByOwner(user.id);
  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-zinc-500">
        Store configuration not found. Please contact support.
      </div>
    );
  }

  return (
    <MerchantProvider store={store}>
      <div className="flex min-h-screen bg-zinc-900 text-zinc-100">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </MerchantProvider>
  );
}
```

---

## 4. Feature Domain Architecture (`features/`)

`commerce-engine` isolates application logic into clean domain modules inside `features/`:

```
features/
├── auth/
│   ├── actions.ts              # Server actions (`loginAction`, `logoutAction`)
│   ├── schema.ts               # Zod validation (`loginSchema`)
│   ├── service.ts              # Auth user retrieval (`getCurrentUser`)
│   └── types.ts                # Type definitions
├── store/
│   ├── actions.ts              # Settings updates & image upload actions
│   ├── components/             # `StoreSettingsForm` component
│   ├── schema.ts               # Store settings Zod validation schema
│   ├── service.ts              # DB queries (`getStoreByOwner`, `getStoreSettings`, `uploadLogo`)
│   └── types.ts                # Store interface definitions
├── products/
│   ├── actions.ts              # Product CRUD actions (`createProductAction`, `deleteProductAction`)
│   ├── components/             # `ProductsTable`, `ProductsView`, `ProductEditorForm`
│   ├── schema.ts               # Product Zod validation schema
│   ├── service.ts              # DB queries & Supabase Storage upload helpers
│   └── types.ts                # `Product`, `ProductWithCategoryAndImages` types
├── categories/
│   ├── actions.ts              # Category CRUD actions & reorder RPC invocation
│   ├── components/             # `CategoriesView`, `CategoryDialog`
│   ├── schema.ts               # Category validation schema
│   ├── service.ts              # Category queries (`getCategories`)
│   └── types.ts                # Category interface definitions
├── storefront/
│   ├── components/             # `StorefrontHeader`, `HeroBanner`, `ProductGrid`, `ProductGallery`
│   ├── context/                # `CartContext` provider & localStorage persistence (`ce_cart_${storeId}`)
│   ├── service.ts              # Public storefront queries (`getStoreBySlug`, `getProductsByStore`)
│   └── types.ts                # Storefront view model definitions
└── checkout/
    ├── actions.ts              # `checkoutAction` (Server-side price verification & WhatsApp link generation)
    ├── components/             # `CheckoutSheet`, `CustomerForm`, `OrderSummary`
    ├── schema.ts               # Checkout form Zod validation schema
    ├── service.ts              # `verifyStockAndPrices`, `createOrderRecord`
    └── utils.ts                # WhatsApp message formatter (`formatWhatsAppMessage`, `generateWhatsAppLink`)
```

---

## 5. Multi-Tenant Isolation Model

### Database Tier Isolation
All merchant data rows store a `store_id` referencing `public.stores.id`.

### Store Ownership Model
- 1 Merchant User (`auth.users`) ──► 1 Profile (`public.profiles`) ──► 1 Store (`public.stores`).
- RLS policies ensure PostgreSQL restricts mutation operations strictly to `owner_id = auth.uid()`.

### Public Storefront Read Model
- Customers browse `/store/[slug]` anonymously without authentication.
- Read operations query `public.stores` by `slug` where `active = true`.
- RLS policies permit `SELECT` for public users on active stores, published categories, published products, and product images.

---

## 6. Dynamic Storefront Theme System

When a customer loads `/store/[slug]`, `app/store/[slug]/layout.tsx` fetches the store record and injects dynamic CSS custom properties:

```tsx
<div
  style={{
    "--store-primary": store.themeColor,
    "--store-primary-hover": `color-mix(in srgb, ${store.themeColor} 85%, black)`,
    "--store-accent": `color-mix(in srgb, ${store.themeColor} 15%, transparent)`,
  } as React.CSSProperties}
  className="min-h-screen bg-zinc-50 dark:bg-zinc-950"
>
  <CartProvider storeId={store.id}>
    <StorefrontHeader store={store} />
    {children}
    <StorefrontFooter store={store} />
  </CartProvider>
</div>
```

Buttons, badges, borders, and accent highlights on the storefront consume `var(--store-primary)` dynamically, enabling instant merchant color customization without code deployment.
