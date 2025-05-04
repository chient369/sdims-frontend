import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { Notification, NotificationType } from '../../context/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

/**
 * Toast component for displaying temporary notifications
 * @param notification The notification object to display
 * @param onClose Function to call when the toast is closed
 */
export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    setShow(true);
  }, [notification.id]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // match transition duration
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  return (
    <div
      className={cn(
        "w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden",
        getBgColor(notification.type),
        show ? "opacity-100" : "opacity-0"
      )}
      style={{
        transition: "all 0.3s ease",
        transform: show ? "translateX(0)" : "translateX(100%)"
      }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleClose}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {notification.duration && (
        <div 
          className="h-1 bg-current opacity-30"
          style={{
            width: "100%",
            animation: `shrink ${notification.duration}ms linear forwards`,
            animationPlayState: show ? 'running' : 'paused',
            color: notification.type === 'success' ? '#10B981' 
                 : notification.type === 'error' ? '#EF4444'
                 : notification.type === 'warning' ? '#F59E0B'
                 : '#3B82F6'
          }}
        />
      )}
    </div>
  );
}; 