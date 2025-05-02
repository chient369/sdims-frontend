import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
      <h1 className="text-9xl font-bold text-primary-500">403</h1>
      <p className="mt-4 text-2xl font-medium text-secondary-700">Unauthorized Access</p>
      <p className="mt-2 text-secondary-500">
        You don't have permission to access this page.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized; 