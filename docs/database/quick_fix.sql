-- =====================================================
-- QUICK FIX - Create missing tables if they don't exist
-- =====================================================
-- This script creates essential tables if they're missing
-- Run this ONLY if the main database_setup.sql wasn't executed
-- =====================================================

-- Create sa_users table if missing
CREATE TABLE IF NOT EXISTS sa_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sa_user_profiles table if missing
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

-- Create sa_github_profiles table if missing
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

-- Enable RLS
ALTER TABLE sa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_github_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_select_own" ON sa_users;
DROP POLICY IF EXISTS "users_update_own" ON sa_users;
DROP POLICY IF EXISTS "profiles_select_own" ON sa_user_profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON sa_user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON sa_user_profiles;
DROP POLICY IF EXISTS "github_profiles_select_own" ON sa_github_profiles;
DROP POLICY IF EXISTS "github_profiles_insert_own" ON sa_github_profiles;
DROP POLICY IF EXISTS "github_profiles_update_own" ON sa_github_profiles;
DROP POLICY IF EXISTS "github_profiles_delete_own" ON sa_github_profiles;

-- Create simple policies
CREATE POLICY "users_select_own" ON sa_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON sa_users  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON sa_users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_own" ON sa_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON sa_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON sa_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "github_profiles_select_own" ON sa_github_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "github_profiles_insert_own" ON sa_github_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "github_profiles_update_own" ON sa_github_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "github_profiles_delete_own" ON sa_github_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create essential function
CREATE OR REPLACE FUNCTION sa_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
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

-- Create user auto-creation function
CREATE OR REPLACE FUNCTION sa_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into sa_users (ignore if exists)
  INSERT INTO sa_users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert profile (ignore if exists)
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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sa_handle_new_user();

-- Verify tables were created
SELECT 'Quick fix applied successfully!' as status;
SELECT 
  table_name,
  'Table created' as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sa_users', 'sa_user_profiles', 'sa_github_profiles')
ORDER BY table_name;