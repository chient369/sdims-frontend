import React from 'react';
import { cn } from '../../utils/cn';

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Body component for use within a Modal
 */
export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
); 