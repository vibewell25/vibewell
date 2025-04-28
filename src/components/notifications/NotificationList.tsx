import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'default';
  read: boolean;
  createdAt: string;
  link?: string;
}
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export {};
