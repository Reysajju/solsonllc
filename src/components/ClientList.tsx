import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Building, Edit, Trash2 } from 'lucide-react';
import { Client } from '../types';
import { loadClients, saveClients, generateClientId } from '../utils/storage';

export const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    const loadedClients = loadClients();
    setClients(loadedClients);
    setFilteredClients(loadedClients);
  }, []);

  useEffect(() => {
    let filtered = [...clients];

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({ name: '', company: '', email: '', address: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: '', company: '', email: '', address: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      // Update existing client
      const updatedClients = clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...formData } as Client
          : client
      );
      setClients(updatedClients);
      saveClients(updatedClients);
    } else {
      // Create new client
      const newClient: Client = {
        id: generateClientId(),
        name: formData.name!,
        company: formData.company,
        email: formData.email!,
        address: formData.address!,
        createdAt: new Date(),
      };

      const updatedClients = [newClient, ...clients];
      setClients(updatedClients);
      saveClients(updatedClients);
    }

    closeModal();
  };

  const deleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      saveClients(updatedClients);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
            <p className="text-slate-600 mt-2">Manage your client database</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500"
          />
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
                {client.company && (
                  <p className="text-slate-600 text-sm mt-1">{client.company}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => openModal(client)}
                  className="p-2 text-slate-400 hover:text-royal-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <Mail className="mr-2 h-4 w-4" />
                {client.email}
              </div>
              <div className="flex items-start text-sm text-slate-600">
                <Building className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="whitespace-pre-line">{client.address}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Added {client.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            {clients.length === 0 ? (
              <>
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No clients yet</h3>
                <p className="mt-1 text-sm text-slate-500">Get started by adding your first client.</p>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No matching clients</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria.</p>
              </>
            )}
          </div>
          {clients.length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full animate-fade-in">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-royal-500 focus:ring-royal-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-royal-600 hover:bg-royal-700 transition-colors"
                  >
                    {editingClient ? 'Update Client' : 'Add Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};