import React from 'react';
import { Toast } from './Toast';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

export type ToastPosition =
  | 'top-right'
  | 'top-center'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left';

interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
}

/**
 * Container component for displaying multiple toasts
 * @param position Position on the screen to display toasts
 * @param className Additional CSS classes
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className,
}) => {
  const { toasts, dismissToast } = useNotifications();

  const getPositionClasses = (pos: ToastPosition) => {
    switch (pos) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
    }
  };

  const isTop = position.startsWith('top');

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col",
        getPositionClasses(position),
        className
      )}
      style={{ maxWidth: 'calc(100% - 2rem)', width: '24rem' }}
    >
      <div className="flex flex-col gap-3">
        {toasts
          .slice()
          // Top positions show newest toasts at the bottom, bottom positions show newest at the top
          .sort((a, b) => {
            if (isTop) {
              return a.createdAt.getTime() - b.createdAt.getTime();
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
          })
          .map((toast) => (
            <div key={toast.id} className="w-full">
              <Toast notification={toast} onClose={dismissToast} />
            </div>
          ))}
      </div>
    </div>
  );
}; 