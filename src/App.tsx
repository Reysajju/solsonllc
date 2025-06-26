import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/AuthProvider';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceView } from './components/InvoiceView';
import { ClientList } from './components/ClientList';
import { SettingsPanel } from './components/SettingsPanel';

const AppRoutes: React.FC = () => {
  const { user } = useAuthContext();

  return (
    <Router>
      <Routes>
        {/* Authentication Check */}
        {!user ? (
          <Route path="*" element={<Login />} />
        ) : (
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invoices" element={<InvoiceList />} />
                <Route path="/invoices/new" element={<InvoiceForm />} />
                <Route path="/invoices/:id" element={<InvoiceView />} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/settings" element={<SettingsPanel />} />
                <Route path="/profile" element={<SettingsPanel />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          } />
        )}
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;