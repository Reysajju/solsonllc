import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, FileText, Users, LogOut, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isPublicInvoice = location.pathname.startsWith('/invoice/');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (isPublicInvoice) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Building2 },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Clients', href: '/clients', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Header with Logo and Collapse Button */}
          <div className="flex items-center justify-between h-16 border-b border-slate-200 px-4">
            <div className={`flex items-center space-x-2 transition-opacity duration-300 ${
              isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              <Building2 className="h-8 w-8 text-royal-600 flex-shrink-0" />
              <span className="text-xl font-bold text-slate-800 whitespace-nowrap">Solson LLC</span>
            </div>
            
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                      isActive(item.href)
                        ? 'bg-royal-50 text-royal-700 border-r-2 border-royal-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={isSidebarCollapsed ? item.name : ''}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      isSidebarCollapsed ? 'mx-auto' : 'mr-3'
                    }`} />
                    <span className={`transition-all duration-300 ${
                      isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}>
                      {item.name}
                    </span>
                    
                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-2 border-b-2 border-r-2 border-transparent border-r-slate-900"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sign Out Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button 
              className={`flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors group relative ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
              title={isSidebarCollapsed ? 'Sign Out' : ''}
            >
              <LogOut className={`h-5 w-5 flex-shrink-0 ${
                isSidebarCollapsed ? 'mx-auto' : 'mr-3'
              }`} />
              <span className={`transition-all duration-300 ${
                isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>
                Sign Out
              </span>
              
              {/* Tooltip for collapsed state */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Sign Out
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-2 border-b-2 border-r-2 border-transparent border-r-slate-900"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};