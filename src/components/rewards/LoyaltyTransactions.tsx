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
export const LoyaltyTransactions: React.FC<LoyaltyTransactionsProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.map(transaction => (
          <div key={transaction.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {transaction.type === 'earn' ? (
                  <Icons.ArrowUpIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <Icons.ArrowDownIcon className="h-5 w-5 text-red-500" />
                )}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.source}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-medium ${
                  transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'earn' ? '+' : '-'}
                {transaction.points} points
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
