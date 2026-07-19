# New Client Provisioning Workflow

This document provides a complete, repeatable procedure for deploying an independent merchant store from the **`commerce-engine`** master repository.

---

## 1. Deployment Architecture & Operational Model

`commerce-engine` is designed as a master engine codebase. Although the underlying PostgreSQL architecture is fully multi-tenant capable, our production deployment strategy is **one isolated installation per client**:

```
 ┌────────────────────────────────────────────────────────┐
 │           commerce-engine (Master Repo)                │
 └───────────────────────────┬────────────────────────────┘
                             │ (Template / Clone)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │            Client-Specific GitHub Repo                 │
 └─────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
 ┌──────────────────────────┐  ┌──────────────────────────┐
 │ Client Supabase Project  │  │   Client Vercel Deploy   │
 │ (Isolated DB & Storage)  │  │ (Custom Domain & SSL)    │
 └──────────────────────────┘  └──────────────────────────┘
```

Each client store receives:
- An isolated GitHub repository.
- A dedicated Supabase project (PostgreSQL + Auth + Storage).
- A dedicated Vercel deployment with custom domain routing.
- Full operational ownership and isolated credentials.

---

## 2. Security Notice: Password & Credential Handling

> [!CAUTION]  
> **Security Mandate:**  
> Never commit merchant passwords, database secrets, or API tokens into git repositories or documentation files.  
> Provide new merchants with a temporary initial password generated via a secure password manager. Instruct the merchant to log in and immediately update their password under **Store Settings → Account Security**, or use the **Forgot Password** self-service recovery link.

---

## 3. Step-by-Step Provisioning Guide (20-Step Checklist)

### Step 1: Create Client GitHub Repository
1. Open the master `commerce-engine` repository on GitHub.
2. Click **Use this template** (or clone the master repo).
3. Name the new repository after the client (e.g. `clientname-store`). Set repository to **Private**.

### Step 2: Create Client Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**, select your organization, and set the project name (e.g. `clientname-supabase`).
3. Note down the **Project Reference**, **URL**, and **anon key**.
4. Under **Authentication → URL Configuration**, add allowed redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://shop.clientdomain.com/auth/callback`
   - `https://*.vercel.app/auth/callback`

### Step 3: Configure Environment Variables
Create `.env.local` locally and configure production variables on Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<client-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI...
NEXT_PUBLIC_DEFAULT_STORE_SLUG=client-slug
```

### Step 4: Apply Clean Schema Migrations
In the Supabase SQL Editor, run schema migrations **001 through 008** and **010 through 014** in sequence:
*Migration 009 acts as a strategy marker; core tables and RLS are created by 001-008 and 010-014.*

### Step 5: Create Merchant Auth User
In Supabase Dashboard → **Authentication → Users**, click **Add User → Create User**:
- **Email:** `merchant@clientdomain.com`
- **Password:** *(Generate strong temporary password)*
- Copy the generated `User UID` (e.g., `a1b2c3d4-e5f6-7890-abcd-1234567890ab`).

### Step 6: Verify Profile Trigger
Run this SQL query to verify the automated trigger created the merchant profile:
```sql
select id, email from public.profiles where id = '<merchant-user-uid>';
```

### Step 7: Create Store Linked to Merchant UID
Run the SQL script from `supabase/provisioning/create-client-store.sql` in the SQL Editor, replacing `<MERCHANT_USER_UID>` and store attributes:
```sql
insert into public.stores (
  owner_id,
  name,
  slug,
  whatsapp_number,
  currency_code,
  currency_symbol,
  theme_color
) values (
  '<merchant-user-uid>',
  'Client Store Name',
  'client-slug',
  '+1234567890',
  'USD',
  '$',
  '#0f172a'
);
```

### Step 8: Configure Store Slug
Verify the assigned store slug:
```sql
select id, name, slug, owner_id from public.stores where slug = 'client-slug';
```

### Step 9: Configure WhatsApp Number
Verify that the merchant's WhatsApp contact number includes country code (e.g. `+14155552671` or `+919876543210`) with no spaces or special symbols.

### Step 10: Verify Storage Bucket and Policies
1. In Supabase Dashboard → **Storage**, verify `store-assets` bucket exists and is set to **Public**.
2. Run migration `014_storage_policies_fix.sql` if not already executed.

### Step 11: Test Merchant Login & Change Password
1. Start the app locally or visit the staging preview URL.
2. Navigate to `/login` → Log in with temporary credentials. Confirm successful redirect to `/dashboard`.
3. Go to `/settings` → Under Account Security, update password. Log out and verify login with new password.

### Step 12: Test Self-Service Password Recovery
1. Go to `/login` → Click "Forgot password?".
2. Enter merchant email → Confirm recovery link is dispatched.
3. Open recovery link → Confirm callback exchange redirects to `/reset-password` and password updates cleanly.

### Step 13: Test Product & Category CRUD
1. Go to `/categories` → Add a new category (e.g. "Apparel").
2. Go to `/products/new` → Create a new catalog item, assign price, stock, and category.
3. Save and verify item appears in `/products` table.

### Step 14: Test Image Uploads
1. Edit the newly created product.
2. Upload product images. Verify immediate rendering in gallery preview.
3. Go to `/settings` → Upload Store Logo and Banner. Confirm successful storage upload.

### Step 15: Test Public Storefront
1. Navigate to `/store/client-slug`.
2. Confirm store logo, banner, theme color, category tabs, and products render correctly.

### Step 16: Test Shopping Cart
1. Click a product card → View detail page (`/store/client-slug/product/product-slug`).
2. Add item to cart. Open cart drawer, test quantity increments and stock limit caps.

### Step 17: Test WhatsApp Checkout
1. Open cart → Click "Order on WhatsApp".
2. Fill customer details (Name, Phone, Address) → Click submit.
3. Confirm `wa.me` link opens with correctly formatted message.
4. Verify order row is inserted in `public.orders` and product stock quantity is decremented.

### Step 18: Deploy to Vercel
1. Log in to Vercel → **Add New Project**.
2. Import the client's GitHub repository.
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEFAULT_STORE_SLUG`).
4. Click **Deploy**.

### Step 19: Configure Production Domain & Auth Redirects
1. In Vercel Project Settings → **Domains**, add client's custom domain (e.g. `shop.clientbrand.com`).
2. In Supabase Dashboard → **Authentication → URL Configuration**, add `https://shop.clientbrand.com/auth/callback`.

### Step 20: Hand Over Operational Access
Provide the client with:
- Merchant Dashboard URL (`https://shop.clientbrand.com/login`)
- Merchant Login Email
- Temporary Password (instruct merchant to change password upon first login under `/settings`)
- Storefront public share link (`https://shop.clientbrand.com/store/client-slug`)
