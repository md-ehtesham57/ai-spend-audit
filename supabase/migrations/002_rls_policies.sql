-- Required RLS policies for the AI Spend Audit app.
-- Run these in your Supabase SQL editor after tables exist.

-- ============================================================
-- Table: leads
-- ============================================================
-- Allow inserts from the anon key (via the server-side API only).
-- The app never reads leads client-side, so no SELECT policy needed.

CREATE POLICY "anon_can_insert_leads" ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Restrict reads to service_role only (dashboard/admin use).
CREATE POLICY "service_role_can_read_leads" ON leads
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================
-- Table: rate_limits
-- ============================================================
-- The rate_limiter function uses INSERT ... ON CONFLICT which
-- requires both INSERT and UPDATE privileges.

CREATE POLICY "anon_can_insert_rate_limits" ON rate_limits
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_can_update_rate_limits" ON rate_limits
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_can_select_rate_limits" ON rate_limits
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- Enable RLS on both tables (idempotent)
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
