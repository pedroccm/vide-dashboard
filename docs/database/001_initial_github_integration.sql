-- =====================================================
-- SHADCN ADMIN - GitHub Integration Database Schema
-- =====================================================
-- Project: shadcn-admin
-- Purpose: GitHub OAuth integration with persistent storage
-- Prefix: sa_admin_
-- Created: 2025-01-08
-- =====================================================

-- Table: GitHub User Profiles
-- Stores GitHub OAuth tokens and user information
CREATE TABLE sa_admin_github_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  github_user_id bigint UNIQUE NOT NULL,
  github_username text NOT NULL,
  access_token text NOT NULL,
  scope text NOT NULL,
  avatar_url text,
  name text,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for fast lookups by GitHub user ID
CREATE INDEX idx_sa_admin_github_profiles_user_id 
ON sa_admin_github_profiles(github_user_id);

-- Index for fast lookups by username
CREATE INDEX idx_sa_admin_github_profiles_username 
ON sa_admin_github_profiles(github_username);

-- Index for updated_at (useful for cleanup/maintenance)
CREATE INDEX idx_sa_admin_github_profiles_updated_at 
ON sa_admin_github_profiles(updated_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on the table
ALTER TABLE sa_admin_github_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (development phase)
-- TODO: Restrict based on authentication in production
CREATE POLICY "sa_admin_github_profiles_allow_all" ON sa_admin_github_profiles
  FOR ALL USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION sa_admin_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function on UPDATE
CREATE TRIGGER trigger_sa_admin_github_profiles_updated_at
  BEFORE UPDATE ON sa_admin_github_profiles
  FOR EACH ROW EXECUTE PROCEDURE sa_admin_update_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE sa_admin_github_profiles IS 
'GitHub OAuth user profiles and access tokens for shadcn-admin project';

COMMENT ON COLUMN sa_admin_github_profiles.github_user_id IS 
'GitHub user ID (from GitHub API)';

COMMENT ON COLUMN sa_admin_github_profiles.access_token IS 
'GitHub OAuth access token (encrypted storage recommended in production)';

COMMENT ON COLUMN sa_admin_github_profiles.scope IS 
'OAuth scopes granted (e.g. "repo,user")';

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- No initial data needed for this table

-- =====================================================
-- ROLLBACK SCRIPT (for development)
-- =====================================================

/*
-- To rollback this migration:

DROP TRIGGER IF EXISTS trigger_sa_admin_github_profiles_updated_at ON sa_admin_github_profiles;
DROP FUNCTION IF EXISTS sa_admin_update_updated_at();
DROP POLICY IF EXISTS "sa_admin_github_profiles_allow_all" ON sa_admin_github_profiles;
DROP INDEX IF EXISTS idx_sa_admin_github_profiles_updated_at;
DROP INDEX IF EXISTS idx_sa_admin_github_profiles_username;
DROP INDEX IF EXISTS idx_sa_admin_github_profiles_user_id;
DROP TABLE IF EXISTS sa_admin_github_profiles;
*/