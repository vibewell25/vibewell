import Head from 'next/head';
import type { NextPage } from 'next';
import AdminLayout from '@/components/layouts/AdminLayout';

const AdminPortal: NextPage = () => {
  return (
    <AdminLayout>
      <Head>
        <title>VibeWell Admin Portal</title>
        <meta name="description" content="Secure admin portal for VibeWell platform management" />
      </Head>
      
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-pink-500">1,234</p>
            <p className="text-sm text-gray-500">+12% from last month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Active Bookings</h3>
            <p className="text-3xl font-bold text-pink-500">567</p>
            <p className="text-sm text-gray-500">+5% from last week</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
            <p className="text-3xl font-bold text-pink-500">$12,345</p>
            <p className="text-sm text-gray-500">+8% from last month</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', action: 'New user registration', user: 'Sarah Smith' },
              { time: '5 minutes ago', action: 'Booking completed', user: 'John Doe' },
              { time: '10 minutes ago', action: 'Service updated', user: 'Admin User' },
              { time: '15 minutes ago', action: 'New review posted', user: 'Mike Johnson' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">by {activity.user}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
export default AdminPortal; 