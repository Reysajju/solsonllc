import React, { useState, useMemo } from 'react';
import { Plus, Search, BarChart2, CheckCircle, XCircle, Eye, Send } from 'lucide-react';
import { formatCurrency } from '../utils/format';

import { Invoice, Client } from '../types';

type DonutChartProps = {
  value: number;
  total: number;
  color: string;
};

type EnhancedDashboardProps = {
  invoices: Invoice[];
  clients: Client[];
  onCreateInvoice?: () => void;
  darkMode?: boolean;
  colors?: {
    primary: string;
    accent: string;
    background: string;
    card: string;
    darkBackground: string;
    darkCard: string;
    text: string;
    darkText: string;
  };
};

// Minimalist chart component (SVG donut)
const DonutChart: React.FC<DonutChartProps> = ({ value, total, color }) => {
  const radius = 18;
  const stroke = 6;
  const normalized = Math.min(value / total, 1);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalized);
  return (
    <svg width="48" height="48" className="mx-auto">
      <circle
        cx="24" cy="24" r={radius}
        stroke="#334155" strokeWidth={stroke} fill="none"
      />
      <circle
        cx="24" cy="24" r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ invoices, clients, onCreateInvoice, darkMode = false, colors }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // KPIs
  const totalOutstanding = useMemo(() => invoices.filter((i: Invoice) => i.status === 'unpaid').reduce((sum: number, i: Invoice) => sum + i.total, 0), [invoices]);
  const totalReceived = useMemo(() => {
    const now = new Date();
    return invoices.filter((i: Invoice) => i.status === 'paid' && i.paidAt && (now.getTime() - new Date(i.paidAt).getTime()) < 30 * 24 * 3600 * 1000).reduce((sum: number, i: Invoice) => sum + i.total, 0);
  }, [invoices]);
  const overdueCount = useMemo(() => invoices.filter((i: Invoice) => i.status === 'unpaid' && i.dueDate && new Date(i.dueDate) < new Date()).length, [invoices]);

  // Table filtering
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;
    if (statusFilter !== 'all') filtered = filtered.filter((i: Invoice) => i.status === statusFilter);
    if (search.trim()) filtered = filtered.filter((i: Invoice) => i.client?.name?.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  }, [invoices, statusFilter, search]);

  // Quick Stats
  const paidClients = useMemo(() => {
    const paidIds = new Set(invoices.filter((i: Invoice) => i.status === 'paid').map((i: Invoice) => i.clientId));
    return clients.filter((c: Client) => paidIds.has(c.id));
  }, [invoices, clients]);
  const outstandingClients = useMemo(() => {
    const unpaidIds = new Set(invoices.filter((i: Invoice) => i.status === 'unpaid').map((i: Invoice) => i.clientId));
    return clients.filter((c: Client) => unpaidIds.has(c.id));
  }, [invoices, clients]);

  // Recent Activity (last 10 changes)
  const recentActivities = useMemo(() => {
    return invoices.slice(0, 10).map((i: Invoice) => ({
      id: i.id,
      client: i.client?.name || 'Unknown',
      status: i.status,
      amount: i.total,
      date: i.paidAt || i.createdAt,
      type: i.status === 'paid' ? 'Payment' : 'Invoice',
    }));
  }, [invoices]);

  return (
    <div
      className="min-h-screen p-6 md:p-10 animate-fade-in"
      style={{
        background: darkMode ? colors?.darkBackground : colors?.background,
        color: darkMode ? colors?.darkText : colors?.text,
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* Header & KPIs */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex space-x-6">
          <div style={{ background: darkMode ? colors?.darkCard : colors?.card, color: darkMode ? colors?.darkText : colors?.text }} className="rounded-xl p-6 shadow-lg flex flex-col items-center w-48">
            <span style={{ color: colors?.accent }} className="text-xs uppercase mb-2">Total Outstanding</span>
            <span style={{ color: colors?.primary }} className="text-3xl font-bold">{formatCurrency(totalOutstanding)}</span>
            <DonutChart value={totalOutstanding} total={10000} color={colors?.accent || '#06B6D4'} />
          </div>
          <div style={{ background: darkMode ? colors?.darkCard : colors?.card, color: darkMode ? colors?.darkText : colors?.text }} className="rounded-xl p-6 shadow-lg flex flex-col items-center w-48">
            <span style={{ color: colors?.accent }} className="text-xs uppercase mb-2">Received (30d)</span>
            <span style={{ color: colors?.primary }} className="text-3xl font-bold">{formatCurrency(totalReceived)}</span>
            <DonutChart value={totalReceived} total={10000} color={colors?.primary || '#6366F1'} />
          </div>
          <div style={{ background: darkMode ? colors?.darkCard : colors?.card, color: darkMode ? colors?.darkText : colors?.text }} className="rounded-xl p-6 shadow-lg flex flex-col items-center w-48">
            <span style={{ color: colors?.accent }} className="text-xs uppercase mb-2">Overdue</span>
            <span style={{ color: colors?.primary }} className="text-3xl font-bold">{overdueCount}</span>
            <BarChart2 className="h-8 w-8" style={{ color: colors?.accent }} />
          </div>
        </div>
        <button style={{ background: colors?.primary, color: colors?.card }} className="px-6 py-3 rounded-xl shadow-lg font-bold text-lg hover:scale-105 transition-transform" onClick={() => setShowModal(true)}>
          <Plus className="inline-block mr-2" /> Create New Invoice
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {['all', 'paid', 'unpaid', 'overdue'].map(s => (
            <button
              key={s}
              style={{
                background: statusFilter === s ? colors?.primary : (darkMode ? colors?.darkCard : colors?.card),
                color: statusFilter === s ? colors?.card : colors?.accent,
                border: `1px solid ${colors?.accent}`,
              }}
              className="px-4 py-2 rounded-xl font-semibold transition-colors"
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: colors?.accent }} />
          <input
            className="pl-10 pr-4 py-2 w-64 rounded-xl border focus:ring-2 transition-all duration-200"
            style={{
              background: darkMode ? colors?.darkCard : colors?.card,
              color: darkMode ? colors?.darkText : colors?.text,
              borderColor: colors?.accent,
            }}
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg" style={{ background: darkMode ? colors?.darkCard : colors?.card }}>
        <table className="min-w-full divide-y" style={{ borderColor: colors?.accent }}>
          <thead style={{ background: darkMode ? colors?.darkBackground : colors?.background }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors?.accent }}>Client</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors?.accent }}>Amount</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors?.accent }}>Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors?.accent }}>Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors?.accent }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ background: darkMode ? colors?.darkCard : colors?.card }}>
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id} style={{ background: darkMode ? colors?.darkCard : colors?.card }} className="hover:scale-[1.01] transition-transform">
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{invoice.client?.name || <span style={{ color: colors?.accent }}>No client</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(invoice.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: invoice.status === 'paid' ? colors?.accent : invoice.status === 'unpaid' ? colors?.primary : '#EF4444',
                      color: colors?.card,
                    }}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                  <button style={{ background: colors?.accent, color: colors?.card }} className="px-3 py-1 rounded-xl flex items-center" title="View Details"><Eye className="h-4 w-4 mr-1" /></button>
                  <button style={{ background: colors?.primary, color: colors?.card }} className="px-3 py-1 rounded-xl flex items-center" title="Send Reminder"><Send className="h-4 w-4 mr-1" /></button>
                  <button style={{ background: '#10b981', color: colors?.card }} className="px-3 py-1 rounded-xl flex items-center" title="Mark as Paid"><CheckCircle className="h-4 w-4 mr-1" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Activity Feed */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: colors?.accent }}>Recent Activity</h2>
        <ul className="space-y-3">
          {recentActivities.map(act => (
            <li key={act.id} style={{ background: darkMode ? colors?.darkCard : colors?.card, color: darkMode ? colors?.darkText : colors?.text }} className="rounded-xl p-4 flex items-center justify-between shadow-md animate-slide-in">
              <div>
                <span className="font-semibold">{act.client}</span>
                <span className="ml-2 text-xs" style={{ color: colors?.accent }}>{act.type}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span style={{ color: colors?.primary }} className="font-bold">{formatCurrency(act.amount)}</span>
                <span className="text-xs" style={{ color: colors?.accent }}>{new Date(act.date).toLocaleDateString()}</span>
                <span
                  className="px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: act.status === 'paid' ? colors?.accent : act.status === 'unpaid' ? colors?.primary : '#EF4444',
                    color: colors?.card,
                  }}
                >
                  {act.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={{ background: darkMode ? colors?.darkCard : colors?.card, color: darkMode ? colors?.darkText : colors?.text }} className="rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-2" style={{ color: '#10b981' }}>Clients Paid</h3>
          <ul className="space-y-2">
            {paidClients.map(c => (
              <li key={c.id} className="flex items-center justify-between">
                <span>{c.name}</span>
                <CheckCircle className="h-4 w-4" style={{ color: '#10b981' }} />
              </li>
            ))}
            {paidClients.length === 0 && <li style={{ color: colors?.accent }}>No paid clients yet.</li>}
          </ul>
        </div>
        <div style={{ background: darkMode ? colors?.darkCard : colors?.card, color: darkMode ? colors?.darkText : colors?.text }} className="rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-2" style={{ color: colors?.accent }}>Outstanding Clients</h3>
          <ul className="space-y-2">
            {outstandingClients.map(c => (
              <li key={c.id} className="flex items-center justify-between">
                <span>{c.name}</span>
                <XCircle className="h-4 w-4" style={{ color: colors?.accent }} />
              </li>
            ))}
            {outstandingClients.length === 0 && <li style={{ color: colors?.accent }}>No outstanding clients.</li>}
          </ul>
        </div>
      </div>

      {/* Modal for Invoice Creation (skeleton) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div style={{ background: darkMode ? colors?.darkBackground : colors?.background, color: darkMode ? colors?.darkText : colors?.text }} className="rounded-2xl p-8 shadow-2xl w-full max-w-xl animate-slide-in">
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors?.accent }}>Create New Invoice</h2>
            {/* Multi-step form goes here */}
            <button
              style={{ background: colors?.primary, color: colors?.card }}
              className="mt-6 w-full py-3 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              onClick={() => setShowModal(false)}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
