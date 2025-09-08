-- =====================================================
-- SA ADMIN - User Authentication System
-- =====================================================
-- Project: shadcn-admin
-- Purpose: Complete user authentication with Supabase Auth
-- Prefix: sa_
-- Created: 2025-01-08
-- =====================================================

-- =====================================================
-- IMPORTANT: Supabase Auth Setup Required
-- =====================================================
-- Before running this migration:
-- 1. Enable Authentication in Supabase Dashboard
-- 2. Configure email templates
-- 3. Set up OAuth providers (GitHub, Google, etc)
-- =====================================================

-- Table: Main Users (linked to Supabase auth.users)
-- This table extends Supabase's built-in auth.users table
CREATE TABLE sa_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Extended User Profiles
-- Additional user information and preferences
CREATE TABLE sa_user_profiles (
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

-- =====================================================
-- INDEXES
-- =====================================================

-- Indexes for sa_users
CREATE INDEX idx_sa_users_email ON sa_users(email);
CREATE INDEX idx_sa_users_created_at ON sa_users(created_at);

-- Indexes for sa_user_profiles  
CREATE INDEX idx_sa_user_profiles_user_id ON sa_user_profiles(user_id);
CREATE INDEX idx_sa_user_profiles_role ON sa_user_profiles(role);
CREATE INDEX idx_sa_user_profiles_created_at ON sa_user_profiles(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE sa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_user_profiles ENABLE ROW LEVEL SECURITY;

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

-- Admin policies (admins can see all users)
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

-- Triggers for updated_at
CREATE TRIGGER trigger_sa_users_updated_at
  BEFORE UPDATE ON sa_users
  FOR EACH ROW EXECUTE PROCEDURE sa_update_updated_at();

CREATE TRIGGER trigger_sa_user_profiles_updated_at
  BEFORE UPDATE ON sa_user_profiles
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sa_handle_new_user();

-- =====================================================
-- VIEWS (Optional - for easier queries)
-- =====================================================

-- View combining user and profile data
CREATE VIEW sa_users_complete AS
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

-- RLS for view
ALTER VIEW sa_users_complete ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE sa_users IS 'Main users table linked to Supabase auth.users';
COMMENT ON TABLE sa_user_profiles IS 'Extended user profiles with additional data';

COMMENT ON COLUMN sa_users.id IS 'References auth.users.id from Supabase Auth';
COMMENT ON COLUMN sa_user_profiles.role IS 'User role: user, admin, or moderator';
COMMENT ON COLUMN sa_user_profiles.theme IS 'UI theme preference: light, dark, or system';

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================

-- Example admin user (will be created via signup, this is just for reference)
-- INSERT INTO sa_user_profiles (user_id, name, role) 
-- VALUES ('your-user-id', 'Admin User', 'admin');

-- =====================================================
-- ROLLBACK SCRIPT
-- =====================================================

/*
-- To rollback this migration:

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS sa_handle_new_user();
DROP TRIGGER IF EXISTS trigger_sa_user_profiles_updated_at ON sa_user_profiles;
DROP TRIGGER IF EXISTS trigger_sa_users_updated_at ON sa_users;
DROP FUNCTION IF EXISTS sa_update_updated_at();
DROP VIEW IF EXISTS sa_users_complete;
DROP POLICY IF EXISTS "Admins can view all profiles" ON sa_user_profiles;
DROP POLICY IF EXISTS "Admins can view all users" ON sa_users;
DROP POLICY IF EXISTS "Users can update own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can update own record" ON sa_users;
DROP POLICY IF EXISTS "Users can view own record" ON sa_users;
DROP INDEX IF EXISTS idx_sa_user_profiles_created_at;
DROP INDEX IF EXISTS idx_sa_user_profiles_role;
DROP INDEX IF EXISTS idx_sa_user_profiles_user_id;
DROP INDEX IF EXISTS idx_sa_users_created_at;
DROP INDEX IF EXISTS idx_sa_users_email;
DROP TABLE IF EXISTS sa_user_profiles;
DROP TABLE IF EXISTS sa_users;
*/