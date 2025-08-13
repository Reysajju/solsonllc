import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { SettingsPanel } from './SettingsPanel';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const isPublicInvoice = location.pathname.startsWith('/invoice/');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    loadUserProfile();
  }, [user]);

  if (isPublicInvoice) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">{children}</div>;
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: BarChart3,
      description: 'Overview & Analytics'
    },
    { 
      name: 'Invoices', 
      href: '/invoices', 
      icon: FileText,
      description: 'Manage Invoices'
    },
    { 
      name: 'Clients', 
      href: '/clients', 
      icon: Users,
      description: 'Client Management'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'System Configuration'
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User';
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`bg-white shadow-premium transition-all duration-300 ease-in-out border-r border-slate-200 ${
          isSidebarCollapsed ? 'w-20' : 'w-80'
        }`}>
          {/* Header with Logo and Collapse Button */}
          <div className="flex items-center justify-between h-20 border-b border-slate-200 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className={`flex items-center space-x-3 transition-all duration-300 ${
              isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-br from-empire-500 to-empire-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <>
                  <h1 className="text-xl font-bold text-white font-serif">Magnates Empire</h1>
                  <p className="text-empire-200 text-sm font-medium">Business Suite</p>
                </>
              </div>
            </div>
            
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <Menu className="h-6 w-6" />
              ) : (
                <X className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-empire-50 to-empire-100 text-empire-700 border border-empire-200 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={isSidebarCollapsed ? item.name : ''}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        isActive(item.href)
                          ? 'bg-empire-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-empire-100 group-hover:text-empire-600'
                      } transition-all duration-200 ${
                        isSidebarCollapsed ? 'mx-auto' : 'mr-4'
                      } ${
                        isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="font-semibold ml-2">{item.name}</div>
                    )}
                    {isActive(item.href) && (
                      <div className="absolute right-2 w-2 h-2 bg-empire-600 rounded-full"></div>
                    )}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-slate-300">{item.description}</div>
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-900"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="bg-white shadow-sm border-b border-slate-200 h-20 flex items-center justify-between px-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoices, clients..."
                  className="pl-10 pr-4 py-2 w-80 rounded-xl border border-slate-200 focus:border-empire-500 focus:ring-2 focus:ring-empire-200 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
          {/* Removed duplicate <header> opening tag to fix JSX error */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm relative">
                  {/* ...existing code... */}
                    {isAdmin && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full flex items-center justify-center">
                        <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-premium border border-slate-200 z-50 animate-slide-down">
                    <div className="p-2">
                      <button 
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-600" />
                        <span className="text-slate-900 text-sm">Profile</span>
                      </button>
                      <button 
                        onClick={handleSettingsClick}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-600" />
                        <span className="text-slate-900 text-sm">Settings</span>
                      </button>
                      <hr className="my-2 border-slate-200" />
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {location.pathname === '/settings' || location.pathname === '/profile' ? <SettingsPanel /> : children}
          </main>
        </div>
      </div>
      
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};