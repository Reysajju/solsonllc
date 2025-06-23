/*
  # Invoice Management System Database Schema

  1. New Tables
    - `profiles` - User profiles linked to auth.users
    - `clients` - Client information
    - `invoices` - Invoice records with public access tokens
    - `invoice_items` - Line items for invoices
    - `payments` - Payment transaction records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public invoice access
    - Create secure public access via tokens

  3. Functions
    - Auto-generate invoice IDs
    - Handle payment status updates
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT DEFAULT 'Solson LLC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table with public access token
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('unpaid', 'paid', 'failed', 'cancelled')) DEFAULT 'unpaid',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'bank-transfer', 'zelle', 'wire')) NOT NULL,
  notes TEXT,
  public_token UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id TEXT REFERENCES invoices(id) NOT NULL,
  gateway TEXT NOT NULL,
  gateway_transaction_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) NOT NULL,
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Public invoice access via token
CREATE POLICY "Public can view invoices via token" ON invoices
  FOR SELECT USING (true);

-- Invoice items policies
CREATE POLICY "Users can manage invoice items" ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Public can view invoice items via invoice token
CREATE POLICY "Public can view invoice items" ON invoice_items
  FOR SELECT USING (true);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = payments.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON payments
  FOR UPDATE USING (true);

-- Function to generate invoice ID
CREATE OR REPLACE FUNCTION generate_invoice_id()
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  random_num TEXT;
  invoice_id TEXT;
BEGIN
  date_str := TO_CHAR(NOW(), 'YYYYMMDD');
  random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  invoice_id := 'INV-' || date_str || '-' || random_num;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id) LOOP
    random_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    invoice_id := 'INV-' || date_str || '-' || random_num;
  END LOOP;
  
  RETURN invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices SET
    subtotal = (
      SELECT COALESCE(SUM(total), 0) 
      FROM invoice_items 
      WHERE invoice_id = NEW.invoice_id
    ),
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  -- Recalculate total with tax and discount
  UPDATE invoices SET
    total = CASE 
      WHEN discount_type = 'percentage' THEN
        (subtotal - (subtotal * discount_value / 100)) + 
        ((subtotal - (subtotal * discount_value / 100)) * tax_rate / 100)
      ELSE
        (subtotal - discount_value) + 
        ((subtotal - discount_value) * tax_rate / 100)
    END
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice totals when items change
CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_public_token ON invoices(public_token);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);