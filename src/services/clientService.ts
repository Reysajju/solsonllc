import { supabase } from '../lib/supabase';
import { Client } from '../types';

export const clientService = {
  // Create new client
  async createClient(clientData: {
    name: string;
    company?: string;
    email: string;
    address: string;
  }): Promise<Client> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.data.user.id,
        name: clientData.name,
        company: clientData.company,
        email: clientData.email,
        address: clientData.address,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      email: data.email,
      address: data.address,
      createdAt: new Date(data.created_at),
    };
  },

  // Get all clients for current user
  async getUserClients(): Promise<Client[]> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(client => ({
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      address: client.address,
      createdAt: new Date(client.created_at),
    }));
  },

  // Update client
  async updateClient(id: string, clientData: {
    name?: string;
    company?: string;
    email?: string;
    address?: string;
  }): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...clientData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      email: data.email,
      address: data.address,
      createdAt: new Date(data.created_at),
    };
  },

  // Delete client
  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};