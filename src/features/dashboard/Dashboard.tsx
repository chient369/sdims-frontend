import React from 'react';
import { useAuthContext } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-md shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-secondary-800 mb-4">Welcome, {user?.firstName || 'User'}!</h2>
        <p className="text-secondary-600">
          This is your dashboard for the SDIMS (Internal Management System). From here you can access all the features you have permission to use.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card placeholders */}
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-secondary-800">Human Resources</h3>
          </div>
          <p className="text-secondary-600">Manage employees, skills, and project assignments</p>
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-secondary-800">Margin Management</h3>
          </div>
          <p className="text-secondary-600">Track costs, revenue, and analyze margin metrics</p>
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-secondary-800">Contracts</h3>
          </div>
          <p className="text-secondary-600">Manage contracts, payment terms, and track revenue</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 