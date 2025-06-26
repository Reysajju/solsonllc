/*
  # Remove Public Token System

  1. Changes
    - Remove public_token column from invoices table
    - Remove public access policies
    - Update RLS policies to be admin-only

  2. Security
    - Remove public invoice access
    - Maintain admin-only access to all data
*/

-- Remove public access policies
DROP POLICY IF EXISTS "Public can view invoices via token" ON invoices;
DROP POLICY IF EXISTS "Public can view invoice items" ON invoice_items;

-- Remove public_token column
ALTER TABLE invoices DROP COLUMN IF EXISTS public_token;

-- Update invoice policies to be admin-only
DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;
CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Update invoice items policies to be admin-only  
DROP POLICY IF EXISTS "Users can manage invoice items" ON invoice_items;
CREATE POLICY "Users can manage invoice items" ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Add company profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;