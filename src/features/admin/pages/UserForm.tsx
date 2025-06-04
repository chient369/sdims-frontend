import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

/**
 * User Form component for creating and editing users
 * @returns {JSX.Element} The rendered component
 */
const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'User',
    status: 'Active',
    password: '',
    confirmPassword: ''
  });
  
  // Mock roles for select dropdown
  const roles = ['Administrator', 'Manager', 'User'];
  const statuses = ['Active', 'Inactive', 'Suspended'];
  
  // Load user data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // Mock data loading for demonstration
      // In a real app, this would be an API call
      const mockUser = {
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'Administrator',
        status: 'Active'
      };
      
      setFormData(prevData => ({
        ...prevData,
        ...mockUser,
        password: '',
        confirmPassword: ''
      }));
    }
  }, [isEditMode, id]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would validate form and submit to API
    console.log('Form submitted:', formData);
    
    // Redirect to user list after submission
    alert(`User ${isEditMode ? 'updated' : 'created'} successfully!`);
    navigate('/admin/users');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
        <Link 
          to="/admin/users" 
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Cancel
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block mb-2 font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block mb-2 font-medium">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block mb-2 font-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block mb-2 font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block mb-2 font-medium">Password {isEditMode && '(leave blank to keep current)'}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required={!isEditMode}
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block mb-2 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required={!isEditMode}
              />
            </div>
            
            <div className="col-span-2 mt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm; 