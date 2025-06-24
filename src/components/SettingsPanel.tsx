import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'company', label: 'Company Info' },
  { key: 'payments', label: 'Payment Methods' },
  { key: 'api', label: 'API Keys' },
];

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  // Add state for each tab's data
  // ...

  // Fetch and update logic for each tab
  // ...

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
      <div>
        {activeTab === 'profile' && (
          <div>Profile settings form (name, email, password)...</div>
        )}
        {activeTab === 'company' && (
          <div>Company info form (company name, address, etc)...</div>
        )}
        {activeTab === 'payments' && (
          <div>Payment methods config (Stripe, PayPal, Bank Transfer)...</div>
        )}
        {activeTab === 'api' && (
          <div>API keys and integration info...</div>
        )}
      </div>
    </div>
  );
};
