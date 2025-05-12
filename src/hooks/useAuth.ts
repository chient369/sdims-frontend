import { useState, useEffect, useCallback } from 'react';
import { User } from '../features/auth/types';
import * as permissionUtils from '../utils/permissions';
import { authService } from '../features/auth/service';

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
        // Sử dụng authService để kiểm tra xác thực
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        
        setState({
          isAuthenticated,
          user,
          loading: false,
        });

        // Log thông tin để debug
        console.log('Auth state loaded:', { isAuthenticated, user });
      } catch (error) {
        console.error('Auth check error:', error);
        setState({ isAuthenticated: false, user: null, loading: false });
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, remember = false) => {
    try {
      // Sử dụng authService để đăng nhập
      const response = await authService.login(email, password, remember);
      
      setState({
        isAuthenticated: true,
        user: response.user,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
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
    // Expose permissions directly
    permissions: state.user?.permissions || []
  };
};

export default useAuth; 