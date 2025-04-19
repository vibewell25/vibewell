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
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBgColor, iconColor }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          {icon}
        </div>
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

const BarChart: React.FC<BarChartProps> = ({ title, data, valueFormatter, barColor }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`${barColor} h-2.5 rounded-full`}
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                  }}
                />
              </div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-900">
              {valueFormatter(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  const bookingsChartData = data.bookingsByService.map(item => ({
    label: item.service,
    value: item.count
  }));
  
  const revenueChartData = data.revenueByMonth.map(item => ({
    label: item.month,
    value: item.amount
  }));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={data.totalBookings}
          icon={<Calendar className="h-6 w-6 text-indigo-600" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        
        <StatCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        
        <StatCard
          title="Average Rating"
          value={data.averageRating.toFixed(1)}
          icon={<BarChart3 className="h-6 w-6 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        
        <StatCard
          title="Total Customers"
          value={data.customerCount}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Bookings by Service"
          data={bookingsChartData}
          valueFormatter={(value) => value.toString()}
          barColor="bg-indigo-600"
        />
        
        <BarChart
          title="Revenue by Month"
          data={revenueChartData}
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          barColor="bg-green-600"
        />
      </div>
    </div>
  );
}; 