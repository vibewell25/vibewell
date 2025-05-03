import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow p-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-indigo-600">VibeWell</h1>
        </div>
      </div>
      <div className="flex">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 text-indigo-600 bg-indigo-50 rounded-md">Dashboard</a>
            <a href="/dashboard/appointments" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Appointments</a>
            <a href="/dashboard/clients" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Clients</a>
            <a href="/dashboard/analytics" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Analytics</a>
            <a href="/dashboard/services" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Services</a>
            <a href="/dashboard/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Settings</a>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}