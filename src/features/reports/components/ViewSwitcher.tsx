import React from 'react';

interface ViewSwitcherProps {
  currentView: 'card' | 'table';
  onViewChange: (view: 'card' | 'table') => void;
}

/**
 * Component for switching between different view modes
 * @param {ViewSwitcherProps} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ 
  currentView,
  onViewChange 
}) => {
  return (
    <div className="inline-flex shadow-sm rounded-md">
      <button
        type="button"
        className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
          currentView === 'card'
            ? 'bg-primary-50 text-primary-700 border-primary-300'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => onViewChange('card')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" 
          />
        </svg>
        Thẻ
      </button>
      <button
        type="button"
        className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
          currentView === 'table'
            ? 'bg-primary-50 text-primary-700 border-primary-300'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => onViewChange('table')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 10h16M4 14h16M4 18h16" 
          />
        </svg>
        Bảng
      </button>
    </div>
  );
}; 