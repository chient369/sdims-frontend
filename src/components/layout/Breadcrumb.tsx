import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Breadcrumb component that dynamically generates navigation based on current route
 * 
 * @returns {JSX.Element} The rendered breadcrumb component
 */
const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Optional: Define custom titles for specific routes
  const getCustomTitle = (path: string): string | null => {
    const customTitles: Record<string, string> = {
      'hrm': 'Human Resources',
      'opportunities': 'Opportunities',
      'settings': 'Settings',
    };
    
    return customTitles[path] || null;
  };
  
  // Format path segment to display name
  const formatPathSegment = (segment: string): string => {
    // Check for custom title first
    const customTitle = getCustomTitle(segment);
    if (customTitle) return customTitle;
    
    // Check if segment is an ID (number or UUID)
    if (/^[0-9]+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
      return 'Detail';
    }
    
    // Format regular path: capitalize and replace hyphens with spaces
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="px-4 py-3 flex items-center text-sm">
      <Link 
        to="/" 
        className="text-primary-600 hover:text-primary-800 flex items-center"
      >
        <svg 
          className="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
        Home
      </Link>
      
      {pathnames.map((path, index) => {
        // Build the URL for this breadcrumb item
        const url = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <React.Fragment key={path}>
            <svg 
              className="h-4 w-4 mx-2 text-secondary-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 5l7 7-7 7" 
              />
            </svg>
            
            {isLast ? (
              <span className="text-secondary-500 font-medium">
                {formatPathSegment(path)}
              </span>
            ) : (
              <Link 
                to={url} 
                className="text-primary-600 hover:text-primary-800"
              >
                {formatPathSegment(path)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb; 