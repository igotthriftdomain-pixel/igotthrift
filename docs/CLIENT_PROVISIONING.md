# Merchant Store Provisioning Guide (Cloudflare Architecture)

This document details the procedure for provisioning and onboarding a new merchant store on the **`commerce-engine`** platform powered by **Cloudflare Workers**, **Cloudflare D1**, and **Cloudflare R2**.

---

## 1. Deployment Architecture

`commerce-engine` uses a multi-tenant database design where stores, products, categories, images, and orders are isolated by `store_id` (UUID).

```
 ┌────────────────────────────────────────────────────────┐
 │           commerce-engine (Master Engine)              │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │                   Cloudflare Workers                   │
 │   (Storefront: igotthrift.in | Admin: admin.igotthrift.in)│
 └─────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
 ┌──────────────────────────┐  ┌──────────────────────────┐
 │      Cloudflare D1       │  │      Cloudflare R2       │
 │   (`igotthrift-db` SQL)  │  │  (`assets.igotthrift.in`)│
 └──────────────────────────┘  └──────────────────────────┘
```

> [!NOTE]  
> **Legacy Fallback Note:** Historical provisioning workflows using independent Supabase projects per client (`supabase/provisioning/create-client-store.sql`) are preserved in the `supabase/` directory for historical reference.

---

## 2. Step-by-Step Store Provisioning Workflow

### Step 1: Create Merchant Auth Account (D1)
Generate a strong password and compute its PBKDF2 hash using Web Crypto API or `lib/auth/password.ts`:
```sql
-- Insert User in Cloudflare D1
INSERT INTO users (id, email, password_hash)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  'merchant@clientdomain.com',
  'pbkdf2:sha256:100000:<salt_hex>:<hash_hex>'
);

-- Insert Profile in D1
INSERT INTO profiles (id, email, full_name)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  'merchant@clientdomain.com',
  'Merchant Name'
);
```

### Step 2: Provision Store Record
```sql
INSERT INTO stores (
  id,
  owner_id,
  name,
  slug,
  whatsapp_number,
  currency_code,
  currency_symbol,
  theme_color,
  active
) VALUES (
  's1s2s3s4-e5f6-7890-abcd-1234567890ab',
  'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  'New Merchant Store Name',
  'new-store-slug',
  '+919876543210',
  'INR',
  '₹',
  '#0f172a',
  1
);
```

### Step 3: Configure Media Directory (Cloudflare R2)
Store branding assets are uploaded via the merchant settings portal directly to R2 bucket `igotthrift-media`:
- Logo path: `stores/{store_id}/logo.webp`
- Banner path: `stores/{store_id}/banner.webp`
- Public CDN URL: `https://assets.igotthrift.in/stores/{store_id}/logo.webp`

---

## 3. Post-Provisioning Verification

1. Log in to `https://admin.igotthrift.in` (or local `http://localhost:3000/login`) using merchant credentials.
2. Confirm access to `/dashboard`, `/products`, `/categories`, and `/settings`.
3. Test uploading a logo and banner in Store Settings to verify R2 media storage connectivity.
4. Verify storefront renders at `https://igotthrift.in` (or `/store/[new-store-slug]`).
