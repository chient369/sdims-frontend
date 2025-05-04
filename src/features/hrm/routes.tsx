// import { lazy } from 'react';
// import { PrivateRoute } from '../auth/routes';

// // Lazy loaded components
// const EmployeeList = lazy(() => import('./pages/EmployeeList'));
// const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));
// const EmployeeForm = lazy(() => import('./pages/EmployeeForm'));
// const TeamList = lazy(() => import('./pages/TeamList'));
// const TeamDetails = lazy(() => import('./pages/TeamDetails'));
// const TeamForm = lazy(() => import('./pages/TeamForm'));
// const SkillMatrix = lazy(() => import('./pages/SkillMatrix'));
// const SkillCategoryList = lazy(() => import('./pages/SkillCategoryList'));

// // Define the HRM routes
// export const HRMRoutes = [
//   {
//     path: "/hrm/employees",
//     element: (
//       <PrivateRoute>
//         <EmployeeList />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/employees/new",
//     element: (
//       <PrivateRoute>
//         <EmployeeForm />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/employees/:id",
//     element: (
//       <PrivateRoute>
//         <EmployeeDetails />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/employees/:id/edit",
//     element: (
//       <PrivateRoute>
//         <EmployeeForm />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/teams",
//     element: (
//       <PrivateRoute>
//         <TeamList />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/teams/new",
//     element: (
//       <PrivateRoute>
//         <TeamForm />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/teams/:id",
//     element: (
//       <PrivateRoute>
//         <TeamDetails />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/teams/:id/edit",
//     element: (
//       <PrivateRoute>
//         <TeamForm />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/skills",
//     element: (
//       <PrivateRoute>
//         <SkillMatrix />
//       </PrivateRoute>
//     )
//   },
//   {
//     path: "/hrm/skill-categories",
//     element: (
//       <PrivateRoute>
//         <SkillCategoryList />
//       </PrivateRoute>
//     )
//   }
// ]; 
export const HRMRoutes = [];