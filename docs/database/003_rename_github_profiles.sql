-- =====================================================
-- SA ADMIN - Rename GitHub Profiles Table
-- =====================================================
-- Project: shadcn-admin
-- Purpose: Rename sa_admin_github_profiles to sa_github_profiles
-- And link to user authentication system
-- Created: 2025-01-08
-- =====================================================

-- NOTE: Run this ONLY if you already have sa_admin_github_profiles table
-- If you haven't created it yet, skip this and use the new schema directly

-- =====================================================
-- STEP 1: Rename table and related objects
-- =====================================================

-- Rename the table
ALTER TABLE IF EXISTS sa_admin_github_profiles 
RENAME TO sa_github_profiles;

-- Rename indexes
ALTER INDEX IF EXISTS idx_sa_admin_github_profiles_user_id 
RENAME TO idx_sa_github_profiles_user_id;

ALTER INDEX IF EXISTS idx_sa_admin_github_profiles_username 
RENAME TO idx_sa_github_profiles_username;

ALTER INDEX IF EXISTS idx_sa_admin_github_profiles_updated_at 
RENAME TO idx_sa_github_profiles_updated_at;

-- Rename function
ALTER FUNCTION IF EXISTS sa_admin_update_updated_at() 
RENAME TO sa_update_updated_at_github;

-- Rename trigger
DROP TRIGGER IF EXISTS trigger_sa_admin_github_profiles_updated_at ON sa_github_profiles;
CREATE TRIGGER trigger_sa_github_profiles_updated_at
  BEFORE UPDATE ON sa_github_profiles
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at_github();

-- Rename RLS policy
DROP POLICY IF EXISTS "sa_admin_github_profiles_allow_all" ON sa_github_profiles;

-- =====================================================
-- STEP 2: Add user_id column to link with authentication
-- =====================================================

-- Add user_id column to link with sa_users
ALTER TABLE sa_github_profiles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES sa_users(id) ON DELETE CASCADE;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_sa_github_profiles_user_id_fk 
ON sa_github_profiles(user_id);

-- =====================================================
-- STEP 3: Update RLS policies for new structure
-- =====================================================

-- Enable RLS (if not already enabled)
ALTER TABLE sa_github_profiles ENABLE ROW LEVEL SECURITY;

-- New policies that work with user authentication
CREATE POLICY "Users can view own GitHub profiles" ON sa_github_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GitHub profiles" ON sa_github_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GitHub profiles" ON sa_github_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GitHub profiles" ON sa_github_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policy
CREATE POLICY "Admins can manage all GitHub profiles" ON sa_github_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sa_user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- STEP 4: Update comments
-- =====================================================

COMMENT ON TABLE sa_github_profiles IS 
'GitHub OAuth profiles linked to system users';

COMMENT ON COLUMN sa_github_profiles.user_id IS 
'References sa_users.id - which user owns this GitHub connection';

-- =====================================================
-- MIGRATION FOR EXISTING DATA (if needed)
-- =====================================================

/*
-- If you have existing GitHub profiles that need to be linked to users,
-- you would need to run something like this AFTER creating your first user:

-- Example: Link existing GitHub profile to first user
-- UPDATE sa_github_profiles 
-- SET user_id = (SELECT id FROM sa_users LIMIT 1)
-- WHERE user_id IS NULL;
*/

-- =====================================================
-- ROLLBACK SCRIPT
-- =====================================================

/*
-- To rollback this migration:

DROP POLICY IF EXISTS "Admins can manage all GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Users can delete own GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Users can update own GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Users can insert own GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Users can view own GitHub profiles" ON sa_github_profiles;

DROP INDEX IF EXISTS idx_sa_github_profiles_user_id_fk;
ALTER TABLE IF EXISTS sa_github_profiles DROP COLUMN IF EXISTS user_id;

DROP TRIGGER IF EXISTS trigger_sa_github_profiles_updated_at ON sa_github_profiles;
ALTER FUNCTION IF EXISTS sa_update_updated_at_github() RENAME TO sa_admin_update_updated_at;

ALTER INDEX IF EXISTS idx_sa_github_profiles_updated_at RENAME TO idx_sa_admin_github_profiles_updated_at;
ALTER INDEX IF EXISTS idx_sa_github_profiles_username RENAME TO idx_sa_admin_github_profiles_username;  
ALTER INDEX IF EXISTS idx_sa_github_profiles_user_id RENAME TO idx_sa_admin_github_profiles_user_id;

ALTER TABLE IF EXISTS sa_github_profiles RENAME TO sa_admin_github_profiles;
*/