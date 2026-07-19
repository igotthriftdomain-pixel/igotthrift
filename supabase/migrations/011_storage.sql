-- Create public store-assets bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

-- Allow public select access to store-assets objects
create policy "Allow public read for store-assets" on storage.objects
  for select using (bucket_id = 'store-assets');

-- Allow authenticated merchants to manage assets in their own store directory
create policy "Allow store owners to manage their own assets" on storage.objects
  for all using (
    bucket_id = 'store-assets' and
    (
      exists (
        select 1 from public.stores s
        where s.owner_id = auth.uid()
          and (
            name like 'stores/' || s.id || '/%' or
            name like 'products/' || s.id || '/%'
          )
      )
    )
  );
