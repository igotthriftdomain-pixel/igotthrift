-- Create transaction-safe category reordering function
create or replace function public.reorder_categories(category_ids uuid[])
returns void as $$
declare
  cat_id uuid;
  idx int := 0;
begin
  foreach cat_id in array category_ids
  loop
    update public.categories
    set sort_order = idx, updated_at = now()
    where id = cat_id;
    idx := idx + 1;
  end loop;
end;
$$ language plpgsql security definer;

comment on function public.reorder_categories is 'Updates category sort orders sequentially in a single transaction.';
