import { StateCreator } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

export interface UiState {
  theme: Theme;
  sidebarState: SidebarState;
  isMobileMenuOpen: boolean;
}

export interface UiActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}

export type UiSlice = UiState & UiActions;

const initialState: UiState = {
  theme: 'light',
  sidebarState: 'expanded',
  isMobileMenuOpen: false,
};

export const createUiSlice: StateCreator<UiSlice> = (set, get) => ({
  ...initialState,
  
  setTheme: (theme: Theme) => {
    set({ theme });
    
    // Apply theme to document
    if (theme === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isSystemDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    
    localStorage.setItem('theme', theme);
  },
  
  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },
  
  setSidebarState: (sidebarState: SidebarState) => {
    set({ sidebarState });
    localStorage.setItem('sidebarState', sidebarState);
  },
  
  toggleSidebar: () => {
    const { sidebarState } = get();
    const newSidebarState = sidebarState === 'expanded' ? 'collapsed' : 'expanded';
    get().setSidebarState(newSidebarState);
  },
  
  toggleMobileMenu: () => {
    set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },
}); 