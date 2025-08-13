import { Client } from '../types';

export const clientService = {
  // Create new client
  createClient: async (clientData: { name: string; company?: string; email: string; address: string }): Promise<Client> => {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const newClient: Client = {
      id: Date.now().toString(),
      name: clientData.name,
      company: clientData.company,
      email: clientData.email,
      address: clientData.address,
      createdAt: new Date(),
    };
    clients.unshift(newClient);
    localStorage.setItem('clients', JSON.stringify(clients));
    return newClient;
  },
  // Get all clients
  getUserClients: async (): Promise<Client[]> => {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    return clients.map((client: any) => ({
      ...client,
      createdAt: new Date(client.createdAt),
    }));
  },
  // Update client
  updateClient: async (id: string, clientData: { name?: string; company?: string; email?: string; address?: string }): Promise<Client> => {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const idx = clients.findIndex((c: Client) => c.id === id);
    if (idx === -1) throw new Error('Client not found');
    clients[idx] = {
      ...clients[idx],
      ...clientData,
      createdAt: new Date(clients[idx].createdAt),
    };
    localStorage.setItem('clients', JSON.stringify(clients));
    return clients[idx];
  },
  // Delete client
  deleteClient: async (id: string): Promise<void> => {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const filtered = clients.filter((c: Client) => c.id !== id);
    localStorage.setItem('clients', JSON.stringify(filtered));
  },
};