import React from 'react';
import { Outlet } from 'react-router-dom';

// This is a placeholder for the authentication layout (login, register, etc.)
const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">SDIMS</h1>
          <p className="mt-2 text-sm text-secondary-500">Internal Management System</p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 