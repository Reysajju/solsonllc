import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Invoice, Client } from '../types';
import { loadInvoices, loadClients } from '../utils/storage';
import { formatCurrency } from '../utils/format';

interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  paidInvoices: number;
  totalInvoices: number;
  overdueInvoices: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  recentInvoices: Invoice[];
}

export const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    paidInvoices: 0,
    totalInvoices: 0,
    overdueInvoices: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    recentInvoices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const loadedInvoices = loadInvoices();
        const loadedClients = loadClients();
        
        setInvoices(loadedInvoices);
        setClients(loadedClients);
        
        // Calculate stats
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const totalRevenue = loadedInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total, 0);
        
        const pendingAmount = loadedInvoices
          .filter(inv => inv.status === 'unpaid')
          .reduce((sum, inv) => sum + inv.total, 0);
        
        const paidInvoices = loadedInvoices.filter(inv => inv.status === 'paid').length;
        
        const overdueInvoices = loadedInvoices.filter(inv => 
          inv.status === 'unpaid' && 
          inv.dueDate && 
          new Date(inv.dueDate) < now
        ).length;
        
        const thisMonthRevenue = loadedInvoices
          .filter(inv => 
            inv.status === 'paid' && 
            inv.paidAt && 
            new Date(inv.paidAt) >= thisMonth
          )
          .reduce((sum, inv) => sum + inv.total, 0);
        
        const lastMonthRevenue = loadedInvoices
          .filter(inv => 
            inv.status === 'paid' && 
            inv.paidAt && 
            new Date(inv.paidAt) >= lastMonth && 
            new Date(inv.paidAt) <= lastMonthEnd
          )
          .reduce((sum, inv) => sum + inv.total, 0);
        
        const recentInvoices = loadedInvoices
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setStats({
          totalRevenue,
          pendingAmount,
          paidInvoices,
          totalInvoices: loadedInvoices.length,
          overdueInvoices,
          thisMonthRevenue,
          lastMonthRevenue,
          recentInvoices
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRevenueGrowth = () => {
    if (stats.lastMonthRevenue === 0) return 0;
    return ((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100;
  };

  const getStatusBadge = (status: string, dueDate?: Date) => {
    const isOverdue = dueDate && new Date() > dueDate;
    
    if (status === 'paid') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Paid</span>;
    }
    
    if (status === 'failed') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
    }
    
    if (isOverdue) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
    }
    
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>;
  };

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const revenueGrowth = getRevenueGrowth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/invoices/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Amount</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.pendingAmount)}</p>
              <p className="text-sm text-slate-500 mt-2">
                {invoices.filter(inv => inv.status === 'unpaid').length} unpaid invoices
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Invoices</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalInvoices}</p>
              <p className="text-sm text-slate-500 mt-2">
                {stats.paidInvoices} paid, {stats.totalInvoices - stats.paidInvoices} pending
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{clients.length}</p>
              {stats.overdueInvoices > 0 && (
                <div className="flex items-center mt-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600 font-medium">{stats.overdueInvoices} overdue</span>
                </div>
              )}
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-500">Last 6 months</span>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Revenue chart coming soon</p>
              <p className="text-sm text-slate-400 mt-1">Track your monthly revenue growth</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                <span className="text-sm font-medium text-emerald-900">Paid This Month</span>
              </div>
              <span className="text-sm font-bold text-emerald-700">{formatCurrency(stats.thisMonthRevenue)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-600 mr-3" />
                <span className="text-sm font-medium text-amber-900">Pending Payment</span>
              </div>
              <span className="text-sm font-bold text-amber-700">{formatCurrency(stats.pendingAmount)}</span>
            </div>
            
            {stats.overdueInvoices > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm font-medium text-red-900">Overdue Invoices</span>
                </div>
                <span className="text-sm font-bold text-red-700">{stats.overdueInvoices}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-900">Active Clients</span>
              </div>
              <span className="text-sm font-bold text-blue-700">{clients.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
            <Link
              to="/invoices"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Invoice
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
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {stats.recentInvoices.length > 0 ? (
                stats.recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-600">
                        <Link to={`/invoices/${invoice.id}`} className="hover:underline">
                          {invoice.id}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{invoice.client.name}</div>
                      {invoice.client.company && (
                        <div className="text-sm text-slate-500">{invoice.client.company}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status, invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {invoice.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-slate-900 mb-1">No invoices yet</h3>
                      <p className="text-sm text-slate-500">Get started by creating your first invoice.</p>
                      <Link
                        to="/invoices/new"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};