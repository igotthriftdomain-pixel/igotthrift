# Production Launch Verification Checklist (Cloudflare Architecture)

Use this checklist before releasing or releasing updates to any merchant store provisioned on **`commerce-engine`**.

---

## 1. Environment & Build Integrity
- [ ] `npx tsc --noEmit` passes with **0 errors**.
- [ ] `npm run lint` passes with **0 errors**.
- [ ] `npm run build` executes locally and on OpenNext/Cloudflare Workers with **0 errors**.
- [ ] `.env.local` and secret files are excluded from git repository (`.gitignore` verified).
- [ ] Production worker bindings (`DB`, `MEDIA_BUCKET`) and vars (`NEXT_PUBLIC_R2_PUBLIC_URL`, `NEXT_PUBLIC_DEFAULT_STORE_SLUG`) set in `wrangler.jsonc`.
- [ ] Production secrets (`SESSION_SECRET`) configured securely via `npx wrangler secret put`.

---

## 2. Cloudflare Infrastructure & Database (D1 & R2)
- [ ] Schema applied to production D1 database `igotthrift-db` (`d1/schema.sql`).
- [ ] No demo data (`demo@example.com` / `password123`) present in production D1 database.
- [ ] R2 bucket `igotthrift-media` attached to custom domain `assets.igotthrift.in`.
- [ ] Cloudflare DNS records verified (`igotthrift.in`, `www.igotthrift.in`, `admin.igotthrift.in`, `assets.igotthrift.in`).
- [ ] GoDaddy nameservers updated to `angela.ns.cloudflare.com` and `sage.ns.cloudflare.com`.
- [ ] Worker rollback endpoint `https://igotthrift.igotthrift-domain.workers.dev` operational.

---

## 3. Merchant Portal Verification (`https://admin.igotthrift.in`)
- [ ] Navigating to `/dashboard` while unauthenticated redirects to `/login`.
- [ ] Merchant login with PBKDF2 credentials succeeds and issues signed HttpOnly `merchant_session` cookie.
- [ ] Navigating to `/login` while authenticated redirects to `/dashboard`.
- [ ] `/categories` page permits creating, editing, and drag-reordering categories in D1.
- [ ] `/products/new` permits creating a new product with R2 images, price, compare-at price, and category assignment.
- [ ] `/products` table displays product status badges, pricing, stock levels, and search filter.
- [ ] `/products/[id]/edit` permits modifying product pricing, description, stock quantity, and gallery images.
- [ ] `/settings` page permits updating Store Name, Description, WhatsApp number, Theme Color, Logo, Banner, and Social links.
- [ ] Store Logo and Banner upload successfully to `igotthrift-media` bucket and render previews via `https://assets.igotthrift.in`.
- [ ] Sign Out button clears session cookie and redirects to `/login`.

---

## 4. Public Storefront Verification (`https://igotthrift.in`)
- [ ] Navigating to `https://igotthrift.in` (or `/store/[valid-slug]`) renders hero banner, store logo, dynamic theme color, and product grid.
- [ ] Navigating to `https://www.igotthrift.in` triggers 301 canonical redirect to `https://igotthrift.in`.
- [ ] Navigating to invalid store slug returns Next.js 404 page.
- [ ] Category tabs filter products correctly from D1.
- [ ] Clicking a product card navigates to `/store/[slug]/product/[productSlug]`.
- [ ] Product detail page displays image gallery with selectable thumbnails, price, compare-at discount badge, description, and stock availability.

---

## 5. Cart & WhatsApp Checkout Verification
- [ ] Clicking "Add to Cart" updates cart badge count.
- [ ] Attempting to add more items than available in D1 `stock_quantity` shows stock cap toast notification.
- [ ] Cart drawer displays item list, image thumbnails, price per item, quantity controls, and subtotal calculation.
- [ ] Refreshing the page retains cart items (`ce_cart_${storeId}` tenant-scoped persistence).
- [ ] Clicking "Order on WhatsApp" opens `<CustomerForm>`.
- [ ] Submitting customer details calls `checkoutAction`.
- [ ] Server recalculates total price from D1 and verifies stock availability.
- [ ] Order row inserted in D1 `orders` table.
- [ ] Purchased item `stock_quantity` decremented in D1 `products` table.
- [ ] `wa.me` link opens WhatsApp with formatted order text sent to merchant's registered WhatsApp number.
- [ ] Cart is automatically cleared upon successful order dispatch.

---

## 6. Performance & Security Audit
- [ ] Mobile responsive test completed on iOS Safari and Android Chrome.
- [ ] Custom domain SSL certificates active and valid across all Cloudflare domains.
- [ ] Rollback capability verified against `https://igotthrift.igotthrift-domain.workers.dev`.
