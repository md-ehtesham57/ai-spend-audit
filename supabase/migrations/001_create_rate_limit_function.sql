-- Atomic rate limiter — eliminates TOCTOU race condition
-- Run this in your Supabase SQL editor or via migration.
-- Requires a `rate_limits` table with a UNIQUE constraint on `ip`.

/*
  CREATE TABLE rate_limits (
    ip TEXT PRIMARY KEY,
    count INT NOT NULL DEFAULT 1,
    last_request TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
*/

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip TEXT,
  p_max_count INT DEFAULT 3,
  p_window_ms INT DEFAULT 60000
) RETURNS TABLE(allowed BOOLEAN, remaining INT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_count INT;
  v_window_start TIMESTAMPTZ := v_now - (p_window_ms || ' milliseconds')::INTERVAL;
BEGIN
  INSERT INTO rate_limits (ip, count, last_request)
  VALUES (p_ip, 1, v_now)
  ON CONFLICT (ip) DO UPDATE
    SET
      count = CASE
        WHEN rate_limits.last_request < v_window_start THEN 1
        ELSE rate_limits.count + 1
      END,
      last_request = v_now
  RETURNING rate_limits.count INTO v_count;

  RETURN QUERY
  SELECT
    (v_count <= p_max_count) AS allowed,
    GREATEST(0, p_max_count - v_count)::INT AS remaining;
END;
$$;

-- Row-Level Security: allow the anon key to call this function
-- Adjust if you use a different service role key.
GRANT EXECUTE ON FUNCTION check_rate_limit TO anon;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO service_role;

COMMENT ON FUNCTION check_rate_limit IS
  'Atomically checks and increments a per-IP rate limit. Returns allowed + remaining count.';
