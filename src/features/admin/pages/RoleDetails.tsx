import React from 'react';
import { useParams, Link } from 'react-router-dom';

/**
 * Role Details component for viewing role information and permissions
 * @returns {JSX.Element} The rendered component
 */
const RoleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock role data for demonstration
  const role = {
    id: Number(id),
    name: 'Administrator',
    description: 'Full system access with all permissions',
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-05-10 14:30:00'
  };
  
  // Mock permissions data
  const permissionCategories = [
    {
      name: 'User Management',
      permissions: [
        { id: 1, name: 'admin.users.view', description: 'View users', enabled: true },
        { id: 2, name: 'admin.users.create', description: 'Create users', enabled: true },
        { id: 3, name: 'admin.users.edit', description: 'Edit users', enabled: true },
        { id: 4, name: 'admin.users.delete', description: 'Delete users', enabled: true },
      ]
    },
    {
      name: 'Role Management',
      permissions: [
        { id: 5, name: 'admin.roles.view', description: 'View roles', enabled: true },
        { id: 6, name: 'admin.roles.create', description: 'Create roles', enabled: true },
        { id: 7, name: 'admin.roles.edit', description: 'Edit roles', enabled: true },
        { id: 8, name: 'admin.roles.delete', description: 'Delete roles', enabled: true },
      ]
    },
    {
      name: 'System Configuration',
      permissions: [
        { id: 9, name: 'admin.config.view', description: 'View system config', enabled: true },
        { id: 10, name: 'admin.config.edit', description: 'Edit system config', enabled: true },
      ]
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Details</h1>
        <div className="space-x-4">
          <Link 
            to={`/admin/roles/${id}/edit`} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Edit Role
          </Link>
          <Link 
            to="/admin/roles" 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {role.name}</p>
                <p><span className="font-medium">Description:</span> {role.description}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">System Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Created At:</span> {role.createdAt}</p>
                <p><span className="font-medium">Updated At:</span> {role.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Permissions</h2>
      {permissionCategories.map((category, index) => (
        <div key={index} className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium">{category.name}</h3>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-100">
              {category.permissions.map(permission => (
                <li key={permission.id} className="py-2">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${permission.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium">{permission.name}</p>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoleDetails; 