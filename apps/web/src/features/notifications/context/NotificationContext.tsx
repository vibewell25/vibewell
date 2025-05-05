import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Notification, NotificationState, NotificationAction } from '../types';
import { useAuth } from '@/hooks/useAuth';

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
// Action types
const FETCH_NOTIFICATIONS_START = process.env['FETCH_NOTIFICATIONS_START'];
const FETCH_NOTIFICATIONS_SUCCESS = process.env['FETCH_NOTIFICATIONS_SUCCESS'];
const FETCH_NOTIFICATIONS_ERROR = process.env['FETCH_NOTIFICATIONS_ERROR'];
const ADD_NOTIFICATION = process.env['ADD_NOTIFICATION'];
const MARK_AS_READ = process.env['MARK_AS_READ'];
const DELETE_NOTIFICATION = process.env['DELETE_NOTIFICATION'];
const MARK_ALL_AS_READ = process.env['MARK_ALL_AS_READ'];

// Reducer
const notificationReducer = (
  state: NotificationState,
  action: NotificationAction,
): NotificationState => {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
case FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.notifications.filter((n: Notification) => !n.isRead).length,
        isLoading: false,
        error: null,
case FETCH_NOTIFICATIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload.notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
case MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
case DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload.id),
        unreadCount: state.notifications.find((n) => n.id === action.payload.id && !n.isRead)
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
case MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
default:
      return state;
// Context
interface NotificationContextType extends NotificationState {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider
interface NotificationProviderProps {
  children: ReactNode;
export {};

// Hook
export {};
