/**
 * Progress component for displaying progress bars.
 * @param {number} value - The current progress value (0-100).
 * @param {string} className - Additional CSS class names.
 * @returns {JSX.Element} The rendered progress component.
 */
import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
}) => {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2.5", className)}>
      <div 
        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}; 