import React from 'react';
import { Calendar, BarChart3, DollarSign, Users } from 'lucide-react';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React?.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React?.FC<StatCardProps> = ({ title, value, icon, iconBgColor, iconColor }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center">
        <div className={`rounded-full p-3 ${iconBgColor}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface BarChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
  }>;
  valueFormatter: (value: number) => string;
  barColor: string;
}

const BarChart: React?.FC<BarChartProps> = ({ title, data, valueFormatter, barColor }) => {
  const maxValue = Math?.max(...data?.map((item) => item?.value));

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="space-y-4">
        {data?.map((item) => (
          <div key={item?.label} className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item?.label}</p>
              <div className="h-2?.5 w-full rounded-full bg-gray-200">
                <div
                  className={`${barColor} h-2?.5 rounded-full`}
                  style={{
                    width: `${(item?.value / maxValue) * 100}%`,
                  }}
                />
              </div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-900">
              {valueFormatter(item?.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export {};
