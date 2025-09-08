-- =====================================================
-- VERIFY DATABASE TABLES - Diagnostic Script
-- =====================================================
-- Run this script to check if all tables exist and are properly configured
-- =====================================================

-- Check if tables exist
SELECT 
    table_name,
    table_schema,
    CASE 
        WHEN table_name IN ('sa_users', 'sa_user_profiles', 'sa_github_profiles') THEN '✅ Expected table'
        ELSE '❓ Unknown table'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'sa_%'
ORDER BY table_name;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'sa_%'
ORDER BY tablename;

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT' 
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        WHEN cmd = '*' THEN 'ALL'
        ELSE cmd
    END as operation_name
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'sa_%'
ORDER BY tablename, policyname;

-- Check functions
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN ('sa_update_updated_at', 'sa_handle_new_user', 'is_admin') THEN '✅ Expected function'
        ELSE '❓ Other function'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%sa_%' OR routine_name = 'is_admin'
ORDER BY routine_name;

-- Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    CASE 
        WHEN trigger_name LIKE '%sa_%' THEN '✅ Expected trigger'
        ELSE '❓ Other trigger'
    END as status
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
AND (event_object_table LIKE 'sa_%' OR trigger_name LIKE '%sa_%')
ORDER BY event_object_table, trigger_name;

-- Test basic connectivity (should return current timestamp)
SELECT 
    'Database connection working!' as message,
    NOW() as current_timestamp;

-- Summary
SELECT 
    '=== DIAGNOSTIC SUMMARY ===' as section,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'sa_%') as tables_found,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'sa_%') as policies_found,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND (routine_name LIKE '%sa_%' OR routine_name = 'is_admin')) as functions_found;