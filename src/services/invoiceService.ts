import { Invoice, Client, InvoiceItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const invoiceService = {
  // Generate new invoice ID
  generateInvoiceId: async (): Promise<string> => {
    return uuidv4();
  },

  // Create new invoice
  createInvoice: async (invoiceData: {
    clientId: string;
    items: InvoiceItem[];
    taxRate: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    paymentMethod: 'stripe' | 'paypal' | 'bank-transfer' | 'zelle' | 'wire';
    notes?: string;
    dueDate?: Date;
  }): Promise<Invoice> => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const invoiceId = uuidv4();
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const discount = invoiceData.discountType === 'percentage'
      ? (subtotal * invoiceData.discountValue) / 100
      : invoiceData.discountValue;
    const subtotalAfterDiscount = subtotal - discount;
    const tax = (subtotalAfterDiscount * invoiceData.taxRate) / 100;
    const total = subtotalAfterDiscount + tax;
    const invoice: Invoice = {
      id: invoiceId,
      clientId: invoiceData.clientId,
      client: undefined,
      items: invoiceData.items,
      subtotal,
      tax,
      taxRate: invoiceData.taxRate,
      discount,
      discountType: invoiceData.discountType,
      discountValue: invoiceData.discountValue,
      total,
      status: 'unpaid',
      paymentMethod: invoiceData.paymentMethod,
      notes: invoiceData.notes,
      createdAt: new Date(),
      dueDate: invoiceData.dueDate,
      paidAt: undefined,
    };
    invoices.unshift(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    return invoice;
  },

  // Get invoice by ID
  getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    return invoices.find((inv: Invoice) => inv.id === id);
  },

  // Get all invoices
  getUserInvoices: async (): Promise<Invoice[]> => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    return invoices;
  },

  // Update invoice status
  updateInvoiceStatus: async (id: string, status: 'unpaid' | 'paid' | 'failed' | 'cancelled'): Promise<void> => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const idx = invoices.findIndex((inv: Invoice) => inv.id === id);
    if (idx === -1) throw new Error('Invoice not found');
    invoices[idx].status = status;
    invoices[idx].updatedAt = new Date();
    if (status === 'paid') {
      invoices[idx].paidAt = new Date();
    } else if (status === 'unpaid') {
      invoices[idx].paidAt = undefined;
    }
    localStorage.setItem('invoices', JSON.stringify(invoices));
  },
};