-- =====================================================
-- Fix RLS Infinite Recursion in sa_user_profiles
-- =====================================================
-- Problem: Admin policies create infinite recursion by querying 
-- sa_user_profiles from within sa_user_profiles policies
-- Solution: Use security definer functions to bypass RLS
-- =====================================================

-- Drop problematic admin policies
DROP POLICY IF EXISTS "Admins can view all users" ON sa_users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON sa_user_profiles;

-- Create function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION sa_is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sa_user_profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new admin policies using the function
CREATE POLICY "Admins can view all users" ON sa_users
  FOR SELECT USING (sa_is_admin());

CREATE POLICY "Admins can view all profiles" ON sa_user_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR sa_is_admin()
  );

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION sa_is_admin(uuid) TO authenticated;