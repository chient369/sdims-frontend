import React from 'react';
import { cn } from '../../utils/cn';

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Footer component for use within a Modal
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-t flex items-center justify-end space-x-3", className)}>
    {children}
  </div>
); 