-- Add optional tagline column to public.stores
alter table public.stores add column if not exists tagline text;

comment on column public.stores.tagline is 'Optional short brand tagline displayed underneath the store name in customer storefront header.';
