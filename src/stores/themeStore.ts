import { create } from 'zustand'

interface ThemeState {
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'light', // Default theme

  toggleTheme: () => {
    set((state) => ({
      currentTheme: state.currentTheme === 'light' ? 'dark' : 'light'
    }))
  },

  setTheme: (theme) => {
    set({ currentTheme: theme })
  }
}));

// Apply theme to document
const applyThemeToDocument = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme')
    document.documentElement.classList.remove('light-theme')
  } else {
    document.documentElement.classList.add('light-theme')
    document.documentElement.classList.remove('dark-theme')
  }
}

// Initialize theme
const initializeTheme = () => {
  const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  const initialTheme = storedTheme || 'light'
  
  useThemeStore.getState().setTheme(initialTheme)
  applyThemeToDocument(initialTheme)
}

// Subscribe to theme changes
useThemeStore.subscribe((state) => {
  applyThemeToDocument(state.currentTheme)
  localStorage.setItem('theme', state.currentTheme)
})

// Initialize theme when store is created
initializeTheme()