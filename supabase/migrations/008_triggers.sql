-- Create update_updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach updated_at triggers to tables
create trigger update_profiles_updated_at 
  before update on public.profiles 
  for each row execute procedure public.update_updated_at_column();

create trigger update_stores_updated_at 
  before update on public.stores 
  for each row execute procedure public.update_updated_at_column();

create trigger update_categories_updated_at 
  before update on public.categories 
  for each row execute procedure public.update_updated_at_column();

create trigger update_products_updated_at 
  before update on public.products 
  for each row execute procedure public.update_updated_at_column();


-- Create profile auto-generation function for new signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Attach profile auto-generation trigger on auth.users inserts
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
