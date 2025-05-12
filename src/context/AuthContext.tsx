import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { User, UserProfile } from '../features/auth/types';
import { authService } from '../features/auth/service';
import { getUserProfile } from '../features/auth/api';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  token_type: string | null;
  expires_in: number | null;
  error: string | null;
  userProfile: UserProfile | null;
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; token_type: string; expires_in: number } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'FETCH_PROFILE_REQUEST' }
  | { type: 'FETCH_PROFILE_SUCCESS'; payload: UserProfile }
  | { type: 'FETCH_PROFILE_FAILURE'; payload: string }
  | { type: 'RESTORE_AUTH' };

type AuthContextType = {
  state: AuthState;
  login: (username: string, password: string, remember_me?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermission: (permissions: string[]) => boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  token_type: null,
  expires_in: null,
  error: null,
  userProfile: null,
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
        userProfile: null,
      };
    case 'LOGOUT':
      return initialState;
    case 'FETCH_PROFILE_REQUEST':
      return { ...state, isLoading: true };
    case 'FETCH_PROFILE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        userProfile: action.payload,
        // Update user permissions from the detailed profile
        user: state.user ? {
          ...state.user,
          permissions: action.payload.permissions
        } : null,
      };
    case 'FETCH_PROFILE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
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

  // Initialize auth state from storage
  useEffect(() => {
    // Check if user is already logged in (from localStorage or sessionStorage)
    const checkAuthState = () => {
      const currentUser = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();
      
      if (isAuthenticated && currentUser) {
        // Restore the auth state
        const storage = authService.isRemembered() ? localStorage : sessionStorage;
        const token = storage.getItem('token');
        const token_type = storage.getItem('token_type');
        const expires_in = storage.getItem('expires_in');
        
        if (token) {
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              user: currentUser, 
              token, 
              token_type: token_type || 'Bearer', 
              expires_in: expires_in ? parseInt(expires_in, 10) : 3600 
            } 
          });
          
          // Fetch full user profile if we're authenticated
          fetchUserProfile();
        }
      }
    };
    
    checkAuthState();
  }, []);
  
  // Check for token expiration and refresh if needed
  useEffect(() => {
    if (!state.isAuthenticated) return;
    
    const checkTokenExpiration = async () => {
      if (authService.shouldRefreshToken()) {
        try {
          const newTokenData = await authService.refreshAccessToken();
          if (newTokenData) {
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { 
                user: newTokenData.user, 
                token: newTokenData.token, 
                token_type: newTokenData.token_type, 
                expires_in: newTokenData.expires_in 
              } 
            });
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // If refresh fails, logout
          logout();
        }
      }
    };
    
    // Check immediately and then setup interval
    checkTokenExpiration();
    
    const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [state.isAuthenticated]);

  const login = async (username: string, password: string, remember_me = false) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await authService.login(username, password, remember_me);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: response.user, 
          token: response.token, 
          token_type: response.token_type, 
          expires_in: response.expires_in 
        } 
      });
      
      // Fetch detailed user profile after login
      await fetchUserProfile();
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error; // Re-throw to allow handling in the UI
    }
  };

  const fetchUserProfile = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    dispatch({ type: 'FETCH_PROFILE_REQUEST' });
    try {
      const userProfile = await getUserProfile();
      dispatch({ type: 'FETCH_PROFILE_SUCCESS', payload: userProfile });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_PROFILE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to fetch user profile' 
      });
      console.error('Error fetching user profile:', error);
    }
  }, [state.isAuthenticated]);

  const logout = useCallback(async () => {
    try {
      console.log('Starting logout process in AuthContext');
      dispatch({ type: 'LOGOUT' });
      await authService.logout();
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error in AuthContext:', error);
      // Even if there's an error, we still want to clear the local state
      dispatch({ type: 'LOGOUT' });
      // Re-throw to allow handling in the UI
      throw error;
    }
  }, []);

  const checkPermission = (permission: string) => {
    // First check detailed profile permissions, then fallback to basic user permissions
    const permissions = state.userProfile?.permissions || state.user?.permissions;
    
    if (!permissions) {
      return false;
    }
    return hasPermission(permission, permissions);
  };

  const checkAnyPermission = (permissions: string[]) => {
    const userPermissions = state.userProfile?.permissions || state.user?.permissions;
    
    if (!userPermissions) {
      return false;
    }
    return hasAnyPermission(permissions, userPermissions);
  };

  const checkAllPermission = (permissions: string[]) => {
    const userPermissions = state.userProfile?.permissions || state.user?.permissions;
    
    if (!userPermissions) {
      return false;
    }
    return hasAllPermissions(permissions, userPermissions);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        state, 
        login, 
        logout, 
        fetchUserProfile,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermission: checkAllPermission
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