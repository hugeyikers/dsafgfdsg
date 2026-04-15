import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import client from '../api/client';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  fullName: string;
  role: string;
  email: string;
}

interface AuthState {
  isLogged: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLogged: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await client.post('/auth/login', { email, password });
          const { access_token, user } = response.data;

          localStorage.setItem('token', access_token);

          const decoded: any = jwtDecode(access_token);
          const userWithRole = { ...user, role: decoded.role };

          set({ 
            isLogged: true, 
            user: userWithRole, 
            isLoading: false 
          });
        } catch (err: any) {
          console.error('Login error:', err);
          const errorMessage = err.response?.data?.message || 'An error occurred during login.';
          const finalMessage = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;

          set({ 
            isLoading: false, 
            error: finalMessage 
          });
          
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ isLogged: false, user: null, error: null });
        window.location.href = '/login';
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isLogged: state.isLogged, 
        user: state.user 
      }),
    }
  )
);