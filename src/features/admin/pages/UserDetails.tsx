import React from 'react';
import { useParams, Link } from 'react-router-dom';

/**
 * User Details component for viewing user information
 * @returns {JSX.Element} The rendered component
 */
const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock user data for demonstration
  const user = {
    id: Number(id),
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'Administrator',
    status: 'Active',
    lastLogin: '2025-05-15 14:30:00',
    createdAt: '2025-01-01 00:00:00'
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="space-x-4">
          <Link 
            to={`/admin/users/${id}/edit`} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Edit User
          </Link>
          <Link 
            to="/admin/users" 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Username:</span> {user.username}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Full Name:</span> {user.fullName}</p>
                <p><span className="font-medium">Status:</span> {user.status}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">System Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Role:</span> {user.role}</p>
                <p><span className="font-medium">Last Login:</span> {user.lastLogin}</p>
                <p><span className="font-medium">Created At:</span> {user.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails; 