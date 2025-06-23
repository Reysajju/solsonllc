import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceView } from './components/InvoiceView';
import { PublicInvoice } from './components/PublicInvoice';
import { ClientList } from './components/ClientList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        {/* Public Invoice Route (no authentication required) */}
        <Route path="/invoice/:id" element={<PublicInvoice />} />

        {/* Authentication Check */}
        {!isAuthenticated ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
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
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          } />
        )}
      </Routes>
    </Router>
  );
}

export default App;