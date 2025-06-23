/*
  Database Schema Migration Script: Timestamps Management

  Purpose:
  This script ensures that the 'updated_at' column in the 'profiles', 'clients',
  and 'invoices' tables is automatically updated to the current timestamp
  whenever a row is inserted or modified.

  Components:
  1. Function 'update_updated_at_column': A PL/pgSQL function that sets the
     'updated_at' column of the new or updated row to the current time (NOW()).
  2. Triggers: BEFORE INSERT OR UPDATE triggers on 'profiles', 'clients', and
     'invoices' tables that execute the 'update_updated_at_column' function.

  Benefits:
  - Automates timestamp management, reducing manual errors.
  - Ensures data integrity by accurately reflecting the last modification time.
  - This is a common pattern in Supabase projects for tracking record changes.
*/

-- 1. Create or Replace the Timestamp Update Function
--    This function is generic and can be reused across multiple tables.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the 'updated_at' column of the new row to the current timestamp
  NEW.updated_at = NOW();
  -- Return the modified new row
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Apply Trigger to the 'profiles' Table
--    This ensures 'profiles.updated_at' is managed automatically.
--    DROP TRIGGER IF EXISTS is used to prevent errors if the trigger already exists,
--    allowing for idempotent script execution.
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Apply Trigger to the 'clients' Table
--    This ensures 'clients.updated_at' is managed automatically.
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Apply Trigger to the 'invoices' Table
--    This ensures 'invoices.updated_at' is managed automatically.
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();