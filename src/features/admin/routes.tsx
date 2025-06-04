import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { PrivateRoute } from '../auth/routes';

// Lazy loaded components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const UserDetails = lazy(() => import('./pages/UserDetails'));
const UserForm = lazy(() => import('./pages/UserForm'));
const RoleManagement = lazy(() => import('./pages/RoleManagement'));
const RoleDetails = lazy(() => import('./pages/RoleDetails'));
const RoleForm = lazy(() => import('./pages/RoleForm'));
const SystemConfig = lazy(() => import('./pages/SystemConfig'));
const SystemLogs = lazy(() => import('./pages/SystemLogs'));

// Define the admin routes
export const AdminRoutes = [
  {
    element: <PrivateRoute requiredPermissions={['admin.access']} />,
    children: [
      {
        path: "/admin",
        element: <AdminDashboard />
      },
      // User Management
      {
        path: "/admin/users",
        element: <UserManagement />
      },
      {
        path: "/admin/users/new",
        element: <UserForm />
      },
      {
        path: "/admin/users/:id",
        element: <UserDetails />
      },
      {
        path: "/admin/users/:id/edit",
        element: <UserForm />
      },
      // Role Management
      {
        path: "/admin/roles",
        element: <RoleManagement />
      },
      {
        path: "/admin/roles/new",
        element: <RoleForm />
      },
      {
        path: "/admin/roles/:id",
        element: <RoleDetails />
      },
      {
        path: "/admin/roles/:id/edit",
        element: <RoleForm />
      },
      // System Configuration
      {
        path: "/admin/config",
        element: <SystemConfig />
      },
      // System Logs
      {
        path: "/admin/logs",
        element: <SystemLogs />
      }
    ]
  }
]; 