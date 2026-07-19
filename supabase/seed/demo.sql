-- ==============================================================================
-- COMMERCE-ENGINE: OPTIONAL LOCAL DEMO SEED DATA
-- ==============================================================================
-- Use this script ONLY for local development or testing demo environments.
-- Do NOT run this in client production projects.
-- ==============================================================================

-- 1. Insert a demo merchant into auth.users (hashed password: 'password123')
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert the demo tenant store
INSERT INTO public.stores (
  id, 
  owner_id, 
  name, 
  slug, 
  description, 
  whatsapp_number, 
  theme_color,
  currency_code,
  currency_symbol
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'Demo Thrift Store',
  'demo',
  'Curated demo vintage apparel and thrift collection.',
  '+919876543210',
  '#0f172a',
  'INR',
  '₹'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert demo categories
INSERT INTO public.categories (id, store_id, name, slug, description, sort_order, active)
VALUES 
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Vintage Outerwear',
  'vintage-outerwear',
  'Classic jackets, coats, and denims.',
  0,
  TRUE
),
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Tops & Sweatshirts',
  'tops-sweatshirts',
  'Vintage tees, hoodies, and crewnecks.',
  1,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert demo products
INSERT INTO public.products (
  id,
  store_id,
  category_id,
  name,
  slug,
  description,
  short_description,
  price,
  compare_at_price,
  sku,
  stock_quantity,
  track_stock,
  active,
  featured,
  sort_order
)
VALUES
(
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Classic Vintage Denim Jacket',
  'classic-vintage-denim-jacket',
  'Authentic 90s light wash denim jacket with brass buttons.',
  '90s light wash denim jacket.',
  1499.00,
  1999.00,
  'DEN-001',
  5,
  TRUE,
  TRUE,
  TRUE,
  0
),
(
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Distressed Leather Biker Jacket',
  'distressed-leather-biker-jacket',
  'Heavyweight genuine leather jacket with silver zips.',
  'Heavyweight leather biker jacket.',
  3499.00,
  4500.00,
  'LEA-002',
  2,
  TRUE,
  TRUE,
  TRUE,
  1
) ON CONFLICT (id) DO NOTHING;
