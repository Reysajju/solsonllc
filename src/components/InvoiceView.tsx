import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle, Building2, MapPin, Mail, Phone, Copy, Check } from 'lucide-react';
import { Invoice } from '../types';
import { loadInvoices, saveInvoices, getInvoicePaymentLink } from '../utils/storage';

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      const invoices = loadInvoices();
      const foundInvoice = invoices.find(inv => inv.id === id);
      if (foundInvoice) {
        // Convert date strings back to Date objects
        const processedInvoice = {
          ...foundInvoice,
          createdAt: new Date(foundInvoice.createdAt),
          dueDate: foundInvoice.dueDate ? new Date(foundInvoice.dueDate) : undefined,
          paidAt: foundInvoice.paidAt ? new Date(foundInvoice.paidAt) : undefined,
        };
        setInvoice(processedInvoice);
      }
    }
  }, [id]);

  const markAsPaid = () => {
    if (invoice) {
      const invoices = loadInvoices();
      const updatedInvoices = invoices.map(inv => 
        inv.id === invoice.id ? { ...inv, status: 'paid' as const, paidAt: new Date() } : inv
      );
      saveInvoices(updatedInvoices);
      setInvoice({ ...invoice, status: 'paid', paidAt: new Date() });
    }
  };

  const copyPaymentLink = async () => {
    if (invoice) {
      const paymentLink = getInvoicePaymentLink(invoice.id);
      try {
        await navigator.clipboard.writeText(paymentLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = paymentLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Paid' },
      unpaid: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Unpaid' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Invoice Not Found</h1>
          <p className="text-slate-600 mb-6">The invoice you're looking for doesn't exist.</p>
          <Link
            to="/invoices"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-royal-600 hover:bg-royal-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const paymentLink = getInvoicePaymentLink(invoice.id);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Link
          to="/invoices"
          className="inline-flex items-center text-royal-600 hover:text-royal-800 transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{invoice.id}</h1>
            <p className="text-slate-600 mt-1">Created on {invoice.createdAt.toLocaleDateString()}</p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(invoice.status)}
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public Invoice
            </a>
            {invoice.status === 'unpaid' && (
              <button
                onClick={markAsPaid}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Link Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Link</h3>
        <p className="text-slate-600 mb-4">Share this link with your client to allow them to pay the invoice online:</p>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-slate-50 rounded-lg p-3 border">
            <code className="text-sm text-slate-700 break-all">{paymentLink}</code>
          </div>
          <button
            onClick={copyPaymentLink}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
              copied 
                ? 'text-emerald-700 bg-emerald-100 border-emerald-300' 
                : 'text-royal-700 bg-royal-100 hover:bg-royal-200 border-royal-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          {/* Header with From/To */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* From Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">From</h3>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-royal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Solson LLC</h2>
                    <p className="text-slate-600 text-sm">Professional Services</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>1234 Business Ave, Suite 100</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>New York, NY 10001</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>billing@solsonllc.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(555) 123-4567</span>
                  </div>
                </div>
              </div>
            </div>

            {/* To Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">To</h3>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="text-slate-900">
                  <p className="font-semibold text-lg mb-2">{invoice.client.name}</p>
                  {invoice.client.company && (
                    <p className="text-slate-600 mb-2">{invoice.client.company}</p>
                  )}
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{invoice.client.email}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="whitespace-pre-line">{invoice.client.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">INVOICE</h1>
              <p className="text-slate-600 text-lg">#{invoice.id}</p>
            </div>
            <div className="mt-4 lg:mt-0 lg:text-right">
              <div className="text-sm text-slate-600 space-y-1">
                <p><span className="font-medium">Issued:</span> {invoice.createdAt.toLocaleDateString()}</p>
                {invoice.dueDate && (
                  <p><span className="font-medium">Due:</span> {invoice.dueDate.toLocaleDateString()}</p>
                )}
                {invoice.status === 'paid' && invoice.paidAt && (
                  <p><span className="font-medium">Paid:</span> {invoice.paidAt.toLocaleDateString()}</p>
                )}
                <p><span className="font-medium">Payment Method:</span> {invoice.paymentMethod.charAt(0).toUpperCase() + invoice.paymentMethod.slice(1).replace('-', ' ')}</p>
                <p><span className="font-medium">Status:</span> <span className="capitalize">{invoice.status}</span></p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="text-right py-3 text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-slate-900">{item.description}</td>
                    <td className="py-4 text-right text-slate-900">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-900">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 text-right text-slate-900 font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax ({invoice.taxRate}%):</span>
                  <span className="text-slate-900">{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-2 text-lg font-semibold">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-slate-900">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                Notes
              </h4>
              <p className="text-slate-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};