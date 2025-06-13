-- SQL script to debug user tables and trigger issues

-- 1. Check if the trigger exists and is enabled
SELECT 
    tgname AS trigger_name,
    tgenabled AS is_enabled,
    tgtype,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users' AND tgname = 'on_auth_user_created';

-- 2. Check the handle_new_user function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check the structure of user_usage table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'user_usage'
ORDER BY 
    ordinal_position;

-- 4. Check the structure of consolidated_users table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'consolidated_users'
ORDER BY 
    ordinal_position;

-- 5. Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule,
    tc.is_deferrable,
    tc.initially_deferred
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'user_usage';

-- 6. Check a sample of recent users in auth.users
SELECT 
    id, 
    email, 
    raw_user_meta_data,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 7. Check if these users exist in user_usage
WITH recent_users AS (
    SELECT 
        id, 
        email, 
        raw_user_meta_data,
        created_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 5
)
SELECT 
    ru.id, 
    ru.email, 
    ru.raw_user_meta_data->>'name' AS meta_name,
    uu.email AS usage_email,
    uu.created_at AS usage_created_at
FROM recent_users ru
LEFT JOIN public.user_usage uu ON ru.id = uu.user_id;

-- 8. Check if these users exist in consolidated_users
WITH recent_users AS (
    SELECT 
        id, 
        email, 
        raw_user_meta_data,
        created_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 5
)
SELECT 
    ru.id, 
    ru.email, 
    ru.raw_user_meta_data->>'name' AS meta_name,
    cu.email AS consolidated_email,
    cu.created_at AS consolidated_created_at
FROM recent_users ru
LEFT JOIN public.consolidated_users cu ON ru.id = cu.user_id;

-- 9. Test the handle_new_user function directly with a sample user
-- (Uncomment this section to run it)
/*
DO $$
DECLARE
    test_user auth.users%ROWTYPE;
BEGIN
    -- Get a recent user to test with
    SELECT * INTO test_user FROM auth.users ORDER BY created_at DESC LIMIT 1;
    
    -- Call the function directly
    PERFORM handle_new_user(test_user);
    
    -- Output result
    RAISE NOTICE 'Tested handle_new_user with user: %', test_user.email;
END;
$$;
*/
