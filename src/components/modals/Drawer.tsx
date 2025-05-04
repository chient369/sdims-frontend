import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import FocusTrap from 'focus-trap-react';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
}

/**
 * Drawer component for slide-in panels from different edges of the screen
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  placement = 'right',
  size = 'md',
  showCloseButton = true,
  preventScroll = true,
  className,
  overlayClassName,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEscapeKey(() => {
    if (isOpen) {
      onClose();
    }
  }, isOpen);

  // Prevent scroll on body when drawer is open
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

  // Calculate size based on placement and size prop
  const getSizeClass = () => {
    const horizontalSizes = {
      xs: 'w-64',
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-1/3',
      xl: 'w-1/2',
      full: 'w-screen',
    };

    const verticalSizes = {
      xs: 'h-1/4',
      sm: 'h-1/3',
      md: 'h-1/2',
      lg: 'h-2/3',
      xl: 'h-3/4',
      full: 'h-screen',
    };

    return placement === 'left' || placement === 'right'
      ? horizontalSizes[size]
      : verticalSizes[size];
  };

  // Get position classes based on placement
  const getPositionClasses = () => {
    const positions = {
      left: 'inset-y-0 left-0',
      right: 'inset-y-0 right-0',
      top: 'inset-x-0 top-0',
      bottom: 'inset-x-0 bottom-0',
    };
    return positions[placement];
  };

  // Get transition classes based on placement
  const getTransitionClasses = () => {
    const baseClasses = "transition-transform duration-300 ease-in-out";
    const transformClasses = {
      left: isOpen ? 'translate-x-0' : '-translate-x-full',
      right: isOpen ? 'translate-x-0' : 'translate-x-full',
      top: isOpen ? 'translate-y-0' : '-translate-y-full',
      bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
    };
    
    return `${baseClasses} ${transformClasses[placement]}`;
  };

  // Only render if drawer should exist in DOM
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex h-full">
        {/* Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-black bg-opacity-50 transition-opacity",
            overlayClassName
          )}
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Drawer */}
        <FocusTrap>
          <div
            className={cn(
              "fixed bg-white shadow-xl",
              getPositionClasses(),
              getSizeClass(),
              getTransitionClasses(),
              className
            )}
            ref={drawerRef}
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
            <div className="h-full overflow-y-auto">{children}</div>
          </div>
        </FocusTrap>
      </div>
    </div>,
    document.body
  );
}; 