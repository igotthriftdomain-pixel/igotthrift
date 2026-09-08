-- Optional D1 local development seed script

-- 1. Insert demo user (Email: demo@example.com, Password: password123)
INSERT OR IGNORE INTO users (id, email, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  'pbkdf2:sha256:100000:e6c1b266cd711b3e24ba513ae9e15429:21d73a15e305271ea060bd2e365e7da18fbacc061dc1ca3f93ab2776be0ab16a'
);

-- 2. Insert demo profile
INSERT OR IGNORE INTO profiles (id, email)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com'
);

-- 3. Insert demo store
INSERT OR IGNORE INTO stores (
  id, owner_id, name, slug, description, whatsapp_number, theme_color, currency_code, currency_symbol, active
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
  '₹',
  1
);

-- 4. Insert demo categories
INSERT OR IGNORE INTO categories (id, store_id, name, slug, description, sort_order, active)
VALUES 
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Vintage Outerwear',
  'vintage-outerwear',
  'Classic jackets, coats, and denims.',
  0,
  1
),
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Tops & Sweatshirts',
  'tops-sweatshirts',
  'Vintage tees, hoodies, and crewnecks.',
  1,
  1
);

-- 5. Insert demo products
INSERT OR IGNORE INTO products (
  id, store_id, category_id, name, slug, description, short_description,
  price, compare_at_price, sku, stock_quantity, active, featured, sort_order
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
  1,
  1,
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
  1,
  1,
  1
);
