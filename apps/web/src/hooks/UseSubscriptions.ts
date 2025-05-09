import { useState, useEffect } from 'react';

import { logger } from '@/lib/logger';

export interface Subscription {
  id: string;
  customerName: string;
  plan: string;
  amount: number;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  nextBillingDate: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
export function useSubscriptions(): UseSubscriptionsReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/subscriptions');
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
const data = await response.json();
      setSubscriptions(data);
      setError(null);
catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Subscription error:', error);
finally {
      setIsLoading(false);
useEffect(() => {
    fetchSubscriptions();
[]);

  return {
    subscriptions,
    isLoading,
    error,
    refetch: fetchSubscriptions,
