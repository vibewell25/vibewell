import { useState, useCallback } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { toast } from 'react-hot-toast';

import { useErrorHandler } from '@/utils/ErrorHandler';

import { ErrorCategory, ErrorSource, ErrorSeverity } from '@/utils/ErrorTypes';

export type NotificationType = 'SYSTEM' | 'BOOKING' | 'LOYALTY' | 'MARKETING';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  linkUrl?: string;
export interface NotificationCount {
  total: number;
  unread: number;
export interface PaginatedNotifications {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
interface UseNotificationsOptions {
  initialPage?: number;
  pageSize?: number;
  filter?: 'all' | 'read' | 'unread';
  enabled?: boolean;
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { initialPage = 1, pageSize = 10, filter = 'all', enabled = true } = options;

  const [page, setPage] = useState(initialPage);
  const queryClient = useQueryClient();
  const { captureError } = useErrorHandler();

  // Get notifications with pagination
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications', page, pageSize, filter],
    queryFn: async () => {
      try {
        const response = await axios.get<{ success: boolean; data: PaginatedNotifications }>(

          `/api/notifications?page=${page}&limit=${pageSize}&filter=${filter}`,
return response.data.data;
catch (error) {
        captureError(error, {
          source: ErrorSource.API,
          category: ErrorCategory.DATA_FETCHING,
          severity: ErrorSeverity.ERROR,
          metadata: { page, pageSize, filter },
throw error;
enabled,
// Get notification counts (total and unread)
  const {
    data: countData,
    isLoading: isCountLoading,
    refetch: refetchCount,
= useQuery({

    queryKey: ['notifications-count'],
    queryFn: async () => {
      try {
        const response = await axios.get<{ success: boolean; data: NotificationCount }>(

          '/api/notifications/count',
return response.data.data;
catch (error) {
        captureError(error, {
          source: ErrorSource.API,
          category: ErrorCategory.DATA_FETCHING,
          severity: ErrorSeverity.ERROR,
throw error;
enabled,
// Mark a single notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      try {

        const response = await axios.put(`/api/notifications/${notificationId}/read`);
        return response.data;
catch (error) {
        captureError(error, {
          source: ErrorSource.API,
          category: ErrorCategory.DATA_SUBMISSION,
          severity: ErrorSeverity.ERROR,
          metadata: { notificationId },
throw error;
onSuccess: (data, notificationId) => {
      // Update the notification in the cache
      queryClient.setQueryData(['notifications', page, pageSize, filter], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          notifications: oldData.notifications.map((notification: Notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification,
          ),
// Update the count
      if (data.updated) {

        queryClient.setQueryData(['notifications-count'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,

            unread: Math.max(0, oldData.unread - 1),
onError: (error) => {
      toast.error('Failed to mark notification as read');
// Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      try {


        const response = await axios.put('/api/notifications/read-all');
        return response.data;
catch (error) {
        captureError(error, {
          source: ErrorSource.API,
          category: ErrorCategory.DATA_SUBMISSION,
          severity: ErrorSeverity.ERROR,
throw error;
onSuccess: (data) => {
      // Update all notifications to read
      queryClient.setQueryData(['notifications', page, pageSize, filter], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          notifications: oldData.notifications.map((notification: Notification) => ({
            ...notification,
            read: true,
)),
// Update the unread count to zero

      queryClient.setQueryData(['notifications-count'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          unread: 0,
onError: () => {
      toast.error('Failed to mark all notifications as read');
// Delete a notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      try {

        const response = await axios.delete(`/api/notifications/${notificationId}`);
        return response.data;
catch (error) {
        captureError(error, {
          source: ErrorSource.API,
          category: ErrorCategory.DATA_SUBMISSION,
          severity: ErrorSeverity.ERROR,
          metadata: { notificationId },
throw error;
onSuccess: (_, notificationId) => {
      // Find the notification in cache before removing it to check if it was unread
      const cachedData = queryClient.getQueryData(['notifications', page, pageSize, filter]) as any;
      const wasUnread =
        cachedData.notifications.find((n: Notification) => n.id === notificationId).read ===
        false;

      // Remove the notification from cache
      queryClient.setQueryData(['notifications', page, pageSize, filter], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          notifications: oldData.notifications.filter(
            (notification: Notification) => notification.id !== notificationId,
          ),
// Update the counts

      queryClient.setQueryData(['notifications-count'], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,

          total: Math.max(0, oldData.total - 1),

          unread: wasUnread ? Math.max(0, oldData.unread - 1) : oldData.unread,
toast.success('Notification deleted');
onError: () => {
      toast.error('Failed to delete notification');
// Pagination utilities
  const goToNextPage = useCallback(() => {
    if (data && data.pagination.hasNextPage) {

      setPage((prevPage) => prevPage + 1);
[data]);

  const goToPrevPage = useCallback(() => {
    if (data && data.pagination.hasPrevPage) {

      setPage((prevPage) => prevPage - 1);
[data]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      if (data && pageNumber >= 1 && pageNumber <= data.pagination.totalPages) {
        setPage(pageNumber);
[data],
const refresh = useCallback(() => {
    refetch();
    refetchCount();
[refetch, refetchCount]);

  return {
    notifications: data.notifications || [],
    pagination: data.pagination,
    counts: countData || { total: 0, unread: 0 },
    isLoading,
    isCountLoading,
    isError,
    error,
    markAsRead: (id: string) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
    deleteNotification: (id: string) => deleteNotification.mutate(id),
    goToNextPage,
    goToPrevPage,
    goToPage,
    refresh,
    page,
    setPage,
