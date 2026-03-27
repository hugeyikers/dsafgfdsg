import { create } from 'zustand';
import client from '../api/client';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMINISTRATOR' | 'USER';
  createdAt: string;
}

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  maxTasksPerUser: number; // <-- Globalny limit zadań
  
  fetchUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<void>;
  updateUserRole: (id: number, role: 'ADMINISTRATOR' | 'USER') => Promise<void>;
  updateUserPassword: (id: number, password: string) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  setMaxTasksPerUser: (limit: number) => void; // <-- Akcja do zmiany limitu
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  maxTasksPerUser: 5, // Domyślna wartość globalnego limitu

  setMaxTasksPerUser: (limit: number) => set({ maxTasksPerUser: limit }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.get('/users');
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error fetching users', isLoading: false });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await client.post('/users', userData);
      await get().fetchUsers(); 
    } catch (error: any) {
      set({ error: error.message || 'Error creating user', isLoading: false });
      throw error;
    }
  },

  updateUserRole: async (id, role) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/users/${id}`, { role });
      await get().fetchUsers(); 
    } catch (error: any) {
      set({ error: error.message || 'Error updating role', isLoading: false });
      throw error;
    }
  },

  updateUserPassword: async (id, password) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/users/${id}`, { password });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error updating password', isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await client.delete(`/users/${id}`);
      await get().fetchUsers(); 
    } catch (error: any) {
      set({ error: error.message || 'Error deleting user', isLoading: false });
      throw error;
    }
  },
}));