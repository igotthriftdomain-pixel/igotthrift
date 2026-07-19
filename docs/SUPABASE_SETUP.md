# Supabase Initialization & Configuration Guide

This document provides step-by-step instructions for initializing, configuring, and verifying a Supabase project for **`commerce-engine`**.

---

## 1. Required Supabase Services

`commerce-engine` relies on four core Supabase services:

1. **Authentication:** Email & Password provider enabled, session tokens handled via `@supabase/ssr` cookies, email recovery URLs configured.
2. **PostgreSQL Database:** Multi-tenant relational schema with foreign key cascades, triggers, indexes, and custom PL/pgSQL RPC functions.
3. **Row Level Security (RLS):** Strict PostgreSQL policies for tenant data isolation.
4. **Storage:** `store-assets` public bucket for hosting logos, hero banners, and product gallery images.

---

## 2. Step-by-Step Project Setup

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**, enter a name (e.g. `commerce-engine-store`), select a region close to your target audience, and set a secure database password.
3. Once provisioned, navigate to **Project Settings → API** and copy:
   - **URL** (e.g. `https://<ref>.supabase.co`)
   - **anon key** (Public client key)

### Step 2: Configure Authentication Settings & URL Redirects
1. Go to **Authentication → Providers → Email**.
2. Ensure **Enable Email provider** is turned **ON**.
3. Go to **Authentication → URL Configuration**:
   - **Site URL:** Set to your client domain (e.g. `https://shop.clientdomain.com` or `http://localhost:3000` for local dev).
   - **Redirect URLs:** Add allowed callback redirect paths for password recovery:
     ```
     http://localhost:3000/auth/callback
     https://shop.clientdomain.com/auth/callback
     https://*.vercel.app/auth/callback
     ```

### Step 3: Create Storage Bucket
1. Go to **Storage → Buckets**.
2. Click **New bucket**.
3. Set Name: `store-assets`.
4. Set Access: **Public bucket** (turned ON).
5. Click **Save**.

---

## 3. Database Migration Execution Order

Migrations are located in `supabase/migrations/`. Execute them sequentially in the Supabase **SQL Editor**:

```
001_extensions.sql              # 1. Enables uuid-ossp and pgcrypto
002_profiles.sql                # 2. Creates public.profiles table
003_stores.sql                  # 3. Creates public.stores table
004_categories.sql              # 4. Creates public.categories table
005_products.sql                # 5. Creates public.products table
006_product_images.sql          # 6. Creates public.product_images table
007_indexes.sql                 # 7. Creates performance indexes
008_triggers.sql                # 8. Creates updated_at and handle_new_user triggers
009_seed_demo_store.sql         # 9. Migration strategy marker
010_rls.sql                     # 10. Enables RLS & applies table security policies
011_storage.sql                 # 11. Initializes store-assets storage bucket policies
012_reorder_categories.sql      # 12. Creates reorder_categories RPC function
013_orders.sql                  # 13. Creates public.orders table & checkout policies
014_storage_policies_fix.sql    # 14. Applies split storage RLS policies (SELECT, INSERT, UPDATE, DELETE)
```

> [!NOTE]  
> **Seed & Provisioning Files:**  
> - Client Production Provisioning: Run `supabase/provisioning/create-client-store.sql`  
> - Local Development Demo Data: Run `supabase/seed/demo.sql`

---

## 4. Post-Migration Verification Queries

Run the following queries in the Supabase SQL Editor to verify database setup:

### Verification 1: Verify Table Structure & RLS Status
```sql
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'public';
```
*Expected Result:* `profiles`, `stores`, `categories`, `products`, `product_images`, and `orders` all returned with `rowsecurity = true`.

### Verification 2: Verify Auth Profile Trigger
```sql
select tgname, relname 
from pg_trigger t 
join pg_class c on t.tgrelid = c.oid 
where tgname = 'on_auth_user_created';
```
*Expected Result:* 1 row returned showing `on_auth_user_created` attached to `users`.

### Verification 3: Verify Storage Policies (Migration 014)
```sql
select policyname, cmd 
from pg_policies 
where tablename = 'objects' and schemaname = 'storage'
and policyname like '%store owners%';
```
*Expected Result:* 4 policies returned:
- `Allow store owners to select their own assets` (SELECT)
- `Allow store owners to insert their own assets` (INSERT)
- `Allow store owners to update their own assets` (UPDATE)
- `Allow store owners to delete their own assets` (DELETE)

---

## 5. Storage Path Schema & Image Handling

Uploaded files follow a strict folder hierarchy inside the `store-assets` bucket:

```
store-assets/
├── stores/
│   └── {store_id}/
│       ├── logo.png (or logo.webp)
│       └── banner.png (or banner.webp)
└── products/
    └── {store_id}/
        └── {product_id}/
            └── {image_uuid}.webp
```

Public URLs are automatically resolved via:
`https://<project-ref>.supabase.co/storage/v1/object/public/store-assets/<storage_path>`
