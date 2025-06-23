export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  address: string;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  total: number;
  status: 'unpaid' | 'paid' | 'failed';
  paymentMethod: 'stripe' | 'paypal' | 'bank-transfer';
  notes?: string;
  createdAt: Date;
  dueDate?: Date;
  paidAt?: Date;
  public_token?: string;
}

export interface DashboardStats {
  totalInvoices: number;
  pendingPayments: number;
  paidInvoices: number;
  totalRevenue: number;
}