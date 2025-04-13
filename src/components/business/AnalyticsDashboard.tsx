import React from 'react';
import { CalendarIcon, CurrencyDollarIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  customerCount: number;
  bookingsByService: {
    service: string;
    count: number;
  }[];
  revenueByMonth: {
    month: string;
    amount: number;
  }[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <CalendarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{data.totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${data.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{data.customerCount}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bookings by Service</h3>
          <div className="space-y-4">
            {data.bookingsByService.map((item) => (
              <div key={item.service} className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.service}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...data.bookingsByService.map(b => b.count))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Month</h3>
          <div className="space-y-4">
            {data.revenueByMonth.map((item) => (
              <div key={item.month} className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.month}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${(item.amount / Math.max(...data.revenueByMonth.map(r => r.amount))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="ml-4 text-sm font-medium text-gray-900">
                  ${item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 