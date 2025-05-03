import { Icons } from '@/components/icons';
import React from 'react';
import { format } from 'date-fns';
interface Transaction {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  date: string;
  source: string;
}
interface LoyaltyTransactionsProps {
  transactions: Transaction[];
}
export {};
