# PostgreSQL Database & RLS Reference

This document provides a comprehensive specification of the database architecture, schema, indexes, triggers, Row Level Security (RLS) policies, and storage policies implemented in **`commerce-engine`**.

---

## 1. PostgreSQL Schema Diagram

```
                         auth.users (Supabase Managed)
                                     │
                                     ▼ (Trigger: handle_new_user)
                         public.profiles
                         ├── id (PK, FK -> auth.users.id)
                         ├── email (TEXT)
                         └── updated_at (TIMESTAMPTZ)
                                     │
                                     ▼ (FK: stores.owner_id -> profiles.id)
                         public.stores
                         ├── id (PK, UUID)
                         ├── owner_id (FK -> profiles.id)
                         ├── name (TEXT)
                         ├── slug (TEXT, UNIQUE)
                         ├── description (TEXT)
                         ├── logo_url (TEXT)
                         ├── banner_url (TEXT)
                         ├── whatsapp_number (TEXT)
                         ├── theme_color (TEXT)
                         ├── currency_code (TEXT)
                         ├── currency_symbol (TEXT)
                         ├── address, website, instagram, facebook (TEXT)
                         ├── meta_title, meta_description (TEXT)
                         ├── active (BOOLEAN)
                         └── created_at, updated_at (TIMESTAMPTZ)
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼ (FK: store_id)            ▼ (FK: store_id)            ▼ (FK: store_id)
public.categories           public.products             public.orders
├── id (PK, UUID)           ├── id (PK, UUID)           ├── id (PK, UUID)
├── store_id (FK)           ├── store_id (FK)           ├── store_id (FK)
├── name (TEXT)             ├── category_id (FK)        ├── customer_name (TEXT)
├── slug (TEXT)             ├── name (TEXT)             ├── customer_phone (TEXT)
├── description (TEXT)      ├── slug (TEXT)             ├── customer_address (TEXT)
├── sort_order (INT)        ├── price (NUMERIC)         ├── cart_snapshot (JSONB)
├── active (BOOLEAN)        ├── compare_at_price        ├── total_amount (NUMERIC)
└── timestamps              ├── stock_quantity (INT)    ├── status (TEXT)
                            ├── published_at, deleted_at└── created_at, updated_at
                            └── timestamps
                                     │
                                     ▼ (FK: product_id)
                        public.product_images
                        ├── id (PK, UUID)
                        ├── product_id (FK -> products.id)
                        ├── storage_path (TEXT)
                        ├── display_order (INT)
                        ├── alt_text (TEXT)
                        └── created_at (TIMESTAMPTZ)
```

---

## 2. Migration Files Summary

| Migration | File | Created Artifacts |
| :--- | :--- | :--- |
| **001** | `001_extensions.sql` | PostgreSQL extensions: `uuid-ossp`, `pgcrypto` |
| **002** | `002_profiles.sql` | `public.profiles` table linked to `auth.users` |
| **003** | `003_stores.sql` | `public.stores` table with branding & contact fields |
| **004** | `004_categories.sql` | `public.categories` taxonomy table |
| **005** | `005_products.sql` | `public.products` catalog table with stock & soft delete |
| **006** | `006_product_images.sql` | `public.product_images` gallery table |
| **007** | `007_indexes.sql` | 12 performance indexes for queries & foreign keys |
| **008** | `008_triggers.sql` | `update_updated_at_column` function + `handle_new_user` auth trigger |
| **009** | `009_seed_demo_store.sql` | *Migration Strategy Marker:* Decouples schema migrations from seed data |
| **010** | `010_rls.sql` | Row Level Security policies for core tables |
| **011** | `011_storage.sql` | `store-assets` storage bucket creation & public read rule |
| **012** | `012_reorder_categories.sql` | Category drag-and-drop reorder RPC function |
| **013** | `013_orders.sql` | `public.orders` checkout tracking table & RLS policies |
| **014** | `014_storage_policies_fix.sql` | Split RLS storage policies (SELECT, INSERT, UPDATE, DELETE) |

> [!NOTE]  
> **Seed Data Files:**  
> - Client Production Provisioning: `supabase/provisioning/create-client-store.sql`  
> - Local Development Demo Data: `supabase/seed/demo.sql`

---

## 3. Detailed Table Specifications

### 3.1 `public.profiles`
- **`id`** (`UUID`, Primary Key, `REFERENCES auth.users(id) ON DELETE CASCADE`)
- **`email`** (`TEXT NOT NULL`)
- **`updated_at`** (`TIMESTAMPTZ DEFAULT NOW()`)

