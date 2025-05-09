import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-md whitespace-nowrap
            ${position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-1' : ''}
            ${position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-1' : ''}
            ${position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-1' : ''}
            ${position === 'right' ? 'left-full top-1/2 transform -translate-y-1/2 ml-1' : ''}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}; 