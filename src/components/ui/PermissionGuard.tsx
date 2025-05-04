import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface PermissionGuardProps {
  /**
   * Required permission to render the children
   */
  requiredPermission: string | string[];
  
  /**
   * Require all permissions to render the children
   */
  requireAll?: boolean;
  
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
 * Component that conditionally renders children based on user permissions
 * @param {PermissionGuardProps} props - Component props
 * @returns {React.ReactNode} The rendered children if user has permission, otherwise fallback
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  requireAll = true,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasPermissions, hasAnyPermission } = useAuth();
  
  // Check for single permission
  if (typeof requiredPermission === 'string') {
    if (!hasPermission(requiredPermission)) {
      return <>{fallback}</>;
    }
  } 
  // Check for multiple permissions
  else if (Array.isArray(requiredPermission)) {
    if (requiredPermission.length === 0) {
      return <>{children}</>;
    }
    
    // Check if all permissions are required
    if (requireAll) {
      if (!hasPermissions(requiredPermission)) {
        return <>{fallback}</>;
      }
    } 
    // Check if any permission is sufficient
    else {
      if (!hasAnyPermission(requiredPermission)) {
        return <>{fallback}</>;
      }
    }
  }
  
  return <>{children}</>;
};

export default PermissionGuard; 