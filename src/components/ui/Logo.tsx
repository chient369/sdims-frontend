import React from 'react';
import { cn } from '../../utils/cn';

interface LogoProps {
  type?: 'full' | 'icon';
  className?: string;
}

/**
 * Logo component for the application
 * @param {LogoProps} props - Component props
 * @returns {JSX.Element} The rendered Logo component
 */
const Logo: React.FC<LogoProps> = ({ type = 'full', className }) => {
  if (type === 'icon') {
    return (
      <div className={cn('text-primary-600 font-bold', className)}>
        SD
      </div>
    );
  }

  return (
    <div className={cn('text-primary-600 font-bold', className)}>
      SDIMS
    </div>
  );
};

export default Logo; 