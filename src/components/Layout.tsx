import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, FileText, Users, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isPublicInvoice = location.pathname.startsWith('/invoice/');

  if (isPublicInvoice) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Building2 },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Clients', href: '/clients', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex items-center justify-center h-16 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-royal-600" />
              <span className="text-xl font-bold text-slate-800">Solson LLC</span>
            </div>
          </div>
          
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-royal-50 text-royal-700 border-r-2 border-royal-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
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