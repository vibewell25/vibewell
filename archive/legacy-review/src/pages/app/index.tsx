import type { NextPage } from 'next';
import Head from 'next/head';
import AppLayout from '@/components/layouts/AppLayout';

const AppHome: NextPage = () => {
  return (
    <AppLayout>
      <Head>
        <title>VibeWell - Your Dashboard</title>
        <meta name="description" content="Manage your beauty and wellness appointments and services" />
      </Head>

      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Ready to continue your wellness journey?</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {/* Sample appointments - replace with real data */}
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Spa Treatment</h3>
                <p className="text-sm text-gray-500">with Sarah Johnson</p>
              </div>
              <div className="text-right">
                <p className="text-pink-500 font-medium">Tomorrow</p>
                <p className="text-sm text-gray-500">2:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-pink-500 transition-colors">
                <span className="block text-2xl mb-2">📅</span>
                <span className="text-sm font-medium">Book Service</span>
              </button>
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-pink-500 transition-colors">
                <span className="block text-2xl mb-2">💬</span>
                <span className="text-sm font-medium">Message</span>
              </button>
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-pink-500 transition-colors">
                <span className="block text-2xl mb-2">🎁</span>
                <span className="text-sm font-medium">Rewards</span>
              </button>
              <button className="p-4 text-center border border-gray-200 rounded-lg hover:border-pink-500 transition-colors">
                <span className="block text-2xl mb-2">⭐</span>
                <span className="text-sm font-medium">Reviews</span>
              </button>
            </div>
          </div>

          {/* Wellness Tips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wellness Tips</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-pink-500 pl-4">
                <h3 className="font-medium text-gray-900">Stay Hydrated</h3>
                <p className="text-sm text-gray-600">Drink at least 8 glasses of water daily for healthy skin.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-medium text-gray-900">Mindful Minutes</h3>
                <p className="text-sm text-gray-600">Take short breaks for meditation throughout your day.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
export default AppHome; 