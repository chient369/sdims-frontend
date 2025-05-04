import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../ui/ErrorBoundary';

/**
 * AuthLayout component that provides the layout for authentication pages
 * such as login, register, forgot password, etc.
 * 
 * @returns {JSX.Element} The rendered auth layout with children content
 */
const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SDIMS</h1>
          <p className="text-secondary-100">System Development Management Service</p>
        </div>
        
        {/* Card container for auth forms */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Content area with error boundary */}
          <ErrorBoundary>
            <div className="p-8">
              <Outlet />
            </div>
          </ErrorBoundary>
          
          {/* Footer */}
          <div className="px-8 py-4 bg-secondary-50 border-t border-secondary-100 text-center">
            <p className="text-xs text-secondary-500">
              &copy; {new Date().getFullYear()} SDIMS. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Additional links */}
        <div className="mt-6 text-center">
          <a 
            href="/help" 
            className="text-white text-sm hover:text-secondary-100 transition-colors duration-200 mx-2"
          >
            Help
          </a>
          <span className="text-secondary-300">|</span>
          <a 
            href="/privacy" 
            className="text-white text-sm hover:text-secondary-100 transition-colors duration-200 mx-2"
          >
            Privacy Policy
          </a>
          <span className="text-secondary-300">|</span>
          <a 
            href="/terms" 
            className="text-white text-sm hover:text-secondary-100 transition-colors duration-200 mx-2"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 