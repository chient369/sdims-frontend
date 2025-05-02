import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  component: React.ComponentType;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  component: Component, 
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
  return <Component />;
};

export default PublicRoute; 