import axios from 'axios';

// --- SIMPLE API CLIENT (NO CRYPTO) ---

// Używamy zmiennej środowiskowej z bezpiecznym fallbackiem (pusty string wymusi relatywne ścieżki proxy)
const API_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Wymagane dla cookie/session jeśli backend tego używa
});

// Interceptor żądań: Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor odpowiedzi: Prosta obsługa błędów
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jeśli 401 (Unauthorized), można tu przekierować na login
    // ale tylko jeśli nie jesteśmy na stronie logowania
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
       localStorage.removeItem('token');
       window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;