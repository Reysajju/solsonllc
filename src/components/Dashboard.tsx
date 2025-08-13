import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Calendar,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Building2
} from 'lucide-react';
import { Invoice, DashboardStats } from '../types';
import { invoiceService } from '../services/invoiceService';
import { clientService } from '../services/clientService';

export const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    totalRevenue: 0,
  });
  const [revenueGrowth, setRevenueGrowth] = useState<number>(0);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [clientCount, setClientCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [monthlyGrowth, setMonthlyGrowth] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load invoices from database
        const loadedInvoices = await invoiceService.getUserInvoices();
        setInvoices(loadedInvoices);

        // Load client count
        const clients = await clientService.getUserClients();
        setClientCount(clients.length);

        const paidInvoices = loadedInvoices.filter(inv => inv.status === 'paid');
        const pendingInvoices = loadedInvoices.filter(inv => inv.status === 'unpaid');
        const overdue = loadedInvoices.filter(inv => 
          inv.status === 'unpaid' && inv.dueDate && new Date() > new Date(inv.dueDate)
        );

        setStats({
          totalInvoices: loadedInvoices.length,
          pendingPayments: pendingInvoices.length,
          paidInvoices: paidInvoices.length,
          totalRevenue: paidInvoices.reduce((sum, inv) => sum + inv.total, 0),
        });

        setOverdueInvoices(overdue);
        
        // Calculate real revenue growth
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthRevenue = paidInvoices
          .filter(inv => {
            const paidDate = new Date(inv.paidAt || inv.createdAt);
            return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
          })
          .reduce((sum, inv) => sum + inv.total, 0);
        
        const lastMonthRevenue = paidInvoices
          .filter(inv => {
            const paidDate = new Date(inv.paidAt || inv.createdAt);
            return paidDate.getMonth() === lastMonth && paidDate.getFullYear() === lastMonthYear;
          })
          .reduce((sum, inv) => sum + inv.total, 0);
        
        if (lastMonthRevenue > 0) {
          setRevenueGrowth(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
        } else if (currentMonthRevenue > 0) {
          setRevenueGrowth(100); // 100% growth if no previous month data but current month has revenue
        } else {
          setRevenueGrowth(0);
        }

        // Calculate monthly invoice growth
        const currentMonthInvoices = loadedInvoices.filter(inv => {
          const createdDate = new Date(inv.createdAt);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        const lastMonthInvoices = loadedInvoices.filter(inv => {
          const createdDate = new Date(inv.createdAt);
          return createdDate.getMonth() === lastMonth && createdDate.getFullYear() === lastMonthYear;
        }).length;

        if (lastMonthInvoices > 0) {
          setMonthlyGrowth(((currentMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100);
        } else if (currentMonthInvoices > 0) {
          setMonthlyGrowth(100);
        } else {
          setMonthlyGrowth(0);
        }

        // Calculate real success rate
        if (loadedInvoices.length > 0) {
          setSuccessRate((paidInvoices.length / loadedInvoices.length) * 100);
        } else {
          setSuccessRate(0);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string, dueDate?: Date) => {
    const isOverdue = dueDate && new Date() > dueDate;
    
    if (status === 'paid') {
      return <span className="badge-paid">Paid</span>;
    }
    
    if (status === 'failed') {
      return <span className="badge-failed">Failed</span>;
    }
    
    if (isOverdue) {
      return <span className="badge-overdue">Overdue</span>;
    }
    
    return <span className="badge-unpaid">Unpaid</span>;
  };

  const recentInvoices = invoices.slice(0, 5);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 font-serif">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-lg">Welcome back to your invoice management center</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">Today</p>
            <p className="text-lg font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
          </div>
          <Link
            to="/invoices/new"
            className="btn-royal group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/invoices" className="card-royal p-6 group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Invoices</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalInvoices}</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {monthlyGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`font-medium ${monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
            </span>
            <span className="text-slate-500 ml-1">from last month</span>
          </div>
        </Link>

        <Link to="/invoices?filter=unpaid" className="card-royal p-6 group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Payments</p>
                <p className="text-3xl font-bold text-slate-900">{stats.pendingPayments}</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-amber-600 font-medium">{overdueInvoices.length} overdue</span>
          </div>
        </Link>

        <Link to="/invoices?filter=paid" className="card-royal p-6 group hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Paid Invoices</p>
                <p className="text-3xl font-bold text-slate-900">{stats.paidInvoices}</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-emerald-600 font-medium">
              {successRate.toFixed(1)}%
            </span>
            <span className="text-slate-500 ml-1">success rate</span>
          </div>
        </Link>

        <div className="card-royal p-6 group hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full -mr-10 -mt-10 opacity-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
            <Building2 className="h-6 w-6 text-primary-500" />
          </div>
          <div className="mt-4 flex items-center text-sm relative z-10">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`font-medium ${revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-slate-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Recent Invoices */}
          <div className="card-royal">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent Invoices</h2>
                <p className="text-slate-600 text-sm">Latest invoice activity</p>
              </div>
              <Link 
                to="/invoices" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group"
              >
                View All
                <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{invoice.id}</div>
                            <div className="text-sm text-slate-500">{
                              (invoice.createdAt instanceof Date
                                ? invoice.createdAt
                                : new Date(invoice.createdAt)
                              ).toLocaleDateString()
                            }</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{invoice.client.name}</div>
                        {invoice.client.company && (
                          <div className="text-sm text-slate-500">{invoice.client.company}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status, invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/invoices/${invoice.id}`}
                            className="text-primary-600 hover:text-primary-900 transition-colors p-1 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentInvoices.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No invoices yet</h3>
                  <p className="text-slate-600 mb-6">Get started by creating your first invoice.</p>
                  <Link
                    to="/invoices/new"
                    className="btn-royal"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Invoice
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card-royal p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary-600" />
              This Month
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Invoices Created</span>
                <span className="font-semibold text-slate-900">
                  {invoices.filter(inv => 
                    new Date(inv.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Payments Received</span>
                <span className="font-semibold text-emerald-600">
                  {invoices.filter(inv => 
                    inv.status === 'paid' && 
                    new Date(inv.paidAt || inv.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Clients</span>
                <span className="font-semibold text-primary-600">{clientCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Overdue</span>
                <span className="font-semibold text-red-600">{overdueInvoices.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-royal p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/invoices/new"
                className="w-full btn-royal text-sm py-3"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
              <Link
                to="/clients"
                className="w-full btn-secondary text-sm py-3"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Clients
              </Link>
              <button className="w-full btn-secondary text-sm py-3">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </button>
            </div>
          </div>

          {/* Overdue Alerts */}
          {overdueInvoices.length > 0 && (
            <div className="card-royal p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                Overdue Invoices
              </h3>
              <div className="space-y-3">
                {overdueInvoices.slice(0, 3).map((invoice) => {
                  const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <Link 
                      key={invoice.id}
                      to={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-red-900 text-sm">{invoice.id}</div>
                        <div className="text-red-600 text-xs">{invoice.client.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-900 text-sm">{formatCurrency(invoice.total)}</div>
                        <div className="text-red-600 text-xs">
                          {daysOverdue} days
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {overdueInvoices.length > 3 && (
                  <Link 
                    to="/invoices?filter=overdue" 
                    className="block text-center text-red-600 hover:text-red-700 text-sm font-medium mt-3"
                  >
                    View all {overdueInvoices.length} overdue invoices
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};