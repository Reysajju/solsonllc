import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Calendar, Link as LinkIcon } from 'lucide-react';
import { Client, InvoiceItem } from '../types';
import { clientService } from '../services/clientService';
import { invoiceService } from '../services/invoiceService';
import { LoadingSpinner } from './LoadingSpinner';
import { paymentService } from '../services/paymentService';

export const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isNewClient, setIsNewClient] = useState<boolean>(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    address: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const [taxRate, setTaxRate] = useState<number>(8.5);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'bank-transfer' | 'zelle' | 'wire'>('stripe');
  const [notes, setNotes] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [includePaymentLink, setIncludePaymentLink] = useState<boolean>(false);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string>('');
  const [generatingLink, setGeneratingLink] = useState<boolean>(false);
  // Auto-generate Stripe payment link when checkbox is checked and payment method is Stripe
  useEffect(() => {
    const generateLink = async () => {
      if (includePaymentLink && paymentMethod === 'stripe') {
        setGeneratingLink(true);
        try {
          // Stripe expects amount in cents
          const amount = Math.round(calculateTotal() * 100);
          const description = 'Invoice Payment';
          const link = await paymentService.generateStripePaymentLink(amount, 'usd', description);
          setPaymentLinkUrl(link);
        } catch (err) {
          setPaymentLinkUrl('');
        } finally {
          setGeneratingLink(false);
        }
      } else if (!includePaymentLink) {
        setPaymentLinkUrl('');
      }
    };
    generateLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includePaymentLink, paymentMethod, items, taxRate, discountType, discountValue]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await clientService.getUserClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = (subtotal: number) => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTax = (subtotalAfterDiscount: number) => {
    return (subtotalAfterDiscount * taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount(subtotal);
    const subtotalAfterDiscount = subtotal - discount;
    const tax = calculateTax(subtotalAfterDiscount);
    return subtotalAfterDiscount + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let clientToUse: Client;

      if (isNewClient) {
        clientToUse = await clientService.createClient({
          name: newClient.name!,
          company: newClient.company,
          email: newClient.email!,
          address: newClient.address!,
        });
        setClients([clientToUse, ...clients]);
      } else {
        clientToUse = clients.find(c => c.id === selectedClientId)!;
      }

      // Prepare notes with payment link if included
      let finalNotes = notes.trim();
      if (includePaymentLink && paymentLinkUrl.trim()) {
        finalNotes = finalNotes 
          ? `${finalNotes}\n\nPayment Link: ${paymentLinkUrl.trim()}`
          : `Payment Link: ${paymentLinkUrl.trim()}`;
      }

      const invoice = await invoiceService.createInvoice({
        clientId: clientToUse.id,
        items: items.filter(item => item.description.trim() !== ''),
        taxRate,
        discountType,
        discountValue,
        paymentMethod,
        notes: finalNotes || undefined,
        dueDate: new Date(dueDate),
      });

      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading clients..." />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount(subtotal);
  const subtotalAfterDiscount = subtotal - discount;
  const tax = calculateTax(subtotalAfterDiscount);
  const total = calculateTotal();

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Generate New Invoice</h1>
        <p className="text-slate-600 mt-2">Create a professional invoice for your client</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h2>
          
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="clientType"
                checked={!isNewClient}
                onChange={() => setIsNewClient(false)}
              />
              <span className="ml-2">Select existing client</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input
                type="radio"
                className="form-radio"
                name="clientType"
                checked={isNewClient}
                onChange={() => setIsNewClient(true)}
              />
              <span className="ml-2">Create new client</span>
            </label>
          </div>

          {!isNewClient ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Client
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required={!isNewClient}
              >
                <option value="">Choose a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={newClient.name || ''}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required={isNewClient}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newClient.company || ''}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newClient.email || ''}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required={isNewClient}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Billing Address *
                </label>
                <textarea
                  value={newClient.address || ''}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  rows={3}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required={isNewClient}
                />
              </div>
            </div>
          )}
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Invoice Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Item description..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Total
                  </label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900">
                    {formatCurrency(item.total)}
                  </div>
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Calculations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Discount {discountType === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-slate-300 pt-2">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method & Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="stripe">Credit/Debit Card (Stripe)</option>
                <option value="paypal">PayPal</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="zelle">Zelle</option>
                <option value="wire">Wire Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Any additional notes or terms..."
              />
            </div>
          </div>

          {/* Payment Link Option */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="includePaymentLink"
                checked={includePaymentLink}
                onChange={(e) => setIncludePaymentLink(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
              />
              <label htmlFor="includePaymentLink" className="ml-2 text-sm font-medium text-slate-700">
                <LinkIcon className="inline h-4 w-4 mr-1" />
                Include Payment Link in Invoice
              </label>
            </div>
            {includePaymentLink && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Link URL
                </label>
                <input
                  type="url"
                  value={paymentLinkUrl}
                  readOnly
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-slate-100"
                  placeholder="Stripe payment link will appear here..."
                />
                {generatingLink && (
                  <p className="text-xs text-blue-500 mt-1">Generating Stripe payment link...</p>
                )}
                {!generatingLink && paymentLinkUrl && (
                  <p className="text-xs text-green-600 mt-1">Stripe payment link is ready and will be included in the invoice.</p>
                )}
                {!generatingLink && !paymentLinkUrl && (
                  <p className="text-xs text-red-600 mt-1">Unable to generate Stripe payment link.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Invoice...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Generate Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};