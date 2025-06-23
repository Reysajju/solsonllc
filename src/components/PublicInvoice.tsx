import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard, Download, CheckCircle2, AlertCircle, X, Building2, MapPin, Mail, Phone, Clock, Calendar } from 'lucide-react';
import { Invoice } from '../types';
import { loadInvoices, saveInvoices } from '../utils/storage';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { PaymentModal } from './PaymentModal';

export const PublicInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      stripe: 'Credit/Debit Card',
      paypal: 'PayPal',
      'bank-transfer': 'Bank Transfer',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const handlePaymentClick = () => {
    if (!invoice || invoice.status === 'paid') return;
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (paymentData: any) => {
    if (!invoice) return;
    
    setIsProcessing(true);
    setShowPaymentModal(false);

    // Simulate payment processing with realistic delay
    setTimeout(() => {
      // Simulate random success/failure (90% success rate for better UX)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        // Update invoice status to paid
        const invoices = loadInvoices();
        const updatedInvoices = invoices.map(inv => 
          inv.id === invoice.id ? { ...inv, status: 'paid' as const, paidAt: new Date() } : inv
        );
        saveInvoices(updatedInvoices);
        setInvoice({ ...invoice, status: 'paid', paidAt: new Date() });
        setPaymentResult('success');
      } else {
        // Update invoice status to failed
        const invoices = loadInvoices();
        const updatedInvoices = invoices.map(inv => 
          inv.id === invoice.id ? { ...inv, status: 'failed' as const } : inv
        );
        saveInvoices(updatedInvoices);
        setInvoice({ ...invoice, status: 'failed' });
        setPaymentResult('failed');
      }
      
      setIsProcessing(false);
      setShowNotification(true);
      
      // Auto-hide failure notifications after 7 seconds
      if (!isSuccess) {
        setTimeout(() => {
          setShowNotification(false);
          setPaymentResult(null);
        }, 7000);
      }
    }, 3000); // 3 second processing simulation
  };

  const closeNotification = () => {
    setShowNotification(false);
    setPaymentResult(null);
  };

  const downloadPDF = () => {
    if (invoice) {
      generateInvoicePDF(invoice);
    }
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date() > dueDate;
  };

  const getDaysUntilDue = (dueDate?: Date) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Invoice Not Found</h1>
          <p className="text-slate-600">The invoice you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue(invoice.dueDate);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Payment Notifications */}
        {showNotification && paymentResult && (
          <div className={`fixed top-4 right-4 z-50 max-w-md w-full animate-slide-up ${
            paymentResult === 'success' ? 'animate-pulse-success' : ''
          }`}>
            <div className={`rounded-xl shadow-lg p-6 ${
              paymentResult === 'success' 
                ? 'bg-emerald-50 border border-emerald-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {paymentResult === 'success' ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-lg font-semibold ${
                    paymentResult === 'success' ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {paymentResult === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    paymentResult === 'success' ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {paymentResult === 'success' 
                      ? `Your payment of ${formatCurrency(invoice.total)} has been processed successfully. Invoice is now marked as paid.`
                      : 'There was an issue processing your payment. Please try again or contact support if the issue persists.'
                    }
                  </p>
                  {paymentResult === 'success' && (
                    <button
                      onClick={downloadPDF}
                      className="mt-3 inline-flex items-center px-3 py-1 border border-emerald-300 text-xs font-medium rounded-md text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download Receipt
                    </button>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={closeNotification}
                    className={`rounded-md inline-flex ${
                      paymentResult === 'success' 
                        ? 'text-emerald-400 hover:text-emerald-600 focus:ring-emerald-600'
                        : 'text-red-400 hover:text-red-600 focus:ring-red-600'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 animate-fade-in shadow-2xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-royal-200 border-t-royal-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Processing Payment</h3>
                <p className="text-slate-600 mb-4">
                  Please wait while we securely process your {getPaymentMethodLabel(invoice.paymentMethod)} payment...
                </p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(invoice.total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-slate-600">Invoice:</span>
                    <span className="font-medium text-slate-900">#{invoice.id}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  ⚠️ This is a demo payment system. No real charges will be made.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <PaymentModal
            invoice={invoice}
            onClose={() => setShowPaymentModal(false)}
            onSubmit={handlePaymentSubmit}
          />
        )}

        {/* Invoice */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden animate-fade-in">
          <div className="p-8 lg:p-12">
            {/* Status Banner */}
            {invoice.status === 'paid' && (
              <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-800">Payment Received</h3>
                    <p className="text-emerald-700">
                      This invoice was paid on {invoice.paidAt?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {invoice.status === 'failed' && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Payment Failed</h3>
                    <p className="text-red-700">
                      The last payment attempt failed. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {invoice.status === 'unpaid' && invoice.dueDate && isOverdue(invoice.dueDate) && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Payment Overdue</h3>
                    <p className="text-red-700">
                      This invoice was due on {invoice.dueDate.toLocaleDateString()} ({Math.abs(daysUntilDue!)} days ago)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {invoice.status === 'unpaid' && invoice.dueDate && !isOverdue(invoice.dueDate) && daysUntilDue !== null && daysUntilDue <= 7 && (
              <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-amber-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800">Payment Due Soon</h3>
                    <p className="text-amber-700">
                      This invoice is due on {invoice.dueDate.toLocaleDateString()} 
                      {daysUntilDue === 0 ? ' (today)' : ` (in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'})`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Header with From/To */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* From Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">From</h3>
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-royal-600 to-royal-700 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Solson LLC</h2>
                      <p className="text-slate-600 text-sm">Professional Services</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>1234 Business Ave, Suite 100</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>New York, NY 10001</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>billing@solsonllc.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>(555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* To Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">To</h3>
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="text-slate-900">
                    <p className="font-semibold text-lg mb-2">{invoice.client.name}</p>
                    {invoice.client.company && (
                      <p className="text-slate-600 mb-2">{invoice.client.company}</p>
                    )}
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
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
                <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                <p className="text-slate-600 text-xl">#{invoice.id}</p>
              </div>
              <div className="mt-4 lg:mt-0 lg:text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                  invoice.status === 'paid' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : invoice.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : isOverdue(invoice.dueDate)
                    ? 'bg-red-100 text-red-800'
                    : daysUntilDue !== null && daysUntilDue <= 7
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {invoice.status === 'paid' ? 'PAID' : 
                   invoice.status === 'failed' ? 'PAYMENT FAILED' :
                   isOverdue(invoice.dueDate) ? 'OVERDUE' : 
                   daysUntilDue !== null && daysUntilDue <= 7 ? 'DUE SOON' : 'PENDING PAYMENT'}
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p><span className="font-medium">Issued:</span> {invoice.createdAt.toLocaleDateString()}</p>
                  {invoice.dueDate && (
                    <p>
                      <span className="font-medium">Due:</span> {invoice.dueDate.toLocaleDateString()}
                      {daysUntilDue !== null && invoice.status === 'unpaid' && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          isOverdue(invoice.dueDate) 
                            ? 'bg-red-100 text-red-700' 
                            : daysUntilDue <= 7 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isOverdue(invoice.dueDate) 
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : daysUntilDue === 0 
                            ? 'Due today'
                            : `${daysUntilDue} days left`
                          }
                        </span>
                      )}
                    </p>
                  )}
                  {invoice.status === 'paid' && invoice.paidAt && (
                    <p><span className="font-medium">Paid:</span> {invoice.paidAt.toLocaleDateString()}</p>
                  )}
                  <p><span className="font-medium">Payment Method:</span> {getPaymentMethodLabel(invoice.paymentMethod)}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-4 font-semibold text-slate-700">Description</th>
                      <th className="text-right py-4 font-semibold text-slate-700">Qty</th>
                      <th className="text-right py-4 font-semibold text-slate-700">Unit Price</th>
                      <th className="text-right py-4 font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-slate-900">{item.description}</td>
                        <td className="py-4 text-right text-slate-700">{item.quantity}</td>
                        <td className="py-4 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-4 text-right text-slate-900 font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-sm">
                <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-900 font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Fixed'}):</span>
                      <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax ({invoice.taxRate}%):</span>
                    <span className="text-slate-900 font-medium">{formatCurrency(invoice.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-3 text-xl font-bold">
                    <span className="text-slate-900">Total Amount:</span>
                    <span className="text-slate-900">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="border-t border-slate-200 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {invoice.status === 'unpaid' || invoice.status === 'failed' ? (
                  <>
                    <button
                      onClick={handlePaymentClick}
                      disabled={isProcessing}
                      className={`inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        isOverdue(invoice.dueDate)
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500'
                          : daysUntilDue !== null && daysUntilDue <= 7
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:ring-amber-500'
                          : 'bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 focus:ring-royal-500'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                      <CreditCard className="mr-3 h-6 w-6" />
                      {isOverdue(invoice.dueDate) ? 'Pay Overdue Amount' : 'Pay'} {formatCurrency(invoice.total)} via {getPaymentMethodLabel(invoice.paymentMethod)}
                    </button>
                    <p className="text-xs text-slate-500 text-center max-w-md">
                      ⚠️ This is a demo payment system for testing purposes only. No real charges will be made to your account.
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center px-8 py-4 border border-emerald-300 text-lg font-semibold rounded-xl text-emerald-800 bg-emerald-50 mb-4">
                      <CheckCircle2 className="mr-3 h-6 w-6" />
                      Payment Complete - {formatCurrency(invoice.total)}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={downloadPDF}
                  className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download {invoice.status === 'paid' ? 'Receipt' : 'Invoice'} PDF
                </button>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                  Additional Notes
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{invoice.notes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
              <p className="font-medium">Thank you for your business!</p>
              <p className="mt-2">If you have any questions about this invoice, please contact us at:</p>
              <p className="mt-1">
                <a href="mailto:support@solsonllc.com" className="text-royal-600 hover:text-royal-800 transition-colors">
                  support@solsonllc.com
                </a> | 
                <a href="tel:+15551234567" className="text-royal-600 hover:text-royal-800 transition-colors ml-2">
                  (555) 123-4567
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};