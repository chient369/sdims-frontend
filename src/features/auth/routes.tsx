import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
// Trong trường hợp người dùng chưa có sẵn các component này, tôi sẽ tạm bỏ qua các route cụ thể

// Define the route configurations
export const AuthRoutes = [
  // Các route sẽ được bổ sung sau khi component được tạo
  // {
  //   path: '/login',
  //   element: <Login />
  // },
  // {
  //   path: '/register',
  //   element: <Register />
  // },
  // {
  //   path: '/forgot-password',
  //   element: <ForgotPassword />
  // }
];

// PrivateRoute component
interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

/**
 * PrivateRoute component that protects routes based on authentication and permissions/roles
 * @param {PrivateRouteProps} props - Component props
 * @returns {React.ReactNode} The protected component or redirect
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredPermissions = [],
  requiredRoles = []
}) => {
  const { state, hasPermission, hasAllPermissions } = useAuth();
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
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = hasAllPermissions(requiredPermissions);
    
    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Check roles if required
  if (requiredRoles.length > 0 && user?.role) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Render the protected component
  return <>{children}</>;
};

// PublicRoute component
interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

/**
 * PublicRoute component that redirects authenticated users if the route is restricted
 * @param {PublicRouteProps} props - Component props
 * @returns {React.ReactNode} The public component or redirect
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  restricted = true 
}) => {
  const { state } = useAuth();
  const { isAuthenticated } = state;
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  // If route is restricted and user is logged in, redirect to dashboard/previous location
  if (restricted && isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  // Render the public component
  return <>{children}</>;
}; 