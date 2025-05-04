# Authorization Components

This module provides components and utilities for implementing authorization and permission-based UI control in the SDIMS application.

## Components Overview

### PrivateRoute

Protects routes that require authentication and optionally specific permissions or roles.

```tsx
import { PrivateRoute } from '../features/auth/routes';

// Basic auth protection
<Route 
  path="/dashboard" 
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  } 
/>

// With permission requirement
<Route 
  path="/employees" 
  element={
    <PrivateRoute requiredPermissions={['employee:read:all']}>
      <EmployeeList />
    </PrivateRoute>
  } 
/>

// With role requirement
<Route 
  path="/admin/settings" 
  element={
    <PrivateRoute requiredRoles={['admin', 'Division Manager']}>
      <SystemSettings />
    </PrivateRoute>
  } 
/>
```

### AuthGuard

Conditionally renders UI components based on permissions or roles.

```tsx
import { AuthGuard } from '../../components/auth';

// With permission check
<AuthGuard permissions={['contract:create']}>
  <button onClick={handleCreateContract}>Create Contract</button>
</AuthGuard>

// With fallback content
<AuthGuard 
  permissions={['margin:read:all']} 
  fallback={<p>You don't have permission to view margin data.</p>}
>
  <MarginDataTable />
</AuthGuard>

// With role check
<AuthGuard roles={['admin']}>
  <AdminPanel />
</AuthGuard>

// With any permission check (user needs only one of the permissions)
<AuthGuard 
  permissions={['employee:update:all', 'employee:update:team']} 
  all={false}
>
  <EditEmployeeForm />
</AuthGuard>
```

### PermissionButton

Button component that automatically disables itself when the user lacks required permissions.

```tsx
import { PermissionButton } from '../../components/auth';

// Simple permission-based button
<PermissionButton 
  permissions={['opportunity:create']}
  onClick={handleCreateOpportunity}
>
  New Opportunity
</PermissionButton>

// Hide completely when unauthorized
<PermissionButton 
  permissions={['contract:delete']}
  variant="danger"
  hideWhenUnauthorized
  onClick={handleDeleteContract}
>
  Delete Contract
</PermissionButton>

// With role requirement
<PermissionButton 
  roles={['Division Manager', 'admin']}
  all={false} // User needs to have at least one of these roles
  onClick={handleExportReport}
>
  Export Report
</PermissionButton>
```

### UnauthorizedPage

Page displayed when a user tries to access a resource without proper permissions.

```tsx
import { UnauthorizedPage } from '../../components/auth';

// Default unauthorized page
<Route path="/unauthorized" element={<UnauthorizedPage />} />

// Custom message
<Route 
  path="/unauthorized" 
  element={
    <UnauthorizedPage 
      title="Access Restricted" 
      message="You don't have permission to access this resource."
    />
  } 
/>
```

## Hooks and HOCs

### usePermissions

Hook for checking user permissions and roles.

```tsx
import { usePermissions } from '../../hooks/usePermissions';

function MyComponent() {
  const { can, canAny, canAll, is, isAny, role, permissions } = usePermissions();
  
  // Check single permission
  const canCreateUser = can('user:create');
  
  // Check any permission
  const canModifyEmployee = canAny(['employee:update:all', 'employee:update:team']);
  
  // Check all permissions
  const canManageUsers = canAll(['user:create', 'user:update', 'user:delete']);
  
  // Check role
  const isAdmin = is('admin');
  
  return (
    <div>
      {canCreateUser && <button>Create User</button>}
      
      {canModifyEmployee && <button>Edit Employee</button>}
      
      {isAdmin && <AdminPanel />}
      
      <div>Your role: {role}</div>
      <div>Your permissions: {permissions.join(', ')}</div>
    </div>
  );
}
```

### withPermissions HOC

Higher Order Component for permission-based rendering.

```tsx
import { withPermissions } from '../../components/auth';

// Create a protected component
const ProtectedDataGrid = withPermissions({
  permissions: ['data:read:all'],
  fallback: <p>You don't have permission to view this data.</p>
})(DataGrid);

// With role requirement
const AdminOnlyComponent = withPermissions({
  roles: ['admin'],
  fallback: <UnauthorizedMessage />
})(AdminComponent);

// Then use it in your component
function MyPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ProtectedDataGrid data={someData} />
    </div>
  );
}
```

## Permission Format

The SDIMS application uses permissions in the format `resource:action[:scope]`:

- `resource`: The entity being accessed (e.g., `employee`, `contract`, `opportunity`)
- `action`: The operation being performed (e.g., `read`, `create`, `update`, `delete`)
- `scope` (optional): The scope of the operation (e.g., `all`, `team`, `own`)

Examples:
- `employee:read:all` - Permission to view all employees
- `contract:update:own` - Permission to update contracts created by the user
- `margin:read:team` - Permission to view margin data for the user's team

For more details on available permissions, refer to the permissions definition documentation. 