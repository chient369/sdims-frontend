import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import FocusTrap from 'focus-trap-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
}

/**
 * Modal component for displaying content in an overlay
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  preventScroll = true,
  className,
  overlayClassName,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useClickOutside(modalRef, () => {
    if (closeOnClickOutside && isOpen) {
      onClose();
    }
  });

  // Handle ESC key
  useEscapeKey(() => {
    if (closeOnEsc && isOpen) {
      onClose();
    }
  }, isOpen);

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (preventScroll) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  // Calculate max width based on size
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full m-0 rounded-none',
  };

  // Only render if open
  if (!isOpen) return null;

  // Use createPortal to render outside of parent hierarchy
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8 text-center">
        {/* Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-black bg-opacity-50 transition-opacity",
            overlayClassName
          )}
          aria-hidden="true"
        />

        {/* Modal */}
        <FocusTrap>
          <div
            className={cn(
              "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full",
              sizeClasses[size],
              className,
              "transition-all duration-300 ease-in-out"
            )}
            ref={modalRef}
          >
            {showCloseButton && (
              <button
                type="button"
                className="absolute right-4 top-4 z-10 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={onClose}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            {children}
          </div>
        </FocusTrap>
      </div>
    </div>,
    document.body
  );
}; 