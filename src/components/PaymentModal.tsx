import React, { useState } from 'react';
import { X, CreditCard, Shield, Lock, AlertTriangle } from 'lucide-react';
import { Invoice } from '../types';

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, onClose, onSubmit }) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: '',
    paypalEmail: '',
    bankAccount: '',
    routingNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    
    setPaymentData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (invoice.paymentMethod === 'stripe') {
      if (!paymentData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
      if (!paymentData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (paymentData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }
      if (!paymentData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (paymentData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
      if (!paymentData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(paymentData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!paymentData.billingAddress.trim()) {
        newErrors.billingAddress = 'Billing address is required';
      }
    } else if (invoice.paymentMethod === 'paypal') {
      if (!paymentData.paypalEmail.trim()) {
        newErrors.paypalEmail = 'PayPal email is required';
      } else if (!/\S+@\S+\.\S+/.test(paymentData.paypalEmail)) {
        newErrors.paypalEmail = 'Please enter a valid email address';
      }
    } else if (invoice.paymentMethod === 'bank-transfer') {
      if (!paymentData.cardholderName.trim()) {
        newErrors.cardholderName = 'Account holder name is required';
      }
      if (!paymentData.bankAccount.trim()) {
        newErrors.bankAccount = 'Bank account number is required';
      }
      if (!paymentData.routingNumber.trim()) {
        newErrors.routingNumber = 'Routing number is required';
      } else if (paymentData.routingNumber.length !== 9) {
        newErrors.routingNumber = 'Routing number must be 9 digits';
      }
      if (!paymentData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(paymentData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(paymentData);
    }
  };

  const renderStripeForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={paymentData.cardholderName}
          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
            errors.cardholderName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="John Doe"
        />
        {errors.cardholderName && (
          <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Card Number *
        </label>
        <input
          type="text"
          value={paymentData.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
            errors.cardNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="4242 4242 4242 4242"
          maxLength={19}
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">Enter your actual card number for real payment processing</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expiry Date *
          </label>
          <input
            type="text"
            value={paymentData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
              errors.expiryDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="12/25"
            maxLength={5}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            CVV *
          </label>
          <input
            type="text"
            value={paymentData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
              errors.cvv ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="123"
            maxLength={4}
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={paymentData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
            errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Billing Address *
        </label>
        <textarea
          value={paymentData.billingAddress}
          onChange={(e) => handleInputChange('billingAddress', e.target.value)}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
            errors.billingAddress ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          rows={3}
          placeholder="123 Main St, City, State 12345"
        />
        {errors.billingAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>
        )}
      </div>
      
      <div className="flex items-center justify-center pt-4">
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 transition-all shadow-lg hover:shadow-xl"
        >
          <Lock className="mr-2 h-5 w-5" />
          Pay {formatCurrency(invoice.total)}
        </button>
      </div>
    </form>
  );

  const renderPayPalForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <span className="text-2xl font-bold text-blue-600">P</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900">PayPal Payment</h3>
        <p className="text-sm text-slate-600">You'll be redirected to PayPal to complete your payment</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          PayPal Email Address *
        </label>
        <input
          type="email"
          value={paymentData.paypalEmail}
          onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
            errors.paypalEmail ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="your-paypal@email.com"
        />
        {errors.paypalEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.paypalEmail}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">Enter your actual PayPal email for real payment processing</p>
      </div>
      
      <div className="flex items-center justify-center pt-4">
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl"
        >
          Continue to PayPal - {formatCurrency(invoice.total)}
        </button>
      </div>
    </form>
  );

  const renderBankTransferForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <Shield className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Bank Transfer Payment</h3>
        <p className="text-sm text-slate-600">Please use the following bank details to complete your payment. After transferring, click 'Mark as Paid'.</p>
      </div>
      <div className="bg-slate-50 rounded-lg p-4 mb-4">
        <div className="mb-2"><span className="font-semibold">Bank Name:</span> Your Business Bank</div>
        <div className="mb-2"><span className="font-semibold">Account Number:</span> 1234567890</div>
        <div className="mb-2"><span className="font-semibold">Routing Number:</span> 123456789</div>
        <div className="mb-2"><span className="font-semibold">Account Holder:</span> Solson LLC</div>
        <div className="mb-2"><span className="font-semibold">Reference:</span> Invoice #{invoice.id}</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Email Address *
        </label>
        <input
          type="email"
          value={paymentData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500 ${
            errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      <div className="flex items-center justify-center pt-4">
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg hover:shadow-xl"
        >
          <Lock className="mr-2 h-5 w-5" />
          Mark as Paid
        </button>
      </div>
    </form>
  );

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      stripe: 'Credit/Debit Card',
      paypal: 'PayPal',
      'bank-transfer': 'Bank Transfer',
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {invoice.paymentMethod === 'stripe' && 'Credit/Debit Card Payment'}
                {invoice.paymentMethod === 'paypal' && 'PayPal Payment'}
                {invoice.paymentMethod === 'bank-transfer' && 'Bank Transfer Payment'}
              </h2>
              <p className="text-sm text-slate-600">Invoice #{invoice.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* Payment Form */}
          {invoice.paymentMethod === 'stripe' && renderStripeForm()}
          {invoice.paymentMethod === 'paypal' && renderPayPalForm()}
          {invoice.paymentMethod === 'bank-transfer' && renderBankTransferForm()}
        </div>
      </div>
    </div>
  );
};