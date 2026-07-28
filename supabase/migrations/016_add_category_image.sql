-- Add optional image_path column to public.categories
alter table public.categories add column if not exists image_path text;

comment on column public.categories.image_path is 'Relative storage path in store-assets bucket for category image.';
