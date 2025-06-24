import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Crown, 
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
  Sparkles
} from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { SettingsPanel } from './SettingsPanel';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuthContext();
  const isPublicInvoice = location.pathname.startsWith('/invoice/');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

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

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) setNotifications(data);
      }
    };
    fetchNotifications();
    // Optionally, subscribe to realtime changes
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` }, fetchNotifications)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [user]);

  if (isPublicInvoice) {
    return <div className="min-h-screen bg-gradient-to-br from-royal-50 to-primary-50">{children}</div>;
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

  // Calculate displayName and isAdmin for user menu
  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User';
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-50 via-white to-primary-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`bg-white shadow-premium transition-all duration-300 ease-in-out border-r border-royal-200 ${
          isSidebarCollapsed ? 'w-20' : 'w-80'
        }`}>
          {/* Header with Logo and Collapse Button */}
          <div className="flex items-center justify-between h-20 border-b border-royal-200 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className={`flex items-center space-x-3 transition-all duration-300 ${
              isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-serif">Solson LLC</h1>
                <p className="text-primary-200 text-sm font-medium">Invoice Portal</p>
              </div>
            </div>
            
            {/* Hamburger Menu Button */}
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
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 shadow-sm'
                        : 'text-royal-600 hover:bg-royal-50 hover:text-royal-900'
                    }`}
                    title={isSidebarCollapsed ? item.name : ''}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      isActive(item.href) 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'bg-royal-100 text-royal-600 group-hover:bg-primary-100 group-hover:text-primary-600'
                    } transition-all duration-200 ${
                      isSidebarCollapsed ? 'mx-auto' : 'mr-4'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className={`transition-all duration-300 ${
                      isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-royal-500 mt-0.5">{item.description}</div>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive(item.href) && (
                      <div className="absolute right-2 w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-royal-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-royal-300">{item.description}</div>
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-royal-900"></div>
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
          <header className="bg-white shadow-sm border-b border-royal-200 h-20 flex items-center justify-between px-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-royal-400" />
                <input
                  type="text"
                  placeholder="Search invoices, clients..."
                  className="pl-10 pr-4 py-2 w-80 rounded-xl border border-royal-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-royal-600 hover:bg-royal-50 transition-colors relative"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-premium border border-royal-200 z-50 animate-slide-down">
                    <div className="p-4 border-b border-royal-200">
                      <h3 className="font-semibold text-royal-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-slate-500 text-center">No notifications yet.</div>
                      ) : notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-royal-100 hover:bg-royal-50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-emerald-500' :
                              notification.type === 'warning' ? 'bg-amber-500' : 'bg-primary-500'
                            }`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-royal-900 text-sm">{notification.title}</h4>
                              <p className="text-royal-600 text-sm mt-1">{notification.message}</p>
                              <p className="text-royal-500 text-xs mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 text-center">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-royal-50 transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm relative">
                    {displayName.charAt(0).toUpperCase()}
                    {isAdmin && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-gold-500 rounded-full flex items-center justify-center">
                        <Crown className="h-1.5 w-1.5 text-white" />
                      </div>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-royal-600" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-premium border border-royal-200 z-50 animate-slide-down">
                    <div className="p-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-royal-50 transition-colors">
                        <User className="h-4 w-4 text-royal-600" />
                        <span className="text-royal-900 text-sm">Profile</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-royal-50 transition-colors">
                        <Settings className="h-4 w-4 text-royal-600" />
                        <span className="text-royal-900 text-sm">Settings</span>
                      </button>
                      <hr className="my-2 border-royal-200" />
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
            {/* Render settings panel if on /settings */}
            {location.pathname === '/settings' ? <SettingsPanel /> : children}
          </main>
        </div>
      </div>
      
      {/* Click outside handlers */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
};