import React, { useState, useEffect } from 'react';
import { Building2, User, Upload, Save, X, Crown, Shield, Mail, Phone, MapPin, Globe, Hash } from 'lucide-react';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'company', label: 'Company Info', icon: Building2 },
];

export const SettingsPanel: React.FC<{ onSettingsChange?: (settings: any) => void }> = ({ onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ 
    full_name: '', 
    email: '', 
    phone: '', 
    address: '',
    role: 'admin'
  });
  const [company, setCompany] = useState({ 
    company_name: 'Magnates Empire', 
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
    const loadSettings = () => {
      try {
        // Load from localStorage
        const savedProfile = localStorage.getItem('userProfile');
        const savedCompany = localStorage.getItem('companySettings');
        
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          setProfile({
            full_name: profileData.full_name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            role: profileData.role || 'admin'
          });
        }
        
        if (savedCompany) {
          const companyData = JSON.parse(savedCompany);
          setCompany(companyData);
          if (companyData.logo_url) {
            setLogoPreview(companyData.logo_url);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Save to localStorage
      const profileData = { ...profile };
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      
      if (onSettingsChange) {
        onSettingsChange({ ...profileData, ...company });
      }
      
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Handle logo upload (simulate with base64 for demo)
      let logoUrl = company.logo_url;
      if (logoFile) {
        // In a real app, you'd upload to a service like Supabase Storage
        logoUrl = logoPreview; // Use the base64 preview for demo
      }
      
      const companyData = { ...company, logo_url: logoUrl };
      
      // Save to localStorage
      localStorage.setItem('companySettings', JSON.stringify(companyData));
      setCompany(companyData);
      
      if (onSettingsChange) {
        onSettingsChange({ ...profile, ...companyData });
      }
      
      setMessage('Company information updated successfully!');
    } catch (error) {
      console.error('Error saving company info:', error);
      setMessage('Error saving company information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-primary-100 mt-1">Manage your profile and company information</p>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-200 bg-slate-50">
            <nav className="p-4 space-y-2">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.key 
                        ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm' 
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
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
          <div className="flex-1 p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-xl border ${
                message.includes('successfully') 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className="flex items-center">
                  {message.includes('successfully') ? (
                    <Shield className="h-5 w-5 mr-2" />
                  ) : (
                    <X className="h-5 w-5 mr-2" />
                  )}
                  {message}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Personal Information</h3>
                  <p className="text-slate-600">Update your personal details and contact information.</p>
                </div>
                
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                        value={profile.full_name} 
                        onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm bg-slate-50 text-slate-500" 
                        value={profile.email} 
                        disabled 
                        placeholder="your@email.com"
                      />
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                        value={profile.phone} 
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Shield className="inline h-4 w-4 mr-1" />
                        Role
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Crown className="h-4 w-4 mr-1" />
                          Administrator
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Address
                    </label>
                    <textarea
                      className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                      value={profile.address} 
                      onChange={e => setProfile({ ...profile, address: e.target.value })}
                      rows={3}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                      disabled={loading}
                    >
                      <Save className="mr-2 h-5 w-5" />
                      {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'company' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Company Information</h3>
                  <p className="text-slate-600">Manage your business details and branding.</p>
                </div>
                
                <form onSubmit={saveCompany} className="space-y-6">
                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-6">
                      {logoPreview ? (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Company Logo" 
                            className="h-20 w-20 object-cover rounded-xl border-2 border-slate-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview('');
                              setLogoFile(null);
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-20 w-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl border-2 border-dashed border-primary-300 flex items-center justify-center">
                          <Crown className="h-8 w-8 text-primary-500" />
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
                          className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm hover:shadow-md"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </label>
                        <p className="text-xs text-slate-500 mt-2">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Building2 className="inline h-4 w-4 mr-1" />
                        Company Name *
                      </label>
                      <input 
                        type="text" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                        value={company.company_name} 
                        onChange={e => setCompany({ ...company, company_name: e.target.value })}
                        required
                        placeholder="Magnates Empire"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Hash className="inline h-4 w-4 mr-1" />
                        Tax ID / EIN
                      </label>
                      <input 
                        type="text" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                        value={company.tax_id} 
                        onChange={e => setCompany({ ...company, tax_id: e.target.value })}
                        placeholder="12-3456789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Company Address
                    </label>
                    <textarea 
                      rows={3}
                      className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                      value={company.company_address} 
                      onChange={e => setCompany({ ...company, company_address: e.target.value })}
                      placeholder="Empire Tower, 88 Crown St, Metropolis, NY 10001"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Company Phone
                      </label>
                      <input 
                        type="tel" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                        value={company.company_phone} 
                        onChange={e => setCompany({ ...company, company_phone: e.target.value })}
                        placeholder="(555) 987-6543"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Company Email
                      </label>
                      <input 
                        type="email" 
                        className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                        value={company.company_email} 
                        onChange={e => setCompany({ ...company, company_email: e.target.value })}
                        placeholder="billing@magnatesempire.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Globe className="inline h-4 w-4 mr-1" />
                      Company Website
                    </label>
                    <input 
                      type="url" 
                      className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors" 
                      value={company.company_website} 
                      onChange={e => setCompany({ ...company, company_website: e.target.value })}
                      placeholder="https://magnatesempire.com"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                      disabled={loading}
                    >
                      <Save className="mr-2 h-5 w-5" />
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