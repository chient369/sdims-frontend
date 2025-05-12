import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import Login from './Login';
import LogoutPage from './pages/LogoutPage';
// Trong trường hợp người dùng chưa có sẵn các component này, tôi sẽ tạm bỏ qua các route cụ thể

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
  const { isAuthenticated, isLoading } = state;
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  
  // If still loading auth state, show spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }
  
  // If route is restricted and user is logged in, redirect to dashboard/previous location
  if (restricted && isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  // Render the public component
  return <>{children}</>;
};

// PrivateRoute component
interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAll?: boolean;
}

/**
 * PrivateRoute component that protects routes based on authentication and permissions/roles
 * @param {PrivateRouteProps} props - Component props
 * @returns {React.ReactNode} The protected component or redirect
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false
}) => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading, user, userProfile } = state;
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Get permissions from full profile if available, otherwise from basic user info
  const permissions = userProfile?.permissions || user?.permissions || [];
  
  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    let hasAccess = false;
    
    if (requireAll) {
      // Phải có tất cả quyền trong danh sách
      hasAccess = requiredPermissions.every(permission => 
        permissions.includes(permission)
      );
    } else {
      // Chỉ cần có bất kỳ quyền nào trong danh sách
      hasAccess = requiredPermissions.some(permission => 
        permissions.includes(permission)
      );
    }
    
    if (!hasAccess) {
      console.log('Permission denied. Required:', requiredPermissions, 'User has:', permissions, 'Require all:', requireAll);
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

// Define the route configurations
export const AuthRoutes = [
  {
    path: '/login',
    element: <PublicRoute restricted={true}><Login /></PublicRoute>
  },
  {
    path: '/logout',
    element: <LogoutPage />
  },
  // Other auth routes can be added here as they are implemented
  // {
  //   path: '/register',
  //   element: <Register />
  // },
  // {
  //   path: '/forgot-password',
  //   element: <ForgotPassword />
  // }
]; 