import { Icons } from '@/components/icons';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
interface Notification {
  id: string;
  type: 'booking' | 'content' | 'system' | 'reward';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
interface NotificationCenterProps {
  onClose: () => void;
export {};
