-- SQL script to fix the handle_new_user trigger function
-- This will ensure user email and metadata are properly saved to user_usage and consolidated_users tables

-- First, let's update the handle_new_user function to extract email and metadata
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

-- Make sure the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    -- Create the trigger if it doesn't exist
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;

-- Update the foreign key constraint to be deferrable if it's not already
DO $$
BEGIN
  -- Check if the constraint exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_usage_user_id_fkey'
    AND table_schema = 'public'
    AND table_name = 'user_usage'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE public.user_usage DROP CONSTRAINT user_usage_user_id_fkey;
    
    -- Recreate it with DEFERRABLE INITIALLY DEFERRED
    ALTER TABLE public.user_usage
    ADD CONSTRAINT user_usage_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
    DEFERRABLE INITIALLY DEFERRED;
  END IF;
END;
$$;
