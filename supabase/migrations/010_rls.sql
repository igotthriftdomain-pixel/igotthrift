-- Enable Row Level Security (RLS) on all public schema tables
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- =====================================================================
-- 1. Profiles Table Policies
-- =====================================================================
create policy "Allow users to read their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- =====================================================================
-- 2. Stores Table Policies
-- =====================================================================
create policy "Allow public read for active stores" on public.stores
  for select using (active = true);

create policy "Allow store owners to update their store" on public.stores
  for update using (auth.uid() = owner_id);

-- =====================================================================
-- 3. Categories Table Policies
-- =====================================================================
create policy "Allow public read for active categories" on public.categories
  for select using (
    active = true and 
    exists (
      select 1 from public.stores s
      where s.id = categories.store_id and s.active = true
    )
  );

create policy "Allow store owners to manage categories" on public.categories
  for all using (
    exists (
      select 1 from public.stores s
      where s.id = categories.store_id and s.owner_id = auth.uid()
    )
  );

-- =====================================================================
-- 4. Products Table Policies
-- =====================================================================
create policy "Allow public read for published products" on public.products
  for select using (
    active = true and 
    deleted_at is null and 
    (published_at is null or published_at <= now()) and
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.active = true
    )
  );

create policy "Allow store owners to manage products" on public.products
  for all using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

-- =====================================================================
-- 5. Product Images Table Policies
-- =====================================================================
create policy "Allow public read for product images" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id 
        and p.active = true 
        and p.deleted_at is null 
        and (p.published_at is null or p.published_at <= now())
        and s.active = true
    )
  );

create policy "Allow store owners to manage product images" on public.product_images
  for all using (
    exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );
