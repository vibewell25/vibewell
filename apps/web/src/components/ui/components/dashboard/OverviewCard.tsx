import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';

interface OverviewCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, change, trend }) => {
  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          <span className="text-xs font-medium">{change}%</span>
          {trend === 'up' ? (
            <ArrowUpIcon className="ml-1 h-3 w-3" />
          ) : (
            <ArrowDownIcon className="ml-1 h-3 w-3" />
          )}
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
export default OverviewCard; 