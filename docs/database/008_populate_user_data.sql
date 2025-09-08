-- =====================================================
-- POPULATE USER DATA MANUALLY
-- =====================================================
-- This script manually creates the user records that 
-- should have been created by the trigger
-- =====================================================

-- Insert your user record into sa_users
INSERT INTO sa_users (id, email, created_at, updated_at)
VALUES (
  '3f6ed0df-f6ec-476c-8e03-47a98085f762'::uuid,
  'satnaingdev@gmail.com',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Insert your profile record into sa_user_profiles  
INSERT INTO sa_user_profiles (user_id, name, role, timezone, language, theme, email_notifications, created_at, updated_at)
VALUES (
  '3f6ed0df-f6ec-476c-8e03-47a98085f762'::uuid,
  'satnaing',
  'user',
  'UTC',
  'en',
  'system',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Verify the data was inserted
SELECT 'User data populated successfully!' as status;

SELECT 
  u.id,
  u.email,
  p.name,
  p.role
FROM sa_users u
LEFT JOIN sa_user_profiles p ON u.id = p.user_id
WHERE u.id = '3f6ed0df-f6ec-476c-8e03-47a98085f762'::uuid;