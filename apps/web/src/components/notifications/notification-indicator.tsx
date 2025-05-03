import { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useErrorBoundary } from 'react-error-boundary';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export {};
