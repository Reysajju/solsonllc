import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Invoice, DashboardStats } from '../types';
import { loadInvoices } from '../utils/storage';

export const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const loadedInvoices = loadInvoices();
    setInvoices(loadedInvoices);

    const paidInvoices = loadedInvoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = loadedInvoices.filter(inv => inv.status === 'unpaid');

    setStats({
      totalInvoices: loadedInvoices.length,
      pendingPayments: pendingInvoices.length,
      paidInvoices: paidInvoices.length,
      totalRevenue: paidInvoices.reduce((sum, inv) => sum + inv.total, 0),
    });
  }, []);

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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Overview of your invoice activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-royal-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Invoices</dt>
                <dd className="text-2xl font-bold text-slate-900">{stats.totalInvoices}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Pending Payments</dt>
                <dd className="text-2xl font-bold text-slate-900">{stats.pendingPayments}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Paid Invoices</dt>
                <dd className="text-2xl font-bold text-slate-900">{stats.paidInvoices}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Revenue</dt>
                <dd className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Invoice Button */}
      <div className="mb-8">
        <Link
          to="/invoices/new"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          Generate New Invoice
        </Link>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {invoices.slice(0, 10).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-royal-600">
                    <Link to={`/invoices/${invoice.id}`} className="hover:underline">
                      {invoice.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {invoice.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {invoice.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No invoices yet</h3>
              <p className="mt-1 text-sm text-slate-500">Get started by creating your first invoice.</p>
              <div className="mt-6">
                <Link
                  to="/invoices/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};