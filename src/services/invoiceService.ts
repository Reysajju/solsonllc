import { supabase } from '../lib/supabase';
import { Invoice, Client, InvoiceItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const invoiceService = {
  // Generate new invoice ID
  async generateInvoiceId(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_invoice_id');
    if (error) throw error;
    return data;
  },

  // Create new invoice
  async createInvoice(invoiceData: {
    clientId: string;
    items: InvoiceItem[];
    taxRate: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    paymentMethod: 'stripe' | 'paypal' | 'bank-transfer' | 'zelle' | 'wire';
    notes?: string;
    dueDate?: Date;
  }): Promise<Invoice> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const invoiceId = await this.generateInvoiceId();
    const publicToken = uuidv4();
    
    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const discount = invoiceData.discountType === 'percentage' 
      ? (subtotal * invoiceData.discountValue) / 100 
      : invoiceData.discountValue;
    const subtotalAfterDiscount = subtotal - discount;
    const tax = (subtotalAfterDiscount * invoiceData.taxRate) / 100;
    const total = subtotalAfterDiscount + tax;

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        id: invoiceId,
        user_id: user.data.user.id,
        client_id: invoiceData.clientId,
        subtotal,
        tax,
        tax_rate: invoiceData.taxRate,
        discount,
        discount_type: invoiceData.discountType,
        discount_value: invoiceData.discountValue,
        total,
        payment_method: invoiceData.paymentMethod,
        notes: invoiceData.notes,
        due_date: invoiceData.dueDate?.toISOString(),
        public_token: publicToken,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Insert invoice items
    const itemsToInsert = invoiceData.items.map(item => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return this.getInvoiceById(invoiceId);
  },

  // Get invoice by ID with client and items
  async getInvoiceById(id: string): Promise<Invoice> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (*),
        invoice_items (*)
      `)
      .eq('id', id)
      .single();

    if (invoiceError) throw invoiceError;

    return {
      id: invoice.id,
      clientId: invoice.client_id,
      client: {
        id: invoice.clients.id,
        name: invoice.clients.name,
        company: invoice.clients.company,
        email: invoice.clients.email,
        address: invoice.clients.address,
        createdAt: new Date(invoice.clients.created_at),
      },
      items: invoice.invoice_items.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      taxRate: invoice.tax_rate,
      discount: invoice.discount,
      discountType: invoice.discount_type,
      discountValue: invoice.discount_value,
      total: invoice.total,
      status: invoice.status,
      paymentMethod: invoice.payment_method,
      notes: invoice.notes,
      createdAt: new Date(invoice.created_at),
      dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
      paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
    };
  },

  // Get invoice by public token (for public access)
  async getInvoiceByToken(token: string): Promise<Invoice> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (*),
        invoice_items (*)
      `)
      .eq('public_token', token)
      .single();

    if (invoiceError) throw invoiceError;

    return {
      id: invoice.id,
      clientId: invoice.client_id,
      client: {
        id: invoice.clients.id,
        name: invoice.clients.name,
        company: invoice.clients.company,
        email: invoice.clients.email,
        address: invoice.clients.address,
        createdAt: new Date(invoice.clients.created_at),
      },
      items: invoice.invoice_items.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      taxRate: invoice.tax_rate,
      discount: invoice.discount,
      discountType: invoice.discount_type,
      discountValue: invoice.discount_value,
      total: invoice.total,
      status: invoice.status,
      paymentMethod: invoice.payment_method,
      notes: invoice.notes,
      createdAt: new Date(invoice.created_at),
      dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
      paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
    };
  },

  // Get all invoices for current user
  async getUserInvoices(): Promise<Invoice[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (*),
        invoice_items (*)
      `)
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return invoices.map((invoice: any) => ({
      id: invoice.id,
      clientId: invoice.client_id,
      client: {
        id: invoice.clients.id,
        name: invoice.clients.name,
        company: invoice.clients.company,
        email: invoice.clients.email,
        address: invoice.clients.address,
        createdAt: new Date(invoice.clients.created_at),
      },
      items: invoice.invoice_items.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      taxRate: invoice.tax_rate,
      discount: invoice.discount,
      discountType: invoice.discount_type,
      discountValue: invoice.discount_value,
      total: invoice.total,
      status: invoice.status,
      paymentMethod: invoice.payment_method,
      notes: invoice.notes,
      createdAt: new Date(invoice.created_at),
      dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
      paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
    }));
  },

  // Update invoice status
  async updateInvoiceStatus(id: string, status: 'unpaid' | 'paid' | 'failed' | 'cancelled'): Promise<void> {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  // Get public payment link
  getPaymentLink(invoiceId: string, publicToken: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}/invoice/${publicToken}`;
  },
};