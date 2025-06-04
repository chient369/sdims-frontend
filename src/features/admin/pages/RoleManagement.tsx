import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Role Management component for listing and managing roles
 * @returns {JSX.Element} The rendered component
 */
const RoleManagement: React.FC = () => {
  // Mock data for demonstration
  const roles = [
    { id: 1, name: 'Administrator', description: 'Full system access', permissions: 25 },
    { id: 2, name: 'Manager', description: 'Management level access', permissions: 15 },
    { id: 3, name: 'User', description: 'Standard user access', permissions: 8 },
    { id: 4, name: 'Guest', description: 'Limited viewing access', permissions: 3 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Link 
          to="/admin/roles/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add New Role
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map(role => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap">{role.id}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{role.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{role.permissions}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    to={`/admin/roles/${role.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/admin/roles/${role.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement; 