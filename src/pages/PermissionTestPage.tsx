import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { PermissionGuard, ResourceGuard } from '../components/ui';

/**
 * Page to test permission and resource guards
 * @returns {JSX.Element} The rendered test page
 */
const PermissionTestPage: React.FC = () => {
  const { user } = useAuth();
  
  // Mock resource data
  const employeeData = {
    id: '2', // Different from logged-in user
    name: 'John Doe',
    teamId: '5',
    ownerId: '2'
  };
  
  const ownedEmployeeData = {
    id: '1', // Same as logged-in user
    name: 'Test User',
    teamId: '5',
    ownerId: '1'
  };
  
  const teamEmployeeData = {
    id: '3',
    name: 'Team Member',
    teamId: 1, // Same team as logged-in user
    ownerId: '3'
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Permission System Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-w-screen-lg">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Permission Guards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Should Show (employee:read permission)</h3>
            <PermissionGuard requiredPermission="employee:read">
              <div className="bg-green-100 p-3 rounded">
                ✅ You have permission to read employees
              </div>
            </PermissionGuard>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Should Hide (invalid:permission)</h3>
            <PermissionGuard 
              requiredPermission="invalid:permission"
              fallback={<div className="bg-red-100 p-3 rounded">❌ Permission denied</div>}
            >
              <div className="bg-green-100 p-3 rounded">
                ✅ You have an invalid permission
              </div>
            </PermissionGuard>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Multiple Permissions (ANY)</h3>
            <PermissionGuard 
              requiredPermission={['employee:read', 'invalid:permission']}
              requireAll={false}
            >
              <div className="bg-green-100 p-3 rounded">
                ✅ You have at least one of these permissions
              </div>
            </PermissionGuard>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Multiple Permissions (ALL)</h3>
            <PermissionGuard 
              requiredPermission={['employee:read', 'invalid:permission']}
              requireAll={true}
              fallback={<div className="bg-red-100 p-3 rounded">❌ You need all permissions</div>}
            >
              <div className="bg-green-100 p-3 rounded">
                ✅ You have all required permissions
              </div>
            </PermissionGuard>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Resource Guards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Other User's Resource</h3>
            <div className="text-sm text-gray-500 mb-2">Resource ID: {employeeData.id} / Team: {employeeData.teamId}</div>
            
            <ResourceGuard 
              requiredPermission="employee:update:all"
              resourceOwnerId={employeeData.ownerId}
              resourceTeamId={employeeData.teamId}
              fallback={<div className="bg-red-100 p-3 rounded">❌ Cannot update other user's data</div>}
            >
              <div className="bg-green-100 p-3 rounded">
                ✅ You can update any employee
              </div>
            </ResourceGuard>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Your Own Resource</h3>
            <div className="text-sm text-gray-500 mb-2">Resource ID: {ownedEmployeeData.id} / Team: {ownedEmployeeData.teamId}</div>
            
            <ResourceGuard 
              requiredPermission="employee:update:own"
              resourceOwnerId={ownedEmployeeData.ownerId}
              resourceTeamId={ownedEmployeeData.teamId}
            >
              <div className="bg-green-100 p-3 rounded">
                ✅ You can update your own data
              </div>
            </ResourceGuard>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Team Member's Resource</h3>
            <div className="text-sm text-gray-500 mb-2">Resource ID: {teamEmployeeData.id} / Team: {teamEmployeeData.teamId}</div>
            
            <ResourceGuard 
              requiredPermission="employee:update:team"
              resourceOwnerId={teamEmployeeData.ownerId}
              resourceTeamId={teamEmployeeData.teamId.toString()}
              fallback={<div className="bg-red-100 p-3 rounded">❌ Cannot update team member's data</div>}
            >
              <div className="bg-green-100 p-3 rounded">
                ✅ You can update team member's data
              </div>
            </ResourceGuard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionTestPage; 