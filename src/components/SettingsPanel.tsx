import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, User, Upload, Save, X } from 'lucide-react';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'company', label: 'Company Info', icon: Building2 },
];

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
  const [profile, setProfile] = useState({ 
    full_name: '', 
    email: '', 
    phone: '', 
    address: '' 
  });
  const [company, setCompany] = useState({ 
    company_name: '', 
    company_address: '', 
    company_phone: '',
    company_email: '',
    company_website: '',
    tax_id: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

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
        setProfile({ 
          full_name: profileData.full_name || '', 
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
        setCompany({ 
          company_name: profileData.company_name || '', 
          company_address: profileData.company_address || '',
          company_phone: profileData.company_phone || '',
          company_email: profileData.company_email || '',
          company_website: profileData.company_website || '',
          tax_id: profileData.tax_id || '',
          logo_url: profileData.logo_url || ''
        });
        if (profileData.logo_url) {
          setLogoPreview(profileData.logo_url);
        }
        if (onSettingsChange) onSettingsChange(profileData);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [onSettingsChange]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return company.logo_url;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${user.data.user.id}/logo.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, logoFile, { upsert: true });

    if (error) {
      console.error('Logo upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) return;
    
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address
    }).eq('id', user.id);
    
    if (!error) {
      if (onSettingsChange) onSettingsChange({ ...profile, ...company });
    }
    setMessage(error ? error.message : 'Profile updated successfully!');
    setLoading(false);
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) return;

    // Upload logo if new file selected
    const logoUrl = await uploadLogo();

    const { error } = await supabase.from('profiles').update({
      company_name: company.company_name,
      company_address: company.company_address,
      company_phone: company.company_phone,
      company_email: company.company_email,
      company_website: company.company_website,
      tax_id: company.tax_id,
      logo_url: logoUrl
    }).eq('id', user.id);
    
    if (!error) {
      setCompany(prev => ({ ...prev, logo_url: logoUrl || '' }));
      if (onSettingsChange) onSettingsChange({ ...profile, ...company, logo_url: logoUrl });
    }
    setMessage(error ? error.message : 'Company information updated successfully!');
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-600 mt-1">Manage your profile and company information</p>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-200 p-6">
            <nav className="space-y-2">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      activeTab === tab.key 
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {message && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.includes('successfully') 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h3>
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                        value={profile.full_name} 
                        onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm bg-slate-50" 
                        value={profile.email} 
                        disabled 
                      />
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                        value={profile.phone} 
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Address
                      </label>
                      <input 
                        type="text" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                        value={profile.address} 
                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="btn-royal" 
                      disabled={loading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'company' && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Company Information</h3>
                <form onSubmit={saveCompany} className="space-y-6">
                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      {logoPreview ? (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Company Logo" 
                            className="h-20 w-20 object-cover rounded-xl border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview('');
                              setLogoFile(null);
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-20 w-20 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </label>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name *
                      </label>
                      <input 
                        type="text" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                        value={company.company_name} 
                        onChange={e => setCompany({ ...company, company_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tax ID / EIN
                      </label>
                      <input 
                        type="text" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                        value={company.tax_id} 
                        onChange={e => setCompany({ ...company, tax_id: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Address
                    </label>
                    <textarea 
                      rows={3}
                      className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                      value={company.company_address} 
                      onChange={e => setCompany({ ...company, company_address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Phone
                      </label>
                      <input 
                        type="tel" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                        value={company.company_phone} 
                        onChange={e => setCompany({ ...company, company_phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Email
                      </label>
                      <input 
                        type="email" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                        value={company.company_email} 
                        onChange={e => setCompany({ ...company, company_email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Website
                    </label>
                    <input 
                      type="url" 
                      className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                      value={company.company_website} 
                      onChange={e => setCompany({ ...company, company_website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="btn-royal" 
                      disabled={loading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Company Info'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};