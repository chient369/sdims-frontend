import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface AuthGuardProps {
  permissions?: string[];
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  all?: boolean;
}

/**
 * AuthGuard component that conditionally renders children based on permissions and roles
 * @param {AuthGuardProps} props - Component props
 * @returns {React.ReactNode} The children if user has permission, otherwise fallback
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  permissions = [],
  roles = [],
  children,
  fallback = null,
  all = true,
}) => {
  const { state, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  const { user } = state;

  let hasPermissionsAccess = true;
  if (permissions.length > 0) {
    hasPermissionsAccess = all 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  let hasRolesAccess = true;
  if (roles.length > 0 && user?.role) {
    hasRolesAccess = roles.includes(user.role);
  }

  const hasAccess = hasPermissionsAccess && hasRolesAccess;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}; 