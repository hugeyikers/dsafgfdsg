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
  
  fetchUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<void>;
  updateUserRole: (id: number, role: 'ADMINISTRATOR' | 'USER') => Promise<void>;
  updateUserPassword: (id: number, password: string) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.get('/users');
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Błąd pobierania użytkowników', isLoading: false });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await client.post('/users', userData);
      await get().fetchUsers(); // Odśwież listę
    } catch (error: any) {
      set({ error: error.message || 'Błąd tworzenia użytkownika', isLoading: false });
      throw error;
    }
  },

  updateUserRole: async (id, role) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/users/${id}`, { role });
      await get().fetchUsers(); // Odśwież listę
    } catch (error: any) {
      set({ error: error.message || 'Błąd aktualizacji roli', isLoading: false });
      throw error;
    }
  },

  updateUserPassword: async (id, password) => {
    set({ isLoading: true, error: null });
    try {
      await client.put(`/users/${id}`, { password });
      // Nie musimy odświeżać listy użytkowników po zmianie hasła
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Błąd aktualizacji hasła', isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await client.delete(`/users/${id}`);
      await get().fetchUsers(); // Odśwież listę
    } catch (error: any) {
      set({ error: error.message || 'Błąd usuwania użytkownika', isLoading: false });
      throw error;
    }
  },
}));
