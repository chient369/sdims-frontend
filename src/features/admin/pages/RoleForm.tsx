import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

/**
 * Role Form component for creating and editing roles
 * @returns {JSX.Element} The rendered component
 */
const RoleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  // Permissions state
  const [permissionCategories, setPermissionCategories] = useState([
    {
      name: 'User Management',
      permissions: [
        { id: 1, name: 'admin.users.view', description: 'View users', enabled: false },
        { id: 2, name: 'admin.users.create', description: 'Create users', enabled: false },
        { id: 3, name: 'admin.users.edit', description: 'Edit users', enabled: false },
        { id: 4, name: 'admin.users.delete', description: 'Delete users', enabled: false },
      ]
    },
    {
      name: 'Role Management',
      permissions: [
        { id: 5, name: 'admin.roles.view', description: 'View roles', enabled: false },
        { id: 6, name: 'admin.roles.create', description: 'Create roles', enabled: false },
        { id: 7, name: 'admin.roles.edit', description: 'Edit roles', enabled: false },
        { id: 8, name: 'admin.roles.delete', description: 'Delete roles', enabled: false },
      ]
    },
    {
      name: 'System Configuration',
      permissions: [
        { id: 9, name: 'admin.config.view', description: 'View system config', enabled: false },
        { id: 10, name: 'admin.config.edit', description: 'Edit system config', enabled: false },
      ]
    },
  ]);
  
  // Load role data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // Mock data loading for demonstration
      // In a real app, this would be an API call
      const mockRole = {
        name: 'Administrator',
        description: 'Full system access with all permissions',
      };
      
      setFormData(mockRole);
      
      // Set all permissions to enabled for the mock Administrator role
      setPermissionCategories(prevCategories => 
        prevCategories.map(category => ({
          ...category,
          permissions: category.permissions.map(permission => ({
            ...permission,
            enabled: true
          }))
        }))
      );
    }
  }, [isEditMode, id]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle permission toggle
  const togglePermission = (permissionId: number) => {
    setPermissionCategories(prevCategories => 
      prevCategories.map(category => ({
        ...category,
        permissions: category.permissions.map(permission => 
          permission.id === permissionId 
            ? { ...permission, enabled: !permission.enabled }
            : permission
        )
      }))
    );
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get all enabled permissions
    const enabledPermissions = permissionCategories
      .flatMap(category => category.permissions)
      .filter(permission => permission.enabled)
      .map(permission => permission.name);
    
    // In a real app, this would validate form and submit to API
    console.log('Form submitted:', {
      ...formData,
      permissions: enabledPermissions
    });
    
    // Redirect to role list after submission
    alert(`Role ${isEditMode ? 'updated' : 'created'} successfully!`);
    navigate('/admin/roles');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Role' : 'Create New Role'}</h1>
        <Link 
          to="/admin/roles" 
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Cancel
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <div className="mb-4">
              <label className="block mb-2 font-medium">Role Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Permissions</h2>
        
        {permissionCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium">{category.name}</h3>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-100">
                {category.permissions.map(permission => (
                  <li key={permission.id} className="py-3">
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permission.enabled}
                          onChange={() => togglePermission(permission.id)}
                          className="w-4 h-4 mr-3"
                        />
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        
        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            {isEditMode ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm; 