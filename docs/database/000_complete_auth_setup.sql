-- =====================================================
-- SHADCN-ADMIN - COMPLETE AUTHENTICATION SETUP
-- =====================================================
-- Project: shadcn-admin
-- Purpose: Complete setup for user authentication with GitHub OAuth
-- Created: 2025-01-08
-- 
-- RUN THIS FILE IN YOUR SUPABASE SQL EDITOR
-- This combines all necessary tables and configurations
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
-- INDEXES FOR PERFORMANCE
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
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_github_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can view own record" ON sa_users;
DROP POLICY IF EXISTS "Users can update own record" ON sa_users;
DROP POLICY IF EXISTS "Users can view own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Admins can view all users" ON sa_users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can view own GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Users can insert own GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Users can update own GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Users can delete own GitHub profiles" ON sa_github_profiles;
DROP POLICY IF EXISTS "Admins can manage all GitHub profiles" ON sa_github_profiles;

-- Policies for sa_users
CREATE POLICY "Users can view own record" ON sa_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record" ON sa_users  
  FOR UPDATE USING (auth.uid() = id);

-- Policies for sa_user_profiles
CREATE POLICY "Users can view own profile" ON sa_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON sa_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON sa_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for sa_github_profiles
CREATE POLICY "Users can view own GitHub profiles" ON sa_github_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GitHub profiles" ON sa_github_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GitHub profiles" ON sa_github_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GitHub profiles" ON sa_github_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policies (admins can see/manage everything)
CREATE POLICY "Admins can view all users" ON sa_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sa_user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all profiles" ON sa_user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sa_user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all GitHub profiles" ON sa_github_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sa_user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION sa_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at on all tables
DROP TRIGGER IF EXISTS trigger_sa_users_updated_at ON sa_users;
CREATE TRIGGER trigger_sa_users_updated_at
  BEFORE UPDATE ON sa_users
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at();

DROP TRIGGER IF EXISTS trigger_sa_user_profiles_updated_at ON sa_user_profiles;
CREATE TRIGGER trigger_sa_user_profiles_updated_at
  BEFORE UPDATE ON sa_user_profiles
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at();

DROP TRIGGER IF EXISTS trigger_sa_github_profiles_updated_at ON sa_github_profiles;
CREATE TRIGGER trigger_sa_github_profiles_updated_at
  BEFORE UPDATE ON sa_github_profiles
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at();

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION sa_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into sa_users
  INSERT INTO sa_users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  
  -- Insert default profile
  INSERT INTO sa_user_profiles (user_id, name, role, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'user', NOW(), NOW());
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to run function when new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sa_handle_new_user();

-- =====================================================
-- VIEWS (Optional - for easier queries)
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
-- TABLE COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE sa_users IS 'Main users table linked to Supabase auth.users';
COMMENT ON TABLE sa_user_profiles IS 'Extended user profiles with additional data';
COMMENT ON TABLE sa_github_profiles IS 'GitHub OAuth profiles linked to system users';

COMMENT ON COLUMN sa_users.id IS 'References auth.users.id from Supabase Auth';
COMMENT ON COLUMN sa_user_profiles.role IS 'User role: user, admin, or moderator';
COMMENT ON COLUMN sa_user_profiles.theme IS 'UI theme preference: light, dark, or system';
COMMENT ON COLUMN sa_github_profiles.user_id IS 'References sa_users.id - which user owns this GitHub connection';

-- =====================================================
-- INITIAL ADMIN USER (Optional)
-- =====================================================

/*
-- After running this migration and creating your first user account,
-- you can promote that user to admin by running:

UPDATE sa_user_profiles 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM sa_users WHERE email = 'your-email@example.com');
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- All tables, indexes, RLS policies, triggers and functions created successfully!
-- 
-- Next steps:
-- 1. Enable GitHub OAuth in Supabase Dashboard -> Authentication -> Providers
-- 2. Add your GitHub OAuth App credentials
-- 3. Set the callback URL to: https://your-project.supabase.co/auth/v1/callback
-- 4. Test user registration and GitHub OAuth login
-- =====================================================