### 3.2 `public.stores`
- **`id`** (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
- **`owner_id`** (`UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`)
- **`name`** (`TEXT NOT NULL`)
- **`slug`** (`TEXT UNIQUE NOT NULL`)
- **`description`** (`TEXT`)
- **`logo_url`** (`TEXT`)
- **`banner_url`** (`TEXT`)
- **`whatsapp_number`** (`TEXT NOT NULL`)
- **`theme_color`** (`TEXT DEFAULT '#0f172a'`)
- **`currency_code`** (`TEXT DEFAULT 'INR'`)
- **`currency_symbol`** (`TEXT DEFAULT '₹'`)
- **`address`**, **`website`**, **`instagram`**, **`facebook`** (`TEXT`)
- **`meta_title`**, **`meta_description`** (`TEXT`)
- **`active`** (`BOOLEAN DEFAULT TRUE`)
- **`created_at`**, **`updated_at`** (`TIMESTAMPTZ DEFAULT NOW()`)

### 3.3 `public.categories`
- **`id`** (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
- **`store_id`** (`UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE`)
- **`name`** (`TEXT NOT NULL`)
- **`slug`** (`TEXT NOT NULL`)
- **`description`** (`TEXT`)
- **`sort_order`** (`INT DEFAULT 0`)
- **`active`** (`BOOLEAN DEFAULT TRUE`)
- **`created_at`**, **`updated_at`** (`TIMESTAMPTZ DEFAULT NOW()`)
- *Constraint:* `UNIQUE(store_id, slug)`

### 3.4 `public.products`
- **`id`** (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
- **`store_id`** (`UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE`)
- **`category_id`** (`UUID REFERENCES public.categories(id) ON DELETE SET NULL`)
- **`name`** (`TEXT NOT NULL`)
- **`slug`** (`TEXT NOT NULL`)
- **`description`** (`TEXT`)
- **`short_description`** (`TEXT`)
- **`price`** (`NUMERIC(10, 2) NOT NULL`)
- **`compare_at_price`** (`NUMERIC(10, 2)`)
- **`sku`** (`TEXT`)
- **`stock_quantity`** (`INT DEFAULT 0`)
- **`track_stock`** (`BOOLEAN DEFAULT TRUE`)
- **`active`** (`BOOLEAN DEFAULT TRUE`)
- **`featured`** (`BOOLEAN DEFAULT FALSE`)
- **`sort_order`** (`INT DEFAULT 0`)
- **`meta_title`**, **`meta_description`** (`TEXT`)
- **`published_at`** (`TIMESTAMPTZ DEFAULT NOW()`)
- **`deleted_at`** (`TIMESTAMPTZ DEFAULT NULL`)
- **`created_at`**, **`updated_at`** (`TIMESTAMPTZ DEFAULT NOW()`)
- *Constraint:* `UNIQUE(store_id, slug)`

### 3.5 `public.product_images`
- **`id`** (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
- **`product_id`** (`UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE`)
- **`storage_path`** (`TEXT NOT NULL`)
- **`display_order`** (`INT DEFAULT 0`)
- **`alt_text`** (`TEXT`)
- **`created_at`** (`TIMESTAMPTZ DEFAULT NOW()`)

### 3.6 `public.orders`
- **`id`** (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
- **`store_id`** (`UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE`)
- **`customer_name`** (`TEXT NOT NULL`)
- **`customer_phone`** (`TEXT NOT NULL`)
- **`customer_address`** (`TEXT NOT NULL`)
- **`cart_snapshot`** (`JSONB NOT NULL`)
- **`total_amount`** (`NUMERIC(10, 2) NOT NULL`)
- **`status`** (`TEXT DEFAULT 'pending'`)
- **`created_at`**, **`updated_at`** (`TIMESTAMPTZ DEFAULT NOW()`)

---

## 4. Triggers & Automated Functions

### 4.1 Timestamp Updating (`update_updated_at_column`)
Executes automatically `BEFORE UPDATE` on `profiles`, `stores`, `categories`, `products`, `orders` to refresh `updated_at = NOW()`.

### 4.2 Automated Profile Creation (`handle_new_user`)
Fires `AFTER INSERT` on `auth.users`:
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
```

---

## 5. Row Level Security (RLS) Policies

RLS is enabled on all tables (`ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`).

### Summary Matrix
| Table | Public Access | Merchant Access (Authenticated Owner) |
| :--- | :--- | :--- |
| `profiles` | None | SELECT, UPDATE where `id = auth.uid()` |
| `stores` | SELECT where `active = true` | ALL where `owner_id = auth.uid()` |
| `categories` | SELECT where `active = true` | ALL where `store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())` |
| `products` | SELECT where `active = true AND published_at <= NOW() AND deleted_at IS NULL` | ALL where `store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())` |
| `product_images` | SELECT (inherits public read) | ALL where `product_id IN (SELECT id FROM products WHERE store_id IN (...))` |
| `orders` | INSERT (public checkout logging) | SELECT, UPDATE where `store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())` |

---

## 6. Storage Bucket & Storage RLS (Migration 014)

Bucket: `store-assets` (Public)

### Storage RLS Policies
```sql
-- 1. Public Read Access
create policy "Public read store assets" on storage.objects
  for select using (bucket_id = 'store-assets');

-- 2. Store Owner Insert Policy
create policy "Allow store owners to insert their own assets" on storage.objects
  for insert with check (
    bucket_id = 'store-assets' and
    exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and (
          name like 'stores/' || s.id || '/%' or
          name like 'products/' || s.id || '/%'
        )
    )
  );

-- 3. Store Owner Update Policy
create policy "Allow store owners to update their own assets" on storage.objects
  for update using (
    bucket_id = 'store-assets' and
    exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and (
          name like 'stores/' || s.id || '/%' or
          name like 'products/' || s.id || '/%'
        )
    )
  );

-- 4. Store Owner Delete Policy
create policy "Allow store owners to delete their own assets" on storage.objects
  for delete using (
    bucket_id = 'store-assets' and
    exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and (
          name like 'stores/' || s.id || '/%' or
          name like 'products/' || s.id || '/%'
        )
    )
  );
```
