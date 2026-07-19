-- ==============================================================================
-- COMMERCE-ENGINE: CLIENT PROVISIONING SQL TEMPLATE
-- ==============================================================================
-- Use this template when provisioning a new client installation.
-- Instructions:
-- 1. Create the Merchant Auth User in Supabase Dashboard -> Authentication -> Users.
-- 2. Copy the generated User UID.
-- 3. Replace the placeholder values below and execute in Supabase SQL Editor.
-- ==============================================================================

-- 1. Verify merchant profile exists (created automatically by handle_new_user trigger)
-- Replace '<MERCHANT_USER_UID>' with the actual UUID from Supabase Auth.
SELECT id, email FROM public.profiles WHERE id = '<MERCHANT_USER_UID>';

-- 2. Provision the Store row linked to the Merchant User UID
INSERT INTO public.stores (
  owner_id,
  name,
  slug,
  description,
  whatsapp_number,
  currency_code,
  currency_symbol,
  theme_color,
  address
) VALUES (
  '<MERCHANT_USER_UID>',                -- Merchant Auth User UID
  'Client Store Name',                  -- Public store display name
  'client-store-slug',                  -- Storefront URL slug (/store/client-store-slug)
  'Curated items and quality apparel.', -- Short description
  '+1234567890',                        -- Merchant WhatsApp number with country code
  'USD',                                -- Currency ISO code (USD, INR, EUR, etc.)
  '$',                                  -- Currency display symbol ($, ₹, €, etc.)
  '#0f172a',                            -- Default primary theme color (Hex code)
  '123 Commerce St, City, Country'      -- Physical operational address
) ON CONFLICT (slug) DO NOTHING;

-- 3. Provision Default Categories for the Store
INSERT INTO public.categories (store_id, name, slug, description, sort_order, active)
SELECT 
  id AS store_id,
  cat.name,
  cat.slug,
  cat.description,
  cat.sort_order,
  TRUE AS active
FROM public.stores s
CROSS JOIN (
  VALUES 
    ('Featured Items', 'featured', 'Top highlights and bestseller items', 0),
    ('New Arrivals', 'new-arrivals', 'Freshly curated arrivals', 1)
) AS cat(name, slug, description, sort_order)
WHERE s.slug = 'client-store-slug'
ON CONFLICT (store_id, slug) DO NOTHING;

-- 4. Verify Provisioning Results
SELECT 
  s.id AS store_id, 
  s.name AS store_name, 
  s.slug AS store_slug, 
  s.whatsapp_number, 
  p.email AS owner_email
FROM public.stores s
JOIN public.profiles p ON s.owner_id = p.id
WHERE s.slug = 'client-store-slug';
