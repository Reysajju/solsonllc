import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'company', label: 'Company Info' },
  { key: 'payments', label: 'Payment Methods' },
  { key: 'api', label: 'API Keys' },
];

// Hook to fetch current user's settings for use in other components
export function useUserSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      if (!user) { setSettings(null); setLoading(false); return; }
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setSettings(profileData || null);
      setLoading(false);
    };
    fetchSettings();
  }, []);
  return { settings, loading };
}

export const SettingsPanel: React.FC<{ onSettingsChange?: (settings: any) => void }> = ({ onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [company, setCompany] = useState({ company_name: '', address: '' });
  const [payments, setPayments] = useState({ stripe: '', paypal: '', bank: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch user profile, company, and payment info
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setMessage('');
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      if (!user) return setLoading(false);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) {
        setProfile({ full_name: profileData.full_name || '', email: profileData.email });
        setCompany({ company_name: profileData.company_name || '', address: profileData.address || '' });
        setPayments({
          stripe: profileData.stripe_account || '',
          paypal: profileData.paypal_email || '',
          bank: profileData.bank_details || '',
        });
        if (onSettingsChange) onSettingsChange(profileData);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [onSettingsChange]);

  // Save handlers
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', user.id);
    if (!error) {
      if (onSettingsChange) onSettingsChange({ ...profile, ...company, ...payments });
    }
    setMessage(error ? error.message : 'Profile updated!');
    setLoading(false);
  };
  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ company_name: company.company_name, address: company.address }).eq('id', user.id);
    if (!error) {
      if (onSettingsChange) onSettingsChange({ ...profile, ...company, ...payments });
    }
    setMessage(error ? error.message : 'Company info updated!');
    setLoading(false);
  };
  const savePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ stripe_account: payments.stripe, paypal_email: payments.paypal, bank_details: payments.bank }).eq('id', user.id);
    if (!error) {
      if (onSettingsChange) onSettingsChange({ ...profile, ...company, ...payments });
    }
    setMessage(error ? error.message : 'Payment methods updated!');
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-royal-900">Settings</h2>
      <div className="flex space-x-4 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-royal-100 text-royal-700 hover:bg-royal-200'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {message && <div className="mb-4 text-green-600 font-medium">{message}</div>}
      <div>
        {activeTab === 'profile' && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input type="text" className="input" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input type="email" className="input" value={profile.email} disabled />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>Save Profile</button>
          </form>
        )}
        {activeTab === 'company' && (
          <form onSubmit={saveCompany} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Company Name</label>
              <input type="text" className="input" value={company.company_name} onChange={e => setCompany({ ...company, company_name: e.target.value })} />
            </div>
            <div>
              <label className="block font-medium mb-1">Address</label>
              <input type="text" className="input" value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>Save Company Info</button>
          </form>
        )}
        {activeTab === 'payments' && (
          <form onSubmit={savePayments} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Stripe Account ID</label>
              <input type="text" className="input" value={payments.stripe} onChange={e => setPayments({ ...payments, stripe: e.target.value })} placeholder="e.g. acct_123..." />
            </div>
            <div>
              <label className="block font-medium mb-1">PayPal Email</label>
              <input type="email" className="input" value={payments.paypal} onChange={e => setPayments({ ...payments, paypal: e.target.value })} placeholder="your@email.com" />
            </div>
            <div>
              <label className="block font-medium mb-1">Bank Details</label>
              <textarea className="input" value={payments.bank} onChange={e => setPayments({ ...payments, bank: e.target.value })} placeholder="Bank name, IBAN, SWIFT, etc" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>Save Payment Methods</button>
          </form>
        )}
        {activeTab === 'api' && (
          <div>
            <div className="mb-2">API keys and integration info coming soon.</div>
          </div>
        )}
      </div>
    </div>
  );
};
