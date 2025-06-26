import { Client, Invoice } from '../types';

const CLIENTS_KEY = 'solson_clients';
const INVOICES_KEY = 'solson_invoices';

export const saveClients = (clients: Client[]): void => {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export const loadClients = (): Client[] => {
  const stored = localStorage.getItem(CLIENTS_KEY);
  if (stored) {
    return JSON.parse(stored).map((client: any) => ({
      ...client,
      createdAt: new Date(client.createdAt),
    }));
  }
  return [];
};

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

export const loadInvoices = (): Invoice[] => {
  const stored = localStorage.getItem(INVOICES_KEY);
  if (stored) {
    return JSON.parse(stored).map((invoice: any) => ({
      ...invoice,
      createdAt: new Date(invoice.createdAt),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
      paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined,
      public_token: invoice.public_token || invoice.id, // Fallback for legacy data
    }));
  }
  return [];
};

export const generateInvoiceId = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `INV-${dateStr}-${random}`;
};

export const generateClientId = (): string => {
  return `CLIENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const getInvoicePaymentLink = (publicToken: string): string => {
  return `${window.location.origin}/invoice/${publicToken}`;
};