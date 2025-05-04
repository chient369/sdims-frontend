import { lazy } from 'react';
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
    path: "/admin",
    element: (
      <PrivateRoute requiredPermissions={['admin.access']}>
        <AdminDashboard />
      </PrivateRoute>
    )
  },
  // User Management
  {
    path: "/admin/users",
    element: (
      <PrivateRoute requiredPermissions={['admin.users.view']}>
        <UserManagement />
      </PrivateRoute>
    )
  },
  {
    path: "/admin/users/new",
    element: (
      <PrivateRoute requiredPermissions={['admin.users.create']}>
        <UserForm />
      </PrivateRoute>
    )
  },
  {
    path: "/admin/users/:id",
    element: (
      <PrivateRoute requiredPermissions={['admin.users.view']}>
        <UserDetails />
      </PrivateRoute>
    )
  },
  {
    path: "/admin/users/:id/edit",
    element: (
      <PrivateRoute requiredPermissions={['admin.users.update']}>
        <UserForm />
      </PrivateRoute>
    )
  },
  // Role Management
  {
    path: "/admin/roles",
    element: (
      <PrivateRoute requiredPermissions={['admin.roles.view']}>
        <RoleManagement />
      </PrivateRoute>
    )
  },
  {
    path: "/admin/roles/new",
    element: (
      <PrivateRoute requiredPermissions={['admin.roles.create']}>
        <RoleForm />
      </PrivateRoute>
    )
  },
  {
    path: "/admin/roles/:id",
    element: (
      <PrivateRoute requiredPermissions={['admin.roles.view']}>
        <RoleDetails />
      </PrivateRoute>
    )
  },
  {
    path: "/admin/roles/:id/edit",
    element: (
      <PrivateRoute requiredPermissions={['admin.roles.update']}>
        <RoleForm />
      </PrivateRoute>
    )
  },
  // System Configuration
  {
    path: "/admin/config",
    element: (
      <PrivateRoute requiredPermissions={['admin.config.view']}>
        <SystemConfig />
      </PrivateRoute>
    )
  },
  // System Logs
  {
    path: "/admin/logs",
    element: (
      <PrivateRoute requiredPermissions={['admin.logs.view']}>
        <SystemLogs />
      </PrivateRoute>
    )
  }
]; 