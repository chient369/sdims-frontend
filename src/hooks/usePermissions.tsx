import { useAuth } from '../context/AuthContext';

/**
 * Hook for checking user permissions and roles
 * @returns Object with permission checking functions and user data
 */
export function usePermissions() {
  const { state, hasPermission, hasAnyPermission, hasAllPermission } = useAuth();
  const { user } = state;

  // Single permission check
  const can = (permission: string): boolean => {
    return hasPermission(permission);
  };

  // Check if user has any of the given permissions
  const canAny = (requiredPermissions: string[]): boolean => {
    return hasAnyPermission(requiredPermissions);
  };

  // Check if user has all of the given permissions
  const canAll = (requiredPermissions: string[]): boolean => {
    return hasAllPermission(requiredPermissions);
  };

  // Check if user has a specific role
  const is = (role: string): boolean => {
    if (!user?.role) return false;
    
    if (Array.isArray(user.role)) {
      return user.role.some(r => typeof r === 'string' && r === role);
    }
    
    return user.role === role;
  };

  // Check if user has any of the given roles
  const isAny = (requiredRoles: string[]): boolean => {
    if (!user?.role) return false;
    
    if (Array.isArray(user.role)) {
      return user.role.some(r => 
        typeof r === 'string' && requiredRoles.includes(r)
      );
    }
    
    return requiredRoles.includes(user.role);
  };

  // Check if user has a set of roles (not usually applicable in most RBAC systems)
  const isAllRoles = (requiredRoles: string[]): boolean => {
    if (!user?.role) return false;
    
    if (Array.isArray(user.role)) {
      return requiredRoles.every(role => 
        user.role.includes(role)
      );
    }
    
    // In most systems, a user has only one role, so this is primarily for compatibility
    return requiredRoles.every(role => user.role === role);
  };

  return {
    can,
    canAny,
    canAll,
    is,
    isAny,
    isAllRoles,
    permissions: user?.permissions || [],
    role: user?.role,
    user,
  };
} 