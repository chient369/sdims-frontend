import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Lazy loaded components
const OpportunityList = lazy(() => import('./components/OpportunityList'));
const OpportunityDetail = lazy(() => import('./components/OpportunityDetail'));

/**
 * Protected route wrapper component 
 */
const OpportunityProtectedRoute = () => {
  const { state } = useAuth();
  const { isAuthenticated, isLoading } = state;
  
  // If not authenticated, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Otherwise, render the children routes
  return <Outlet />;
};

/**
 * Define opportunity routes for the application
 */
export const OpportunityRoutes = [
  {
    element: <OpportunityProtectedRoute />,
    children: [
      {
        path: "/opportunities",
        element: <OpportunityList />
      },
      {
        path: "/opportunities/:id",
        element: <OpportunityDetail />
      }
    ]
  }
];
