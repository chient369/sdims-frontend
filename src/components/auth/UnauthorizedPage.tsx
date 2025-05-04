import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface UnauthorizedPageProps {
  title?: string;
  message?: string;
}

/**
 * Page displayed when a user tries to access a resource without proper permissions
 * @param {UnauthorizedPageProps} props - Component props
 * @returns {JSX.Element} The unauthorized page
 */
export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  title = 'Access Denied',
  message = 'You do not have permission to access this page.',
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9V5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V9h-5z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 space-x-2">
          <Link to="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}; 