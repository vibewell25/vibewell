import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Notification, NotificationState, NotificationAction } from '../types';
import { useAuth } from '@/hooks/use-unified-auth';

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Action types
const FETCH_NOTIFICATIONS_START = 'FETCH_NOTIFICATIONS_START';
const FETCH_NOTIFICATIONS_SUCCESS = 'FETCH_NOTIFICATIONS_SUCCESS';
const FETCH_NOTIFICATIONS_ERROR = 'FETCH_NOTIFICATIONS_ERROR';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const MARK_AS_READ = 'MARK_AS_READ';
const DELETE_NOTIFICATION = 'DELETE_NOTIFICATION';
const MARK_ALL_AS_READ = 'MARK_ALL_AS_READ';

// Reducer
const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.notifications.filter((n: Notification) => !n.isRead).length,
        isLoading: false,
        error: null,
      };
    case FETCH_NOTIFICATIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload.notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id),
        unreadCount: state.notifications.find(n => n.id === action.payload.id && !n.isRead)
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    case MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      };
    default:
      return state;
  }
};

// Context
interface NotificationContextType extends NotificationState {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (): Promise<void> => {
    if (!user) return;

    dispatch({ type: FETCH_NOTIFICATIONS_START });

    try {
      const response = await fetch('/api/notifications');

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      dispatch({
        type: FETCH_NOTIFICATIONS_SUCCESS,
        payload: { notifications: data.notifications || [] },
      });
    } catch (error) {
      dispatch({
        type: FETCH_NOTIFICATIONS_ERROR,
        payload: { error: 'Failed to load notifications' },
      });
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string): Promise<void> => {
    try {
      // Optimistic update
      dispatch({ type: MARK_AS_READ, payload: { id } });

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update by re-fetching
      fetchNotifications();
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string): Promise<void> => {
    try {
      // Optimistic update
      dispatch({ type: DELETE_NOTIFICATION, payload: { id } });

      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Revert optimistic update by re-fetching
      fetchNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    try {
      // Optimistic update
      dispatch({ type: MARK_ALL_AS_READ });

      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update by re-fetching
      fetchNotifications();
    }
  };

  // Add a new notification (client-side only)
  const addNotification = (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ): void => {
    const newNotification: Notification = {
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notification,
    };

    dispatch({ type: ADD_NOTIFICATION, payload: { notification: newNotification } });
  };

  // Load notifications when user is authenticated
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    addNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Hook
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
};
