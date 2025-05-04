import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiChevronRight, HiHome } from 'react-icons/hi';
import { cn } from '../../utils/cn';

interface BreadcrumbMapping {
  [key: string]: {
    label: string;
    icon?: React.ReactNode;
  };
}

// Configuration for route to label mapping
const routeMappings: BreadcrumbMapping = {
  '': { label: 'Home', icon: <HiHome className="w-4 h-4" /> },
  'dashboard': { label: 'Dashboard' },
  'hrm': { label: 'Human Resources' },
  'employees': { label: 'Employees' },
  'employee': { label: 'Employee Details' },
  'skills': { label: 'Skills' },
  'margin': { label: 'Margin' },
  'opportunities': { label: 'Opportunities' },
  'contracts': { label: 'Contracts' },
  'reports': { label: 'Reports' },
  'settings': { label: 'Settings' },
  // Add more mappings as needed
};

interface BreadcrumbsProps {
  overrides?: {
    [key: string]: string;
  };
}

/**
 * Breadcrumbs navigation component that dynamically generates breadcrumbs based on the current route
 * @param {BreadcrumbsProps} props - Component props
 * @returns {JSX.Element | null} The rendered Breadcrumbs component or null if at root path
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ overrides = {} }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // If we're at the root path, don't show breadcrumbs
  if (pathnames.length === 0) {
    return null;
  }
  
  return (
    <nav className="px-4 py-3 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap">
        {/* Home breadcrumb */}
        <li className="flex items-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-primary-600 flex items-center"
            aria-label="Home"
          >
            {routeMappings[''].icon}
            <span className="ml-1 hidden md:inline">Home</span>
          </Link>
        </li>
        
        {/* Path-based breadcrumbs */}
        {pathnames.map((name, index) => {
          // Try to get a numeric ID (for detail pages)
          const isId = /^\d+$/.test(name);
          
          // Get the path until this point
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Check for override
          const displayName = overrides[routeTo] || (
            isId ? `ID: ${name}` : (
              routeMappings[name]?.label || name.charAt(0).toUpperCase() + name.slice(1)
            )
          );
          
          // Icon for this breadcrumb
          const icon = routeMappings[name]?.icon;
          
          const isLast = index === pathnames.length - 1;
          
          return (
            <li key={routeTo} className="flex items-center">
              <HiChevronRight className="mx-2 text-gray-400" aria-hidden="true" />
              {isLast ? (
                <span className="font-medium text-gray-800 flex items-center" aria-current="page">
                  {icon && <span className="mr-1">{icon}</span>}
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-gray-500 hover:text-primary-600 flex items-center"
                >
                  {icon && <span className="mr-1">{icon}</span>}
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 