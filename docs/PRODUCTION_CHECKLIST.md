# Production Launch Verification Checklist

Use this checklist before releasing any new merchant store provisioned with **`commerce-engine`**.

---

## 1. Environment & Build Integrity
- [ ] `npm run build` executes locally and on Vercel with **0 errors**.
- [ ] `npm run lint` passes with 0 critical errors.
- [ ] `.env.local` and secret files are excluded from git repository (`.gitignore` verified).
- [ ] Production environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEFAULT_STORE_SLUG`) set on Vercel.
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` present in frontend code or environment variables.

---

## 2. Supabase Infrastructure & Database
- [ ] All schema migrations (001–008, 010–014) applied to production database.
- [ ] Row Level Security (RLS) enabled on all 6 public tables (`profiles`, `stores`, `categories`, `products`, `product_images`, `orders`).
- [ ] Storage bucket `store-assets` created and set to **Public**.
- [ ] Storage RLS policies (Migration 014) verified in `pg_policies`.
- [ ] Auth trigger `on_auth_user_created` verified active on `auth.users`.
- [ ] Merchant `auth.users` account created and linked to single `public.stores` row via `owner_id`.

---

## 3. Merchant Portal Verification (`/dashboard`)
- [ ] Navigating to `/dashboard` while unauthenticated redirects to `/login`.
- [ ] Merchant login with credentials succeeds and redirects to `/dashboard`.
- [ ] Navigating to `/login` while authenticated redirects to `/dashboard`.
- [ ] `/categories` page permits creating, editing, and drag-reordering categories.
- [ ] `/products/new` permits creating a new product with images, price, compare-at price, and category assignment.
- [ ] `/products` table displays product status badges, pricing, stock levels, and search filter.
- [ ] `/products/[id]/edit` permits modifying product pricing, description, stock quantity, and gallery images.
- [ ] `/settings` page permits updating Store Name, Description, WhatsApp number, Theme Color, Logo, Banner, and Social links.
- [ ] Store Logo and Banner upload successfully to `store-assets` bucket and render immediate previews.
- [ ] Sign Out button clears session and redirects to `/login`.

---

## 4. Public Storefront Verification (`/store/[slug]`)
- [ ] Navigating to `/store/[valid-slug]` renders hero banner, store logo, dynamic theme color, and product grid.
- [ ] Navigating to `/store/[invalid-slug]` returns Next.js 404 page.
- [ ] Category tabs filter products correctly.
- [ ] Clicking a product card navigates to `/store/[slug]/product/[productSlug]`.
- [ ] Product detail page displays image gallery with selectable thumbnails, price, compare-at discount badge, description, and stock availability.

---

## 5. Cart & WhatsApp Checkout Verification
- [ ] Clicking "Add to Cart" updates cart badge count.
- [ ] Attempting to add more items than available in `stock_quantity` shows stock cap toast notification.
- [ ] Cart drawer displays item list, image thumbnails, price per item, quantity controls, and subtotal calculation.
- [ ] Refreshing the page retains cart items (`ce_cart_${storeId}` tenant-scoped persistence).
- [ ] Clicking "Order on WhatsApp" opens `<CustomerForm>`.
- [ ] Submitting customer details calls `checkoutAction`.
- [ ] Server recalculates total price from DB and verifies stock availability.
- [ ] Order row inserted in `public.orders` with `cart_snapshot` JSONB.
- [ ] Purchased item `stock_quantity` decremented in `public.products`.
- [ ] `wa.me` link opens WhatsApp with formatted order text sent to merchant's registered WhatsApp number.
- [ ] Cart is automatically cleared upon successful order dispatch.

---

## 6. Performance & Security Audit
- [ ] Mobile responsive test completed on iOS Safari and Android Chrome.
- [ ] Custom domain SSL certificate active and valid.
- [ ] Merchant password changed from initial temporary setup.
