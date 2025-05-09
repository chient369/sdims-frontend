import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/Spinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAll?: boolean;
}

/**
 * PrivateRoute component that protects routes based on authentication and permissions
 * @param {PrivateRouteProps} props - Component props
 * @returns {React.ReactNode} The protected component or redirect
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = true,
}) => {
  const { state, hasPermission, hasAllPermission, hasAnyPermission } = useAuth();
  const { isAuthenticated, isLoading, user } = state;
  const location = useLocation();

  // If auth state is still loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Save the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    // Dựa vào requireAll để quyết định cách kiểm tra quyền
    const hasRequiredPermissions = requireAll 
      ? hasAllPermission(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check roles if required
  if (requiredRoles.length > 0 && user?.role) {
    let hasRequiredRole = false;
    
    if (Array.isArray(user.role)) {
      // Nếu user có nhiều role, kiểm tra xem có bất kỳ role nào phù hợp không
      hasRequiredRole = user.role.some(role => 
        typeof role === 'string' && requiredRoles.includes(role)
      );
    } else if (typeof user.role === 'string') {
      // Trường hợp role là một string
      hasRequiredRole = requiredRoles.includes(user.role);
    }
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render the protected component
  return <>{children}</>;
}; 