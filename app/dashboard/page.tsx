import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { 
  CalendarIcon, 
  UserGroupIcon, 
  SparklesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Dashboard | VibeWell",
  description: "View your business performance and manage your services",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/dashboard/appointments/new"
            className="block rounded-lg bg-white p-6 shadow hover:bg-gray-50"
          >
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="ml-3 text-base font-medium text-gray-900">
                Schedule Appointment
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Book a new appointment for your clients
            </p>
          </a>

          <a
            href="/dashboard/clients/new"
            className="block rounded-lg bg-white p-6 shadow hover:bg-gray-50"
          >
            <div className="flex items-center">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="ml-3 text-base font-medium text-gray-900">
                Add New Client
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Create a profile for a new client
            </p>
          </a>

          <a
            href="/dashboard/services"
            className="block rounded-lg bg-white p-6 shadow hover:bg-gray-50"
          >
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="ml-3 text-base font-medium text-gray-900">
                Manage Services
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Update your service offerings and pricing
            </p>
          </a>

          <a
            href="/dashboard/analytics"
            className="block rounded-lg bg-white p-6 shadow hover:bg-gray-50"
          >
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="ml-3 text-base font-medium text-gray-900">
                View Reports
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Access detailed analytics and reports
            </p>
          </a>
        </div>
      </div>
    </div>
  );
} 