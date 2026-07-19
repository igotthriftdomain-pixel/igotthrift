-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete restrict not null,
  name text not null,
  slug text not null,
  short_description text,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price >= 0),
  sku text,
  stock_quantity integer default 0 not null check (stock_quantity >= 0),
  featured boolean default false not null,
  active boolean default true not null,
  published_at timestamp with time zone,
  sort_order integer default 0 not null,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,
  constraint unique_store_product_slug unique (store_id, slug)
);

-- SQL Comments for documentation
comment on table public.products is 'Products represents catalog inventory items belonging to stores.';
comment on column public.products.category_id is 'Direct mapping to categories. Restricts category deletion if products exist.';
comment on column public.products.price is 'Current selling price. Must be greater than or equal to zero.';
comment on column public.products.compare_at_price is 'Original non-discounted price. Used to display sales banners. Must be >= 0.';
comment on column public.products.published_at is 'Future date-time scheduling threshold for storefront visibility.';
comment on column public.products.deleted_at is 'Timestamp for soft deletion. Null values represent active items.';
