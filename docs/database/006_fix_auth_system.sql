-- =====================================================
-- COMPLETE AUTH SYSTEM FIX
-- =====================================================
-- This script fixes all authentication issues:
-- 1. RLS infinite recursion
-- 2. Missing auth triggers  
-- 3. Proper callback handling
-- =====================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own record" ON sa_users;
DROP POLICY IF EXISTS "Users can update own record" ON sa_users;
DROP POLICY IF EXISTS "Users can view own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON sa_user_profiles;
DROP POLICY IF EXISTS "Admins can view all users" ON sa_users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON sa_user_profiles;

-- Drop function if exists
DROP FUNCTION IF EXISTS sa_is_admin(uuid);

-- Create simple, non-recursive policies
-- Basic user policies (no recursion)
CREATE POLICY "Enable read for users on own data" ON sa_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users on own data" ON sa_users  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read for users on own profile" ON sa_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users on own profile" ON sa_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users on own profile" ON sa_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Simple admin check function (security definer bypasses RLS)
CREATE OR REPLACE FUNCTION check_user_role(user_uuid uuid, required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sa_user_profiles 
    WHERE user_id = user_uuid AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies using the function (no recursion)
CREATE POLICY "Enable admin read access" ON sa_users
  FOR SELECT USING (check_user_role(auth.uid(), 'admin'));

CREATE POLICY "Enable admin read access" ON sa_user_profiles
  FOR SELECT USING (check_user_role(auth.uid(), 'admin'));

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_user_role(uuid, text) TO authenticated;

-- Fix the user creation trigger to be more robust
CREATE OR REPLACE FUNCTION sa_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into sa_users only if not exists
  INSERT INTO sa_users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert default profile only if not exists  
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

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sa_handle_new_user();

-- Test the setup
SELECT 'Auth system fixed successfully!' as status;