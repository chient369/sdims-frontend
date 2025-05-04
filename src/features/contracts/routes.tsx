// import { lazy } from 'react';
// import { Navigate } from 'react-router-dom';
// import { PrivateRoute } from '../auth/routes';

// // Lazy loaded components
// const ContractList = lazy(() => import('./pages/ContractList'));
// const ContractDetail = lazy(() => import('./pages/ContractDetail'));
// const ContractForm = lazy(() => import('./pages/ContractForm'));
// const PaymentStatus = lazy(() => import('./pages/PaymentStatus'));
// const RevenueKPI = lazy(() => import('./pages/RevenueKPI'));

// // Define contract routes
// export const ContractRoutes = [
//   {
//     path: "/contracts",
//     element: <Navigate to="/contracts/list" replace />
//   },
//   {
//     path: "/contracts/list",
//     element: (
//       <PrivateRoute requiredPermissions={['view_contracts']}>
//         <ContractList />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/contracts/:id",
//     element: (
//       <PrivateRoute requiredPermissions={['view_contracts']}>
//         <ContractDetail />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/contracts/new",
//     element: (
//       <PrivateRoute requiredPermissions={['manage_contracts']}>
//         <ContractForm />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/contracts/:id/edit",
//     element: (
//       <PrivateRoute requiredPermissions={['manage_contracts']}>
//         <ContractForm />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/contracts/payments",
//     element: (
//       <PrivateRoute requiredPermissions={['manage_payments']}>
//         <PaymentStatus />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/contracts/kpi",
//     element: (
//       <PrivateRoute requiredPermissions={['view_revenue_kpi']}>
//         <RevenueKPI />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/contracts/*",
//     element: <Navigate to="/contracts/list" replace />
//   }
// ]; 

import React from 'react';

// Temporary empty export to fix the import error
// To be replaced with actual routes when contracts feature is fully implemented
export const ContractRoutes = []; 