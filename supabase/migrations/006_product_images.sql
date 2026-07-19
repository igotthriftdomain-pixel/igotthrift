-- Create product_images table
create table public.product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  storage_path text not null,
  alt_text text,
  display_order integer default 0 not null,
  is_primary boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SQL Comments for documentation
comment on table public.product_images is 'Product Images maps static storage path file links to parent products.';
comment on column public.product_images.storage_path is 'Relative storage path in Supabase bucket.';
comment on column public.product_images.is_primary is 'Flag to pin the main display image of the product.';
comment on column public.product_images.display_order is 'Order layout priority for gallery renders.';
