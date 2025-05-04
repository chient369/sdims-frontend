import React, { useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { useNotifications, NotificationType } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  maxHeight?: string;
  className?: string;
}

/**
 * NotificationCenter component for displaying a UI to manage all notifications
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxHeight = '24rem',
  className,
}) => {
  const { notifications, removeNotification, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          style={{ zIndex: 50 }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Clear all
              </button>
            )}
          </div>

          <div
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex px-4 py-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="ml-2 text-xs text-gray-500">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="mt-1 text-xs text-primary-600 hover:text-primary-800"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 