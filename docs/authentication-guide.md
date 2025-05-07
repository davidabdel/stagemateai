# StageMate AI Authentication Guide

## Overview

This document details the authentication process for StageMate AI, including how new users sign up, potential issues that may arise, and their solutions. This serves as a reference for troubleshooting authentication problems in the future.

## Authentication Flow

### 1. User Signup Process

The signup process follows these steps:

1. User navigates to `/try` page
2. User enters email, password, and name
3. The application attempts to sign in first (in case the user already exists)
4. If sign-in fails, it attempts to sign up with Supabase Auth
5. On successful signup, the user is either:
   - Redirected to the dashboard (if auto-confirmation is enabled)
   - Asked to check their email for confirmation (if email confirmation is required)

### 2. Key Components

- **Client-side Authentication**: Handled in `src/app/try/page.tsx`
- **Supabase Authentication**: Uses `@supabase/supabase-js` client
- **Environment Variables**: Stored in `.env.local`
- **Database Triggers**: A trigger on `auth.users` inserts records into `user_usage`

## Implementation Details

### Supabase Client Setup

The Supabase client is initialized in `src/utils/supabaseClient.ts`:

```javascript
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpeoiqffhqszovsnwmjt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Signup Implementation

The robust signup implementation in `src/app/try/page.tsx`:

```javascript
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email || !password || !name) {
    setError("Please fill in all fields");
    return;
  }
  
  try {
    setLoading(true);
    setError("");
    
    console.log('Attempting to sign up with:', { email });
    
    // First try to sign in with the credentials (in case user already exists)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (!signInError && signInData?.user) {
      console.log('User already exists, signed in successfully');
      router.push("/dashboard");
      return;
    }
    
    console.log('Sign in failed, attempting to sign up');
    
    // If sign in fails, try to sign up with email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      console.error('Signup error:', error);
      
      // If we get the database error, try a different approach
      if (error.message.includes('Database error')) {
        alert('We encountered an issue with signup. Please try again later or contact support.');
        return;
      }
      
      throw error;
    }
    
    console.log('Signup result:', data);
    
    // Show success message
    if (data?.user) {
      alert("Account created successfully! Please check your email for confirmation instructions.");
      setEmail("");
      setPassword("");
      setName("");
    } else {
      router.push("/dashboard");
    }
  } catch (error: any) {
    console.error('Error during signup:', error);
    setError(error.message || "An error occurred during sign up");
  } finally {
    setLoading(false);
  }
}
```

## Database Configuration

### Database Triggers

There is a trigger on the `auth.users` table that runs whenever a new user is created:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_usage (user_id, photos_used, photos_limit, plan_type)
  VALUES (NEW.id, 0, 3, 'Trial');
  RETURN NEW;
END;
$function$
```

This trigger is attached to the `auth.users` table:

```sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Foreign Key Constraints

The `user_usage` table has a foreign key constraint that references `auth.users`:

```sql
ALTER TABLE public.user_usage
ADD CONSTRAINT user_usage_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
DEFERRABLE INITIALLY DEFERRED;
```

This constraint is set to `DEFERRABLE INITIALLY DEFERRED` to prevent circular reference issues during user creation.

## Common Issues and Solutions

### 1. "Database error saving new user"

**Symptoms:**
- 500 Internal Server Error during signup
- Error message: "Database error saving new user"

**Causes:**
- Circular dependency between database trigger and foreign key constraints
- The trigger tries to insert into `user_usage` which has a foreign key back to `auth.users`

**Solutions:**

a) **Modify Foreign Key Constraint (Implemented):**
```sql
-- Drop the existing constraint
ALTER TABLE public.user_usage DROP CONSTRAINT user_usage_user_id_fkey;

-- Add it back with DEFERRABLE INITIALLY DEFERRED
ALTER TABLE public.user_usage 
ADD CONSTRAINT user_usage_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) 
DEFERRABLE INITIALLY DEFERRED;
```

b) **Disable the Trigger (Alternative):**
```sql
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
```

c) **Modify the Trigger Function (Alternative):**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.user_usage (user_id, photos_used, photos_limit, plan_type)
    VALUES (NEW.id, 0, 3, 'Trial');
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error creating user_usage record: %', SQLERRM;
  END;
  RETURN NEW;
END;
$function$;
```

### 2. "Invalid Refresh Token" Error

**Symptoms:**
- Error in console: "Invalid Refresh Token: Refresh Token Not Found"
- Authentication fails after login

**Causes:**
- Mismatch between hardcoded Supabase URL and environment variables
- Stale authentication tokens in browser storage

**Solutions:**
1. Ensure consistent Supabase URLs across the application
2. Use environment variables instead of hardcoded values
3. Clear browser local storage to remove stale tokens

### 3. Environment Variable Issues

**Symptoms:**
- Authentication works in development but fails in production
- Inconsistent behavior across environments

**Solutions:**
1. Ensure all required environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
2. Verify environment variables are correctly loaded
3. Check for typos or incorrect values

## Best Practices

1. **Always use environment variables** for Supabase URLs and keys
2. **Implement robust error handling** in authentication functions
3. **Log authentication attempts** for debugging purposes
4. **Test authentication in incognito/private browsing** to avoid local storage issues
5. **Regularly check Supabase database triggers and constraints** for potential conflicts

## Troubleshooting Steps

If authentication issues occur:

1. **Check browser console** for specific error messages
2. **Clear browser local storage** to remove stale tokens
3. **Verify environment variables** are correctly set
4. **Check Supabase database triggers and constraints** for conflicts
5. **Test with a new email address** to rule out user-specific issues
6. **Check Supabase dashboard** for service status or quota issues

## Contact Support

If issues persist after trying the solutions above, contact Supabase support with:
- Specific error messages
- Steps to reproduce the issue
- Environment details (development/production)
- Any recent changes to the application or database
