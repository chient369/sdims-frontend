import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, undefined = no auto-dismiss
  isPersistent?: boolean;
  createdAt: Date;
  onClose?: () => void;
}

interface NotificationState {
  toasts: Notification[];
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_TOAST'; payload: Notification }
  | { type: 'REMOVE_TOAST'; payload: { id: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: string } }
  | { type: 'CLEAR_NOTIFICATIONS' };

interface NotificationContextType {
  toasts: Notification[];
  notifications: Notification[];
  showToast: (
    type: NotificationType,
    title: string,
    message: string,
    options?: { duration?: number; onClose?: () => void }
  ) => string;
  dismissToast: (id: string) => void;
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    options?: { isPersistent?: boolean; onClose?: () => void }
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const initialState: NotificationState = {
  toasts: [],
  notifications: [],
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload.id),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload.id),
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.isPersistent),
      };
    default:
      return state;
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider component for notification management
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const showToast = useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      options?: { duration?: number; onClose?: () => void }
    ) => {
      const id = uuidv4();
      const notification: Notification = {
        id,
        type,
        title,
        message,
        duration: options?.duration ?? 5000,
        createdAt: new Date(),
        onClose: options?.onClose,
      };

      dispatch({ type: 'ADD_TOAST', payload: notification });

      // Auto-dismiss if duration is provided
      if (notification.duration) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_TOAST', payload: { id } });
          options?.onClose?.();
        }, notification.duration);
      }

      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    const toast = state.toasts.find(t => t.id === id);
    dispatch({ type: 'REMOVE_TOAST', payload: { id } });
    toast?.onClose?.();
  }, [state.toasts]);

  const addNotification = useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      options?: { isPersistent?: boolean; onClose?: () => void }
    ) => {
      const id = uuidv4();
      const notification: Notification = {
        id,
        type,
        title,
        message,
        isPersistent: options?.isPersistent,
        createdAt: new Date(),
        onClose: options?.onClose,
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    const notification = state.notifications.find(n => n.id === id);
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
    notification?.onClose?.();
  }, [state.notifications]);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        toasts: state.toasts,
        notifications: state.notifications,
        showToast,
        dismissToast,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access the notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 