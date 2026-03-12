import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import client from '../api/client';
import { jwtDecode } from 'jwt-decode';

// Dokładne odzwierciedlenie tego, co zwraca backend w polu 'user'
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
          
          // Oczekujemy struktury: { access_token: string, user: User }
          const { access_token, user } = response.data;

          // Zapisujemy token, aby axios interceptor go widział
          localStorage.setItem('token', access_token);

          // Dekodujemy rolę z tokena (bezpieczniej niż przesyłanie jej w jawnym JSON-ie odpowiedzi)
          const decoded: any = jwtDecode(access_token);
          const userWithRole = { ...user, role: decoded.role };

          set({ 
            isLogged: true, 
            user: userWithRole, 
            isLoading: false 
          });
        } catch (err: any) {
          console.error('Login error:', err);
          // Pobieramy wiadomość błędu z backendu (NestJS rzuca message w body)
          const errorMessage = err.response?.data?.message || 'Wystąpił błąd podczas logowania.';
          // Jeśli message jest tablicą (np. z class-validator), łączymy ją
          const finalMessage = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;

          set({ 
            isLoading: false, 
            error: finalMessage 
          });
          
          // Rzucamy błąd dalej, jeśli komponent chce zareagować (opcjonalne)
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ isLogged: false, user: null, error: null });
        // Hard redirect dla bezpieczeństwa (czyści pamięć JS)
        window.location.href = '/login';
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Nie chcemy persystować stanu ładowania ani błędów
      partialize: (state) => ({ 
        isLogged: state.isLogged, 
        user: state.user 
      }),
    }
  )
);