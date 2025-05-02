import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types/user';
import { authService } from '../services/features/auth/authService';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  token_type: string | null;
  expires_in: number | null;
  error: string | null;
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; token_type: string; expires_in: number } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_AUTH' };

type AuthContextType = {
  state: AuthState;
  login: (username: string, password: string, remember_me?: boolean) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  token_type: null,
  expires_in: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        token_type: action.payload.token_type,
        expires_in: action.payload.expires_in,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        token_type: null,
        expires_in: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return initialState;
    case 'RESTORE_AUTH':
      // Logic to restore auth state from localStorage/sessionStorage happens in useEffect
      return state;
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('token');
    const token_type = localStorage.getItem('token_type');
    const expires_in = localStorage.getItem('expires_in');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user, 
            token, 
            token_type: token_type || 'Bearer', 
            expires_in: expires_in ? parseInt(expires_in, 10) : 3600 
          } 
        });
      } catch (error) {
        // Do not clear local storage here as it's managed by AuthService
        console.error('Error parsing auth data:', error);
      }
    }
  }, []);

  const login = async (username: string, password: string, remember_me = false) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await authService.login(username, password, remember_me);
      
      // No need to save to localStorage as it's handled by AuthService
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: response.user, 
          token: response.token, 
          token_type: response.token_type, 
          expires_in: response.expires_in 
        } 
      });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error; // Re-throw to allow handling in the UI
    }
  };

  const logout = () => {
    authService.logout().finally(() => {
      // No need to clear localStorage here as it's handled by AuthService
      dispatch({ type: 'LOGOUT' });
    });
  };

  const checkPermission = (permission: string) => {
    if (!state.user || !state.user.permissions) {
      return false;
    }
    return hasPermission(permission, state.user.permissions);
  };

  const checkAnyPermission = (permissions: string[]) => {
    if (!state.user || !state.user.permissions) {
      return false;
    }
    return hasAnyPermission(permissions, state.user.permissions);
  };

  const checkAllPermissions = (permissions: string[]) => {
    if (!state.user || !state.user.permissions) {
      return false;
    }
    return hasAllPermissions(permissions, state.user.permissions);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        state, 
        login, 
        logout, 
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 