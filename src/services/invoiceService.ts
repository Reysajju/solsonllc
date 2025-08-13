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
    // Load clients from localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const clientObj = clients.find((c: any) => c.id === invoiceData.clientId);
    const invoice: Invoice = {
      id: invoiceId,
      clientId: invoiceData.clientId,
      client: clientObj,
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
      createdAt: new Date().toISOString() as any,
      dueDate: invoiceData.dueDate ? (invoiceData.dueDate.toISOString() as any) : undefined,
      paidAt: undefined,
    };
    invoices.unshift(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    // Return with Date objects for runtime
    return {
      ...invoice,
      client: clientObj ? { ...clientObj, createdAt: new Date(clientObj.createdAt) } : undefined,
      createdAt: new Date(invoice.createdAt),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
      paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
    };
  },

  // Get invoice by ID
  getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const invoice = invoices.find((inv: Invoice) => inv.id === id);
    if (!invoice) return undefined;
    return {
      ...invoice,
      createdAt: new Date(invoice.createdAt),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
      paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
    };
  },

  // Get all invoices
  getUserInvoices: async (): Promise<Invoice[]> => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    // Load clients from localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    return invoices.map((invoice: Invoice) => {
      const clientObj = clients.find((c: any) => c.id === invoice.clientId);
      return {
        ...invoice,
        client: clientObj ? { ...clientObj, createdAt: new Date(clientObj.createdAt) } : undefined,
        createdAt: new Date(invoice.createdAt),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
        paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
      };
    });
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