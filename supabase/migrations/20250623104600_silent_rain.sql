/*
  # Add Admin User

  1. Insert admin user into auth.users
  2. Create corresponding profile
  3. Set up admin permissions

  Note: This is for development/demo purposes. In production, 
  admin users should be created through proper signup flow.
*/

-- Insert admin user into auth.users table
-- Note: In a real production environment, this would be handled by Supabase Auth
-- This is for demo/development purposes only

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Generate a UUID for the admin user
  admin_user_id := gen_random_uuid();
  
  -- Insert into auth.users (this is typically handled by Supabase Auth)
  -- For demo purposes, we'll create a profile directly
  
  -- Insert admin profile
  INSERT INTO profiles (id, email, full_name, company_name, created_at, updated_at)
  VALUES (
    admin_user_id,
    'sajjadr742@gmail.com',
    'Solson LLC Administrator',
    'Solson LLC',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Note: The actual auth.users entry will be created when the user signs up
  -- through the Supabase Auth system. This migration just ensures the profile
  -- structure is ready.
  
END $$;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_email = 'sajjadr742@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin role column to profiles (for future use)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update admin profile role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'sajjadr742@gmail.com';