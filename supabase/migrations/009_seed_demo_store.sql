-- ==============================================================================
-- MIGRATION 009: SEED STRATEGY & DECOUPLING
-- ==============================================================================
-- In commerce-engine, schema migrations (001-008, 010-014) setup database tables,
-- foreign keys, RLS security policies, triggers, indexes, and storage buckets.
--
-- Client production provisioning is decoupled from migration history:
-- 1. To provision a new client store: Run `supabase/provisioning/create-client-store.sql`.
-- 2. To populate local development demo data: Run `supabase/seed/demo.sql`.
-- ==============================================================================

-- Maintain idempotency check marker
SELECT 1;
