-- Create optimized indexes for fast storefront and dashboard query resolution
create index idx_stores_slug on public.stores(slug);
create index idx_categories_store_id on public.categories(store_id);
create index idx_categories_sort_order on public.categories(sort_order);
create index idx_products_store_id on public.products(store_id);
create index idx_products_slug on public.products(slug);
create index idx_products_category_id on public.products(category_id);
create index idx_products_active on public.products(active);
create index idx_products_featured on public.products(featured);
create index idx_products_published_at on public.products(published_at);
create index idx_products_sort_order on public.products(sort_order);
create index idx_product_images_product_id on public.product_images(product_id);
create index idx_product_images_display_order on public.product_images(display_order);
