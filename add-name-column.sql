-- SQL script to add name column to user tables and update the trigger function

-- 1. Add name column to user_usage table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_usage' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.user_usage ADD COLUMN name TEXT;
    RAISE NOTICE 'Added name column to user_usage table';
  ELSE
    RAISE NOTICE 'name column already exists in user_usage table';
  END IF;
END;
$$;

-- 2. Add name column to consolidated_users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'consolidated_users' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.consolidated_users ADD COLUMN name TEXT;
    RAISE NOTICE 'Added name column to consolidated_users table';
  ELSE
    RAISE NOTICE 'name column already exists in consolidated_users table';
  END IF;
END;
$$;

-- 3. Update the handle_new_user function to populate the name column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  metadata JSONB;
BEGIN
  -- Get the user's email from auth.users
  user_email := NEW.email;
  
  -- Get the user's metadata (which contains the name)
  metadata := NEW.raw_user_meta_data;
  
  -- Extract name from metadata if available, otherwise use email
  IF metadata IS NOT NULL AND metadata->>'name' IS NOT NULL THEN
    user_name := metadata->>'name';
  ELSE
    -- Fallback to using part of the email as the name
    user_name := split_part(user_email, '@', 1);
  END IF;

  -- Insert into user_usage table with email and name
  BEGIN
    INSERT INTO public.user_usage (
      user_id, 
      email,
      name,
      photos_used, 
      photos_limit, 
      plan_type,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      user_email,
      user_name,
      0, 
      3, 
      'Trial',
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error creating user_usage record: %', SQLERRM;
  END;
  
  -- Insert into consolidated_users table with email and name
  BEGIN
    INSERT INTO public.consolidated_users (
      user_id, 
      email,
      name,
      photos_used, 
      photos_limit, 
      plan_type,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      user_email,
      user_name,
      0, 
      3, 
      'Trial',
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error creating consolidated_users record: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- 4. Update existing users with missing name and email
DO $$
DECLARE
  user_record RECORD;
  user_name TEXT;
BEGIN
  -- Update user_usage table
  FOR user_record IN 
    SELECT 
      u.id, 
      u.email, 
      u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.user_usage uu ON u.id = uu.user_id
    WHERE uu.email IS NULL OR uu.name IS NULL
  LOOP
    -- Extract name from metadata if available, otherwise use email
    IF user_record.raw_user_meta_data IS NOT NULL AND user_record.raw_user_meta_data->>'name' IS NOT NULL THEN
      user_name := user_record.raw_user_meta_data->>'name';
    ELSE
      -- Fallback to using part of the email as the name
      user_name := split_part(user_record.email, '@', 1);
    END IF;
    
    -- Update user_usage
    UPDATE public.user_usage
    SET 
      email = user_record.email,
      name = user_name,
      updated_at = NOW()
    WHERE user_id::text = user_record.id::text;
    
    -- If no rows were updated, the user doesn't exist in user_usage
    IF NOT FOUND THEN
      -- Insert new record
      BEGIN
        INSERT INTO public.user_usage (
          user_id, 
          email,
          name,
          photos_used, 
          photos_limit, 
          plan_type,
          created_at,
          updated_at
        )
        VALUES (
          user_record.id, 
          user_record.email,
          user_name,
          0, 
          3, 
          'Trial',
          NOW(),
          NOW()
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user_usage record for %: %', user_record.email, SQLERRM;
      END;
    END IF;
    
    -- Update consolidated_users
    UPDATE public.consolidated_users
    SET 
      email = user_record.email,
      name = user_name,
      updated_at = NOW()
    WHERE user_id::text = user_record.id::text;
    
    -- If no rows were updated, the user doesn't exist in consolidated_users
    IF NOT FOUND THEN
      -- Insert new record
      BEGIN
        INSERT INTO public.consolidated_users (
          user_id, 
          email,
          name,
          photos_used, 
          photos_limit, 
          plan_type,
          created_at,
          updated_at
        )
        VALUES (
          user_record.id, 
          user_record.email,
          user_name,
          0, 
          3, 
          'Trial',
          NOW(),
          NOW()
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating consolidated_users record for %: %', user_record.email, SQLERRM;
      END;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Updated existing users with missing name and email';
END;
$$;
