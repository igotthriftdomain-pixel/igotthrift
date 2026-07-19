-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  cart_snapshot jsonb not null,
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies
create policy "Allow public to insert orders" on public.orders
  for insert with check (true);

create policy "Allow store owners to manage orders" on public.orders
  for all using (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  );

-- Comments
comment on table public.orders is 'Table storing customer checkouts and order history.';
