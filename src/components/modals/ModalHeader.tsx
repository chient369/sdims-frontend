import React from 'react';
import { cn } from '../../utils/cn';

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Header component for use within a Modal
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b", className)}>
    <h3 className="text-lg font-medium text-gray-900">{children}</h3>
  </div>
); 