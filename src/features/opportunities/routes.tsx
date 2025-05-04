// import { lazy } from 'react';
// import { Route, Navigate } from 'react-router-dom';
// import { PrivateRoute } from '../auth/routes';

// // Lazy loaded components
// const OpportunityList = lazy(() => import('./components/OpportunityList'));
// const OpportunityDetail = lazy(() => import('./components/OpportunityDetail'));
// const NotesActivities = lazy(() => import('./components/NotesActivities'));
// const HubspotSync = lazy(() => import('./components/HubspotSync'));

// // Define opportunity routes
// export const OpportunityRoutes = [
//   {
//     path: "/opportunities",
//     element: <Navigate to="/opportunities/list" replace />
//   },
//   {
//     path: "/opportunities/list",
//     element: (
//       <PrivateRoute requiredPermissions={['view_opportunities']}>
//         <OpportunityList />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/opportunities/:id",
//     element: (
//       <PrivateRoute requiredPermissions={['view_opportunities']}>
//         <OpportunityDetail />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/opportunities/:id/activities",
//     element: (
//       <PrivateRoute requiredPermissions={['view_opportunities']}>
//         <NotesActivities />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/opportunities/sync",
//     element: (
//       <PrivateRoute requiredPermissions={['manage_hubspot_sync']}>
//         <HubspotSync />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/opportunities/*",
//     element: <Navigate to="/opportunities/list" replace />
//   }
// ]; 
export const OpportunityRoutes = [];