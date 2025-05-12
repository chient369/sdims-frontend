import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclaimationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { NotificationType } from '../../context/NotificationContext';

interface AlertProps {
  type: NotificationType;
  title?: string;
  message: string;
  icon?: boolean;
  dismissible?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Alert component for displaying static notifications in the UI
 */
export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  icon = true,
  dismissible = false,
  onClose,
  action,
  className,
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclaimationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={cn(
        "rounded-md border p-4",
        getAlertStyles(type),
        className
      )}
      role="alert"
    >
      <div className="flex">
        {icon && (
          <div className="flex-shrink-0">
            {getIcon(type)}
          </div>
        )}
        <div className={cn("flex-1", icon && "ml-3")}>
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={cn("text-sm", title && "mt-1")}>
            {message}
          </div>
          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  type === 'success' && "text-green-500 hover:bg-green-100 focus:ring-green-600",
                  type === 'error' && "text-red-500 hover:bg-red-100 focus:ring-red-600",
                  type === 'warning' && "text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600",
                  type === 'info' && "text-blue-500 hover:bg-blue-100 focus:ring-blue-600"
                )}
                onClick={handleClose}
                aria-label="Dismiss"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 