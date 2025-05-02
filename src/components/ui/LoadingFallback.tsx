import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-secondary-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
        <p className="text-lg font-medium text-secondary-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback; 