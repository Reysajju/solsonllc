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
  ChevronDown,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
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
}

export const Layout: React.FC<LayoutProps> = ({ children, darkMode = false, colors }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const isPublicInvoice = location.pathname.startsWith('/invoice/');
  
  // Load sidebar state from localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    // Load user profile from localStorage
    const loadUserProfile = () => {
      if (user) {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        } else {
          // Set default profile
          const defaultProfile = {
            full_name: user.fullName || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'admin',
            company_name: 'Magnates Empire'
          };
          setUserProfile(defaultProfile);
          localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
        }
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
    // Clear all localStorage data on sign out
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('sidebarCollapsed');
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`bg-white shadow-xl transition-all duration-300 ease-in-out border-r border-slate-200 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } flex flex-col`}
        >
          {/* Header with Logo and Collapse Button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className={`flex items-center space-x-3 transition-all duration-300 ${
              isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              <div className="relative">
                <div className="h-8 w-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Magnates Empire</h1>
                <p className="text-xs text-primary-100">Business Suite</p>
              </div>
            </div>
            
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    isActive(item.href) 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-slate-300">{item.description}</div>
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-900"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-slate-200 p-3">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative">
                <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{userProfile?.company_name || 'Magnates Empire'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoices, clients..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm relative">
                    {displayName.charAt(0).toUpperCase()}
                    {isAdmin && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500">{userProfile?.company_name || 'Magnates Empire'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-slide-down">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-slate-100 mb-2">
                        <p className="text-sm font-medium text-slate-900">{displayName}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                            Administrator
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <User className="h-4 w-4 text-slate-600" />
                        <span className="text-slate-900 text-sm">Profile Settings</span>
                      </button>
                      <button 
                        onClick={handleSettingsClick}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <Settings className="h-4 w-4 text-slate-600" />
                        <span className="text-slate-900 text-sm">System Settings</span>
                      </button>
                      <hr className="my-2 border-slate-200" />
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-left"
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

          <main className="flex-1 overflow-y-auto bg-slate-50">
            {location.pathname === '/settings' || location.pathname === '/profile' ? (
              <div className="p-6">
                {children}
              </div>
            ) : (
              children
            )}
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