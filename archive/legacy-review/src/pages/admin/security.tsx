import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';

const SecurityPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState('access');

  const securityTabs = [
    { id: 'access', label: 'Access Control' },
    { id: 'logs', label: 'Security Logs' },
    { id: '2fa', label: 'Two-Factor Auth' },
    { id: 'api', label: 'API Security' },
  ];

  const blockedIPs = [
    { ip: '192.168.1.100', reason: 'Multiple failed login attempts', timestamp: '2024-03-20 10:30:00' },
    { ip: '10.0.0.50', reason: 'Suspicious activity', timestamp: '2024-03-19 15:45:00' },
  ];

  const securityLogs = [
    { event: 'Failed login attempt', ip: '192.168.1.100', timestamp: '2024-03-20 10:29:00' },
    { event: 'Password changed', user: 'admin@vibewell.com', timestamp: '2024-03-19 14:20:00' },
    { event: 'New admin added', user: 'admin@vibewell.com', timestamp: '2024-03-18 09:15:00' },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Security Management - VibeWell Admin</title>
        <meta name="description" content="Manage security settings and monitor system security" />
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Security Management</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
            🚨 Emergency Lockdown
          </button>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            <div className="mt-2 flex items-center">
              <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-green-500 font-medium">Secure</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
            <p className="text-3xl font-bold text-pink-500">23</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Failed Login Attempts</h3>
            <p className="text-3xl font-bold text-pink-500">5</p>
            <p className="text-sm text-gray-500">Last 24 hours</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {securityTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'access' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Blocked IP Addresses</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {blockedIPs.map((ip, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.ip}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ip.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ip.timestamp}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-red-600 hover:text-red-900">Unblock</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Logs</h2>
              <div className="space-y-4">
                {securityLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.event}</p>
                      <p className="text-sm text-gray-500">{log.user || log.ip}</p>
                    </div>
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === '2fa' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Require 2FA for all admin users</p>
                    <p className="text-sm text-gray-500">Enforce additional security for administrative access</p>
                  </div>
                  <button className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">API Security</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">API Keys</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">No active API keys</p>
                    <button className="mt-2 text-pink-500 hover:text-pink-600 text-sm font-medium">
                      Generate New Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
export default SecurityPage; 