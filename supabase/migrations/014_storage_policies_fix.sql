-- Drop the old general storage policy
drop policy if exists "Allow store owners to manage their own assets" on storage.objects;

-- Create explicit policies for each operation to resolve Supabase Storage insert check issues
create policy "Allow store owners to select their own assets" on storage.objects
  for select using (
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
