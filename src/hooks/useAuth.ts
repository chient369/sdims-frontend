import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/api';

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
      const user = {
        id: '1',
        email,
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        permissions: ['view_dashboard', 'manage_users'],
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

  // Check permissions
  const hasPermissions = useCallback((requiredPermissions: string[]) => {
    if (!state.user || !state.user.permissions) return false;
    
    return requiredPermissions.every(permission => 
      state.user?.permissions.includes(permission)
    );
  }, [state.user]);

  return {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    login,
    logout,
    hasPermissions,
  };
};

export default useAuth; 