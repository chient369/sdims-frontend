import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store';

interface PermissionRouteProps {
  /**
   * Component to render if user has permission
   */
  component: React.ComponentType<any>;
  
  /**
   * Required permission to access the route
   */
  permission?: string;
  
  /**
   * Array of permissions where any match allows access
   */
  anyPermissions?: string[];
  
  /**
   * Array of permissions where all must match to allow access
   */
  allPermissions?: string[];
  
  /**
   * Route to redirect to if permission is denied (defaults to /unauthorized)
   */
  redirectTo?: string;
}

/**
 * PermissionRoute - Protects routes based on user permissions
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({
  component: Component,
  permission,
  anyPermissions,
  allPermissions,
  redirectTo = '/unauthorized',
  ...rest
}) => {
  const { isAuthenticated, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
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
  
  // If user doesn't have required permissions, redirect
  if (!hasAccess) {
    return <Navigate to={redirectTo} />;
  }
  
  // User has permission, render the component
  return <Component {...rest} />;
};

export default PermissionRoute; 