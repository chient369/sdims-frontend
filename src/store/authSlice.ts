import { StateCreator } from 'zustand';
import { User } from '../features/auth/types';
import { authService } from '../features/auth/service';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

export interface AuthState {
  user: User | null;
  token: string | null;
  token_type: string | null;
  expires_in: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (username: string, password: string, remember_me?: boolean) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export type AuthSlice = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  token_type: null,
  expires_in: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  ...initialState,
  
  login: async (username: string, password: string, remember_me = false) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token, token_type, expires_in } = await authService.login(username, password, remember_me);
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', token_type);
      localStorage.setItem('expires_in', expires_in.toString());
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        token_type,
        expires_in,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed',
        isAuthenticated: false,
        user: null,
        token: null,
        token_type: null,
        expires_in: null,
      });
      throw error;
    }
  },
  
  logout: () => {
    authService.logout().finally(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('expires_in');
      localStorage.removeItem('user');
      
      set({
        user: null,
        token: null,
        token_type: null,
        expires_in: null,
        isAuthenticated: false,
        error: null,
      });
    });
  },
  
  checkAuth: async () => {
    const { token } = get();
    if (!token) return false;
    
    set({ isLoading: true });
    
    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        user: null,
        token: null,
        token_type: null,
        expires_in: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
      return false;
    }
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user || !user.permissions) return false;
    return hasPermission(permission, user.permissions);
  },
  
  hasAnyPermission: (permissions: string[]) => {
    const { user } = get();
    if (!user || !user.permissions) return false;
    return hasAnyPermission(permissions, user.permissions);
  },
  
  hasAllPermissions: (permissions: string[]) => {
    const { user } = get();
    if (!user || !user.permissions) return false;
    return hasAllPermissions(permissions, user.permissions);
  },
}); 