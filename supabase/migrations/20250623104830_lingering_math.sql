/*
  # Admin User Setup Migration

  1. Database Structure Updates
    - Add role column to profiles table
    - Create admin check function
    - Set up admin role management

  2. Notes
    - The actual admin user will be created through Supabase Auth signup
    - This migration only prepares the database structure
    - Admin privileges are determined by email address
*/

-- Add admin role column to profiles (for future use)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_email = 'sajjadr742@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to automatically set admin role for the admin email
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the admin email and set role accordingly
  IF NEW.email = 'sajjadr742@gmail.com' THEN
    NEW.role = 'admin';
  ELSE
    NEW.role = COALESCE(NEW.role, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set admin role on profile creation/update
DROP TRIGGER IF EXISTS set_admin_role_trigger ON profiles;
CREATE TRIGGER set_admin_role_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_admin_role();

-- Update existing profile if it exists (in case admin already signed up)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'sajjadr742@gmail.com';

-- Create an index on the role column for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);