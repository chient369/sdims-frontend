import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';
// Lazy loaded components
const OpportunityList = lazy(() => import('./components/OpportunityList'));

/**
 * Define opportunity routes for the application
 */
export const OpportunityRoutes = [
  {
    path: "opportunities",
    element: (
        <PrivateRoute>
            <OpportunityList />
        </PrivateRoute>
    )
  }
];
