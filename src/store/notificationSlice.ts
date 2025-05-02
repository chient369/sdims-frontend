import { StateCreator } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  createdAt: Date;
}

export interface NotificationState {
  notifications: Notification[];
}

export interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export type NotificationSlice = NotificationState & NotificationActions;

const initialState: NotificationState = {
  notifications: [],
};

export const createNotificationSlice: StateCreator<NotificationSlice> = (set, get) => ({
  ...initialState,
  
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000,
      createdAt: new Date(),
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-close notification if enabled
    if (newNotification.autoClose) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== id),
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
}); 