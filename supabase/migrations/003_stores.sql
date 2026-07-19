-- Create stores table (the core tenant model)
create table public.stores (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete restrict not null,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  whatsapp_number text not null,
  address text,
  theme_color text default '#000000' not null,
  instagram text,
  facebook text,
  website text,
  currency_code text default 'INR' not null,
  currency_symbol text default '₹' not null,
  meta_title text,
  meta_description text,
  active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SQL Comments for documentation
comment on table public.stores is 'Stores represent the core multi-tenant business entities on the platform.';
comment on column public.stores.id is 'Unique identifier of the store tenant.';
comment on column public.stores.owner_id is 'Points to the profile ID of the primary store merchant.';
comment on column public.stores.slug is 'URL-friendly identifier unique to each tenant.';
comment on column public.stores.currency_code is 'ISO currency code for the store pricing (default INR).';
comment on column public.stores.currency_symbol is 'Currency symbol used for displaying pricing (default ₹).';
comment on column public.stores.active is 'Flag to enable/disable public access to the storefront.';
