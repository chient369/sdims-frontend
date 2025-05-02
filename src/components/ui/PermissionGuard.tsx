import React from 'react';
import { useAuth } from '../../store';

interface PermissionGuardProps {
  /**
   * Required permission to render the children
   */
  permission?: string;
  
  /**
   * Array of permissions where any match will render the children
   */
  anyPermissions?: string[];
  
  /**
   * Array of permissions where all must match to render the children
   */
  allPermissions?: string[];
  
  /**
   * Content to render when permission is granted
   */
  children: React.ReactNode;
  
  /**
   * Optional content to render when permission is denied
   */
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard component - Conditionally renders children based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  
  // Check permissions
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermissions && anyPermissions.length > 0) {
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions);
  } else {
    // If no permission checks are specified, allow access
    hasAccess = true;
  }
  
  // Render children or fallback based on permission check
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard; 