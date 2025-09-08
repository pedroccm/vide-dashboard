-- =====================================================
-- SHADCN-ADMIN - COMPLETE DATABASE SETUP
-- =====================================================
-- Project: shadcn-admin
-- Purpose: Complete database schema for authentication and GitHub integration
-- Created: 2025-01-08
-- 
-- RUN THIS FILE IN YOUR SUPABASE SQL EDITOR
-- This is the single source of truth for all database setup
-- =====================================================

-- =====================================================
-- PART 1: USER AUTHENTICATION SYSTEM
-- =====================================================

-- Table: Main Users (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS sa_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Extended User Profiles
CREATE TABLE IF NOT EXISTS sa_user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES sa_users(id) ON DELETE CASCADE,
  name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  bio text,
  website text,
  location text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Table: GitHub OAuth Profiles
CREATE TABLE IF NOT EXISTS sa_github_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES sa_users(id) ON DELETE CASCADE,
  github_user_id bigint NOT NULL UNIQUE,
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
-- PART 2: INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for sa_users
CREATE INDEX IF NOT EXISTS idx_sa_users_email ON sa_users(email);
CREATE INDEX IF NOT EXISTS idx_sa_users_created_at ON sa_users(created_at);

-- Indexes for sa_user_profiles  
CREATE INDEX IF NOT EXISTS idx_sa_user_profiles_user_id ON sa_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sa_user_profiles_role ON sa_user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_sa_user_profiles_created_at ON sa_user_profiles(created_at);

-- Indexes for sa_github_profiles
CREATE INDEX IF NOT EXISTS idx_sa_github_profiles_user_id ON sa_github_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sa_github_profiles_github_user_id ON sa_github_profiles(github_user_id);
CREATE INDEX IF NOT EXISTS idx_sa_github_profiles_github_username ON sa_github_profiles(github_username);
CREATE INDEX IF NOT EXISTS idx_sa_github_profiles_updated_at ON sa_github_profiles(updated_at);

-- =====================================================
-- PART 3: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_github_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on sa_users
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sa_users' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON sa_users';
    END LOOP;
    
    -- Drop all policies on sa_user_profiles  
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sa_user_profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON sa_user_profiles';
    END LOOP;
    
    -- Drop all policies on sa_github_profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sa_github_profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON sa_github_profiles';
    END LOOP;
END
$$;

-- Drop any existing functions
DROP FUNCTION IF EXISTS sa_is_admin(uuid);
DROP FUNCTION IF EXISTS check_user_role(uuid, text);
DROP FUNCTION IF EXISTS is_admin();

-- Policies for sa_users
CREATE POLICY "users_select_own" ON sa_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON sa_users  
  FOR UPDATE USING (auth.uid() = id);

-- Policies for sa_user_profiles
CREATE POLICY "profiles_select_own" ON sa_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON sa_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON sa_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for sa_github_profiles
CREATE POLICY "github_profiles_select_own" ON sa_github_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "github_profiles_insert_own" ON sa_github_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "github_profiles_update_own" ON sa_github_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "github_profiles_delete_own" ON sa_github_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Simple admin function (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sa_user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies (separate names, using function)
CREATE POLICY "admin_select_users" ON sa_users
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_select_profiles" ON sa_user_profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_manage_github_profiles" ON sa_github_profiles
  FOR ALL USING (is_admin());

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =====================================================
-- PART 4: FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION sa_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_sa_users_updated_at ON sa_users;
DROP TRIGGER IF EXISTS trigger_sa_user_profiles_updated_at ON sa_user_profiles;
DROP TRIGGER IF EXISTS trigger_sa_github_profiles_updated_at ON sa_github_profiles;

-- Triggers for updated_at on all tables
CREATE TRIGGER trigger_sa_users_updated_at
  BEFORE UPDATE ON sa_users
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at();

CREATE TRIGGER trigger_sa_user_profiles_updated_at
  BEFORE UPDATE ON sa_user_profiles
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at();

CREATE TRIGGER trigger_sa_github_profiles_updated_at
  BEFORE UPDATE ON sa_github_profiles
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at();

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION sa_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into sa_users (ignore if exists)
  INSERT INTO sa_users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert default profile (ignore if exists)
  INSERT INTO sa_user_profiles (user_id, name, role, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 
    'user', 
    NOW(), 
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function when new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sa_handle_new_user();

-- =====================================================
-- PART 5: VIEWS (Optional - for easier queries)
-- =====================================================

-- View combining user and profile data
CREATE OR REPLACE VIEW sa_users_complete AS
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  p.name,
  p.avatar_url,
  p.role,
  p.bio,
  p.website,
  p.location,
  p.timezone,
  p.language,
  p.theme,
  p.email_notifications,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM sa_users u
LEFT JOIN sa_user_profiles p ON u.id = p.user_id;

-- =====================================================
-- PART 6: TABLE COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE sa_users IS 'Main users table linked to Supabase auth.users';
COMMENT ON TABLE sa_user_profiles IS 'Extended user profiles with additional data';
COMMENT ON TABLE sa_github_profiles IS 'GitHub OAuth profiles linked to system users';

COMMENT ON COLUMN sa_users.id IS 'References auth.users.id from Supabase Auth';
COMMENT ON COLUMN sa_user_profiles.role IS 'User role: user, admin, or moderator';
COMMENT ON COLUMN sa_user_profiles.theme IS 'UI theme preference: light, dark, or system';
COMMENT ON COLUMN sa_github_profiles.user_id IS 'References sa_users.id - which user owns this GitHub connection';
COMMENT ON COLUMN sa_github_profiles.access_token IS 'GitHub OAuth access token for API access';

-- =====================================================
-- PART 7: VERIFICATION & SUCCESS MESSAGE
-- =====================================================

-- Test the setup
SELECT 
  'Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename LIKE 'sa_%') as tables_created,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE 'sa_%') as policies_created;

-- Show created tables
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'sa_users' THEN 'Main user authentication table'
    WHEN table_name = 'sa_user_profiles' THEN 'Extended user profiles and preferences' 
    WHEN table_name = 'sa_github_profiles' THEN 'GitHub OAuth tokens and profiles'
    ELSE 'Other table'
  END as description
FROM information_schema.tables 
WHERE table_name LIKE 'sa_%' 
AND table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- SETUP INSTRUCTIONS
-- =====================================================

/*

NEXT STEPS AFTER RUNNING THIS SCRIPT:

1. GITHUB OAUTH SETUP:
   - Go to Supabase Dashboard -> Authentication -> Providers
   - Enable GitHub OAuth provider
   - Add your GitHub OAuth App credentials (Client ID & Secret)
   - Set the callback URL to: https://your-project.supabase.co/auth/v1/callback

2. FIRST ADMIN USER:
   - Create your first user account through the app
   - Then run this query to make them admin:
   
   UPDATE sa_user_profiles 
   SET role = 'admin' 
   WHERE user_id = (SELECT id FROM sa_users WHERE email = 'your-email@example.com');

3. TEST THE SYSTEM:
   - Sign up a new user
   - Verify user and profile are created automatically
   - Test GitHub OAuth connection
   - Check that RLS policies work correctly

4. PRODUCTION CONSIDERATIONS:
   - Consider encrypting GitHub access tokens
   - Set up proper backup procedures
   - Monitor and rotate OAuth tokens regularly
   - Review and audit RLS policies

*/

-- =====================================================
-- END OF SETUP SCRIPT
-- =====================================================