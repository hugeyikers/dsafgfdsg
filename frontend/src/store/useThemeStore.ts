import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  isColorblindMode: boolean;
  toggleDarkMode: () => void;
  toggleColorblindMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isColorblindMode: false,
      
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newMode };
      }),
      
      toggleColorblindMode: () => set((state) => {
        const newMode = !state.isColorblindMode;
        if (newMode) {
          document.documentElement.classList.add('colorblind');
        } else {
          document.documentElement.classList.remove('colorblind');
        }
        return { isColorblindMode: newMode };
      }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.isDarkMode) document.documentElement.classList.add('dark');
          if (state.isColorblindMode) document.documentElement.classList.add('colorblind');
        }
      },
    }
  )
);