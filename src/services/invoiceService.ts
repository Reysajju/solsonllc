import { Invoice, Client, InvoiceItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const invoiceService = {
  // Generate new invoice ID
  generateInvoiceId: async (): Promise<string> => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `INV-${dateStr}-${random}`;
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
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      
      const invoiceId = await invoiceService.generateInvoiceId();
      const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
      const discount = invoiceData.discountType === 'percentage'
        ? (subtotal * invoiceData.discountValue) / 100
        : invoiceData.discountValue;
      const subtotalAfterDiscount = subtotal - discount;
      const tax = (subtotalAfterDiscount * invoiceData.taxRate) / 100;
      const total = subtotalAfterDiscount + tax;
      
      const clientObj = clients.find((c: any) => c.id === invoiceData.clientId);
      if (!clientObj) {
        throw new Error('Client not found');
      }

      const invoice: Invoice = {
        id: invoiceId,
        clientId: invoiceData.clientId,
        client: {
          ...clientObj,
          createdAt: new Date(clientObj.createdAt)
        },
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
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      
      const invoice = invoices.find((inv: any) => inv.id === id);
      if (!invoice) return undefined;

      const clientObj = clients.find((c: any) => c.id === invoice.clientId);
      
      return {
        ...invoice,
        client: clientObj ? { ...clientObj, createdAt: new Date(clientObj.createdAt) } : undefined,
        createdAt: new Date(invoice.createdAt),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
        paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
      };
    } catch (error) {
      console.error('Error getting invoice by ID:', error);
      throw error;
    }
  },

  // Get invoice by token (for public access)
  getInvoiceByToken: async (token: string): Promise<Invoice | undefined> => {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      
      // For demo purposes, use the invoice ID as the token
      const invoice = invoices.find((inv: any) => inv.id === token || inv.public_token === token);
      if (!invoice) return undefined;

      const clientObj = clients.find((c: any) => c.id === invoice.clientId);
      
      return {
        ...invoice,
        client: clientObj ? { ...clientObj, createdAt: new Date(clientObj.createdAt) } : undefined,
        createdAt: new Date(invoice.createdAt),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
        paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
        public_token: invoice.id, // Use ID as public token for demo
      };
    } catch (error) {
      console.error('Error getting invoice by token:', error);
      throw error;
    }
  },

  // Get all invoices
  getUserInvoices: async (): Promise<Invoice[]> => {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      
      return invoices.map((invoice: any) => {
        const clientObj = clients.find((c: any) => c.id === invoice.clientId);
        return {
          ...invoice,
          client: clientObj ? { ...clientObj, createdAt: new Date(clientObj.createdAt) } : {
            id: 'unknown',
            name: 'Unknown Client',
            email: 'unknown@example.com',
            address: 'Unknown Address',
            createdAt: new Date()
          },
          createdAt: new Date(invoice.createdAt),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
          paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
        };
      });
    } catch (error) {
      console.error('Error getting user invoices:', error);
      return [];
    }
  },

  // Update invoice status
  updateInvoiceStatus: async (id: string, status: 'unpaid' | 'paid' | 'failed' | 'cancelled'): Promise<void> => {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const idx = invoices.findIndex((inv: any) => inv.id === id);
      
      if (idx === -1) throw new Error('Invoice not found');
      
      invoices[idx].status = status;
      invoices[idx].updatedAt = new Date().toISOString();
      
      if (status === 'paid') {
        invoices[idx].paidAt = new Date().toISOString();
      } else if (status === 'unpaid') {
        invoices[idx].paidAt = undefined;
      }
      
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (id: string): Promise<void> => {
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const filtered = invoices.filter((inv: any) => inv.id !== id);
      localStorage.setItem('invoices', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },
};