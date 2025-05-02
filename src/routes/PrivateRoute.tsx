import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  component: React.ComponentType;
  requiredPermissions?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  component: Component, 
  requiredPermissions = [] 
}) => {
  const { state, hasPermission } = useAuth();
  const { isAuthenticated } = state;
  const location = useLocation();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has required permissions
  if (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission))) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render the protected component
  return <Component />;
};

export default PrivateRoute; 