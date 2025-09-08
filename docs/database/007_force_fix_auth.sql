-- =====================================================
-- FORCE FIX AUTHENTICATION SYSTEM
-- =====================================================
-- This script forcefully fixes all auth issues by
-- completely resetting RLS policies and functions
-- =====================================================

-- Disable RLS temporarily to avoid issues
ALTER TABLE sa_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sa_user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies (including any missed ones)
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
END
$$;

-- Drop any existing functions
DROP FUNCTION IF EXISTS sa_is_admin(uuid);
DROP FUNCTION IF EXISTS check_user_role(uuid, text);

-- Re-enable RLS
ALTER TABLE sa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sa_user_profiles ENABLE ROW LEVEL SECURITY;

-- Create new simple policies (no recursion)
CREATE POLICY "users_select_own" ON sa_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON sa_users  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_own" ON sa_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON sa_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON sa_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Fix user creation trigger
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

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sa_handle_new_user();

-- Test query
SELECT 
  'Auth system completely reset and fixed!' as status,
  COUNT(*) as policy_count_users
FROM pg_policies 
WHERE tablename = 'sa_users' AND schemaname = 'public';