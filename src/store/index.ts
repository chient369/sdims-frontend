import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

import { createAuthSlice, AuthSlice } from './authSlice';
import { createUiSlice, UiSlice } from './uiSlice';
import { createNotificationSlice, NotificationSlice } from './notificationSlice';

// Define the store type
export type StoreState = AuthSlice & UiSlice & NotificationSlice;

// Create the combined store
export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUiSlice(...a),
        ...createNotificationSlice(...a),
      }),
      {
        name: 'sdims-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist these state slices
          token: state.token,
          theme: state.theme,
          sidebarState: state.sidebarState,
        }),
      }
    )
  )
);

// Export typed selectors
export const useAuth = () => {
  const { 
    user, token, isAuthenticated, isLoading, error,
    login, logout, checkAuth, hasPermission, hasAnyPermission, hasAllPermissions
  } = useStore();
  
  return {
    user, token, isAuthenticated, isLoading, error,
    login, logout, checkAuth, hasPermission, hasAnyPermission, hasAllPermissions
  };
};

export const useUI = () => {
  const { 
    theme, sidebarState, isMobileMenuOpen,
    setTheme, toggleTheme, setSidebarState, toggleSidebar, toggleMobileMenu 
  } = useStore();
  
  return {
    theme, sidebarState, isMobileMenuOpen,
    setTheme, toggleTheme, setSidebarState, toggleSidebar, toggleMobileMenu
  };
};

export const useNotifications = () => {
  const { 
    notifications, 
    addNotification, removeNotification, clearNotifications 
  } = useStore();
  
  return {
    notifications,
    addNotification, removeNotification, clearNotifications
  };
}; 