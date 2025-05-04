import { useState, useEffect, useCallback } from 'react';
import { User } from '../features/auth/types';
import * as permissionUtils from '../utils/permissions';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setState({ isAuthenticated: false, user: null, loading: false });
          return;
        }
        
        // Here you would typically verify the token with your API
        // For now, we'll simulate this by checking if the token exists
        setState({
          isAuthenticated: true,
          user: JSON.parse(localStorage.getItem('user') || 'null'),
          loading: false,
        });
      } catch (error) {
        console.error('Auth check error:', error);
        setState({ isAuthenticated: false, user: null, loading: false });
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      // Here you would call your API to login
      // This is a placeholder for demonstration
      const user: User = {
        id: '1',
        username: email.split('@')[0],
        email,
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: [
          'dashboard:read:all',
          'employee:read:all',
          'employee:update:all',
          'employee-skill:read:all',
          'margin:read:all',
          'opportunity:read:all',
          'opportunity:update:all',
          'contract:read:all',
          'report:read:all',
          'config:read'
        ],
      };
      
      const token = 'fake-jwt-token';
      
      // Store auth data in localStorage
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState({
        isAuthenticated: true,
        user,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback((requiredPermission: string): boolean => {
    if (!state.user || !state.user.permissions) {
      return false;
    }
    
    return permissionUtils.hasPermission(requiredPermission, state.user.permissions);
  }, [state.user]);
  
  // Check if user has all required permissions
  const hasPermissions = useCallback((requiredPermissions: string[]): boolean => {
    if (!state.user || !state.user.permissions) {
      return false;
    }
    
    return permissionUtils.hasAllPermissions(requiredPermissions, state.user.permissions);
  }, [state.user]);
  
  // Check if user has any of the required permissions
  const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
    if (!state.user || !state.user.permissions) {
      return false;
    }
    
    return permissionUtils.hasAnyPermission(requiredPermissions, state.user.permissions);
  }, [state.user]);
  
  // Determine the permission scope based on resource ownership
  const getAccessScope = useCallback((resourceOwnerId?: string, resourceTeamId?: string): 'all' | 'team' | 'own' | 'none' => {
    return permissionUtils.getAccessScope(state.user, resourceOwnerId, resourceTeamId);
  }, [state.user]);

  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    login,
    logout,
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    getAccessScope,
  };
};

export default useAuth; 