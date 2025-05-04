import React from 'react';

/**
 * Footer component for MainLayout
 * 
 * @returns {JSX.Element} The rendered footer component
 */
const Footer: React.FC = () => {
  // Get the current year for copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-4 px-6 border-t border-secondary-200">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-secondary-500 mb-2 md:mb-0">
          &copy; {currentYear} SDIMS. All rights reserved.
        </div>
        
        <div className="flex space-x-4">
          <a 
            href="/help" 
            className="text-sm text-secondary-500 hover:text-primary-600"
          >
            Help Center
          </a>
          <a 
            href="/support" 
            className="text-sm text-secondary-500 hover:text-primary-600"
          >
            Support
          </a>
          <a 
            href="/privacy" 
            className="text-sm text-secondary-500 hover:text-primary-600"
          >
            Privacy Policy
          </a>
        </div>
      </div>
      
      <div className="text-xs text-center text-secondary-400 mt-2">
        Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
      </div>
    </footer>
  );
};

export default Footer; 