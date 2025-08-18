-- Enable Row Level Security (RLS) on all tables
-- This migration adds RLS policies to secure data access at the database level

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS TEXT 
LANGUAGE sql 
STABLE
AS $$
  SELECT current_setting('app.current_user_id', true)::text
$$;

-- Create a function to get the current user role
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS TEXT 
LANGUAGE sql 
STABLE
AS $$
  SELECT current_setting('app.current_user_role', true)::text
$$;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE
AS $$
  SELECT auth.user_role() = 'ADMIN'
$$;

-- Create a function to check if user is support
CREATE OR REPLACE FUNCTION auth.is_support() 
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE
AS $$
  SELECT auth.user_role() IN ('ADMIN', 'SUPPORT')
$$;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Policy: Users can read their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (
    id = auth.user_id() OR
    auth.is_support()
  );

-- Policy: Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = auth.user_id())
  WITH CHECK (id = auth.user_id());

-- Policy: Only admins can insert new users
CREATE POLICY users_insert_admin ON users
  FOR INSERT
  WITH CHECK (auth.is_admin());

-- Policy: Only admins can delete users
CREATE POLICY users_delete_admin ON users
  FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================

-- Policy: Users can only see their own sessions
CREATE POLICY sessions_select_own ON sessions
  FOR SELECT
  USING (
    "userId" = auth.user_id() OR
    auth.is_admin()
  );

-- Policy: Users can only delete their own sessions
CREATE POLICY sessions_delete_own ON sessions
  FOR DELETE
  USING ("userId" = auth.user_id());

-- Policy: Sessions can be created by anyone (for login)
CREATE POLICY sessions_insert_all ON sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own sessions
CREATE POLICY sessions_update_own ON sessions
  FOR UPDATE
  USING ("userId" = auth.user_id())
  WITH CHECK ("userId" = auth.user_id());

-- ============================================
-- API_KEYS TABLE POLICIES
-- ============================================

-- Policy: Users can only see their own API keys
CREATE POLICY api_keys_select_own ON api_keys
  FOR SELECT
  USING (
    "userId" = auth.user_id() OR
    auth.is_admin()
  );

-- Policy: Users can create their own API keys
CREATE POLICY api_keys_insert_own ON api_keys
  FOR INSERT
  WITH CHECK ("userId" = auth.user_id());

-- Policy: Users can update their own API keys
CREATE POLICY api_keys_update_own ON api_keys
  FOR UPDATE
  USING ("userId" = auth.user_id())
  WITH CHECK ("userId" = auth.user_id());

-- Policy: Users can delete their own API keys
CREATE POLICY api_keys_delete_own ON api_keys
  FOR DELETE
  USING ("userId" = auth.user_id());

-- ============================================
-- AUDIT_LOGS TABLE POLICIES
-- ============================================

-- Policy: Only admins and support can view audit logs
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT
  USING (auth.is_support());

-- Policy: System can insert audit logs (no user restriction)
CREATE POLICY audit_logs_insert_all ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RATE_LIMITS TABLE POLICIES
-- ============================================

-- Policy: Users can see their own rate limits
CREATE POLICY rate_limits_select_own ON rate_limits
  FOR SELECT
  USING (
    identifier = auth.user_id() OR
    auth.is_admin()
  );

-- Policy: System can manage rate limits
CREATE POLICY rate_limits_insert_all ON rate_limits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY rate_limits_update_all ON rate_limits
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY rate_limits_delete_all ON rate_limits
  FOR DELETE
  USING (true);

-- ============================================
-- WEBHOOK_EVENTS TABLE POLICIES
-- ============================================

-- Policy: Only admins can view webhook events
CREATE POLICY webhook_events_select_admin ON webhook_events
  FOR SELECT
  USING (auth.is_admin());

-- Policy: System can insert webhook events
CREATE POLICY webhook_events_insert_all ON webhook_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update webhook events
CREATE POLICY webhook_events_update_admin ON webhook_events
  FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ============================================
-- EMAIL_QUEUE TABLE POLICIES
-- ============================================

-- Policy: Users can see their own emails
CREATE POLICY email_queue_select_own ON email_queue
  FOR SELECT
  USING (
    auth.user_id() = ANY(to) OR
    auth.is_support()
  );

-- Policy: System can insert emails
CREATE POLICY email_queue_insert_all ON email_queue
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can update email queue
CREATE POLICY email_queue_update_admin ON email_queue
  FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ============================================
-- FEATURE_FLAGS TABLE POLICIES
-- ============================================

-- Policy: Everyone can read enabled feature flags
CREATE POLICY feature_flags_select_all ON feature_flags
  FOR SELECT
  USING (
    enabled = true OR
    auth.is_admin()
  );

-- Policy: Only admins can manage feature flags
CREATE POLICY feature_flags_insert_admin ON feature_flags
  FOR INSERT
  WITH CHECK (auth.is_admin());

CREATE POLICY feature_flags_update_admin ON feature_flags
  FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY feature_flags_delete_admin ON feature_flags
  FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- SYSTEM_CONFIG TABLE POLICIES
-- ============================================

-- Policy: Everyone can read non-secret configs
CREATE POLICY system_config_select_public ON system_config
  FOR SELECT
  USING (
    "isSecret" = false OR
    auth.is_admin()
  );

-- Policy: Only admins can manage system config
CREATE POLICY system_config_insert_admin ON system_config
  FOR INSERT
  WITH CHECK (auth.is_admin());

CREATE POLICY system_config_update_admin ON system_config
  FOR UPDATE
  USING (auth.is_admin() AND "isReadOnly" = false)
  WITH CHECK (auth.is_admin() AND "isReadOnly" = false);

CREATE POLICY system_config_delete_admin ON system_config
  FOR DELETE
  USING (auth.is_admin() AND "isReadOnly" = false);

-- ============================================
-- CREATE SERVICE ROLE FOR BYPASSING RLS
-- ============================================

-- Create a role that bypasses RLS for administrative tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role;
  END IF;
END
$$;

-- Grant all privileges to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create application roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
END
$$;

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant limited permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON feature_flags TO anon;
GRANT SELECT ON system_config TO anon;

-- Add comment explaining RLS setup
COMMENT ON SCHEMA public IS 'Row Level Security enabled. Use SET LOCAL commands to set user context.';