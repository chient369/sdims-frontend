import { lazy } from 'react';
import { PrivateRoute } from '../auth/routes';
// Lazy loaded components
const OpportunityList = lazy(() => import('./components/OpportunityList'));
const OpportunityDetail = lazy(() => import('./components/OpportunityDetail'));

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
  },
  {
    path: "opportunities/:id",
    element: (
        <PrivateRoute>
            <OpportunityDetail />
        </PrivateRoute>
    )
  }
];
