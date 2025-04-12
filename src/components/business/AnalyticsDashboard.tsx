import { Icons } from '@/components/icons';
import React from 'react';
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
export const AnalyticsDashboard: React.FC<Icons.AnalyticsDashboardProps> = ({ data }) => {
  return (
    <Icons.div className="space-y-6">
      <Icons.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Icons.div className="bg-white rounded-lg shadow p-6">
          <Icons.div className="flex items-center">
            <Icons.div className="p-3 rounded-full bg-indigo-100">
              <Icons.Icons.CalendarIcon className="h-6 w-6 text-indigo-600" />
            <Icons./div>
            <Icons.div className="ml-4">
              <Icons.p className="text-sm font-medium text-gray-600">Total Bookings<Icons./p>
              <Icons.p className="text-2xl font-semibold text-gray-900">{data.totalBookings}<Icons./p>
            <Icons./div>
          <Icons./div>
        <Icons./div>
        <Icons.div className="bg-white rounded-lg shadow p-6">
          <Icons.div className="flex items-center">
            <Icons.div className="p-3 rounded-full bg-green-100">
              <Icons.Icons.CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            <Icons./div>
            <Icons.div className="ml-4">
              <Icons.p className="text-sm font-medium text-gray-600">Total Revenue<Icons./p>
              <Icons.p className="text-2xl font-semibold text-gray-900">
                ${data.totalRevenue.toLocaleString()}
              <Icons./p>
            <Icons./div>
          <Icons./div>
        <Icons./div>
        <Icons.div className="bg-white rounded-lg shadow p-6">
          <Icons.div className="flex items-center">
            <Icons.div className="p-3 rounded-full bg-yellow-100">
              <Icons.Icons.ChartBarIcon className="h-6 w-6 text-yellow-600" />
            <Icons./div>
            <Icons.div className="ml-4">
              <Icons.p className="text-sm font-medium text-gray-600">Average Rating<Icons./p>
              <Icons.p className="text-2xl font-semibold text-gray-900">
                {data.averageRating.toFixed(1)}
              <Icons./p>
            <Icons./div>
          <Icons./div>
        <Icons./div>
        <Icons.div className="bg-white rounded-lg shadow p-6">
          <Icons.div className="flex items-center">
            <Icons.div className="p-3 rounded-full bg-blue-100">
              <Icons.Icons.UserGroupIcon className="h-6 w-6 text-blue-600" />
            <Icons./div>
            <Icons.div className="ml-4">
              <Icons.p className="text-sm font-medium text-gray-600">Total Customers<Icons./p>
              <Icons.p className="text-2xl font-semibold text-gray-900">{data.customerCount}<Icons./p>
            <Icons./div>
          <Icons./div>
        <Icons./div>
      <Icons./div>
      <Icons.div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Icons.div className="bg-white rounded-lg shadow p-6">
          <Icons.h3 className="text-lg font-medium text-gray-900 mb-4">Bookings by Service<Icons./h3>
          <Icons.div className="space-y-4">
            {data.bookingsByService.map((item) => (
              <Icons.div key={item.service} className="flex items-center">
                <Icons.div className="flex-1">
                  <Icons.p className="text-sm font-medium text-gray-900">{item.service}<Icons./p>
                  <Icons.div className="w-full bg-gray-200 rounded-full h-2.5">
                    <Icons.div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...data.bookingsByService.map(b => b.count))) * 100}%`,
                      }}
                    />
                  <Icons./div>
                <Icons./div>
                <Icons.span className="ml-4 text-sm font-medium text-gray-900">
                  {item.count}
                <Icons./span>
              <Icons./div>
            ))}
          <Icons./div>
        <Icons./div>
        <Icons.div className="bg-white rounded-lg shadow p-6">
          <Icons.h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Month<Icons./h3>
          <Icons.div className="space-y-4">
            {data.revenueByMonth.map((item) => (
              <Icons.div key={item.month} className="flex items-center">
                <Icons.div className="flex-1">
                  <Icons.p className="text-sm font-medium text-gray-900">{item.month}<Icons./p>
                  <Icons.div className="w-full bg-gray-200 rounded-full h-2.5">
                    <Icons.div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${(item.amount / Math.max(...data.revenueByMonth.map(r => r.amount))) * 100}%`,
                      }}
                    />
                  <Icons./div>
                <Icons./div>
                <Icons.span className="ml-4 text-sm font-medium text-gray-900">
                  ${item.amount.toLocaleString()}
                <Icons./span>
              <Icons./div>
            ))}
          <Icons./div>
        <Icons./div>
      <Icons./div>
    <Icons./div>
  );
}; 