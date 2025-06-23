import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string | null;
          email: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company?: string | null;
          email: string;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          company?: string | null;
          email?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          subtotal: number;
          tax: number;
          tax_rate: number;
          discount: number;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          total: number;
          status: 'unpaid' | 'paid' | 'failed' | 'cancelled';
          payment_method: 'stripe' | 'paypal' | 'bank-transfer' | 'zelle' | 'wire';
          notes: string | null;
          public_token: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
        };
        Insert: {
          id: string;
          user_id: string;
          client_id: string;
          subtotal?: number;
          tax?: number;
          tax_rate?: number;
          discount?: number;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          total?: number;
          status?: 'unpaid' | 'paid' | 'failed' | 'cancelled';
          payment_method: 'stripe' | 'paypal' | 'bank-transfer' | 'zelle' | 'wire';
          notes?: string | null;
          public_token?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          subtotal?: number;
          tax?: number;
          tax_rate?: number;
          discount?: number;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          total?: number;
          status?: 'unpaid' | 'paid' | 'failed' | 'cancelled';
          payment_method?: 'stripe' | 'paypal' | 'bank-transfer' | 'zelle' | 'wire';
          notes?: string | null;
          public_token?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          gateway: string;
          gateway_transaction_id: string | null;
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          payment_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          gateway: string;
          gateway_transaction_id?: string | null;
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          payment_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          gateway?: string;
          gateway_transaction_id?: string | null;
          amount?: number;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          payment_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      generate_invoice_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_admin: {
        Args: { user_email: string };
        Returns: boolean;
      };
    };
  };
}