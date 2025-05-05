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
from "@heroicons/react/24/outline";
import OverviewCard from '../../components/dashboard/OverviewCard';
import AnalyticsChart from '../../components/dashboard/AnalyticsChart';
import AppointmentsList from '../../components/dashboard/AppointmentsList';

export const metadata: Metadata = {
  title: "Dashboard | VibeWell",
  description: "View your business performance and manage your services",
export default async function DashboardPage() {
  // In a real app, you would fetch real data here
  const stats = {
    revenue: {
      value: 24350,
      change: 12.5,
      trend: 'up',
appointments: {
      value: 156,
      change: 8.2,
      trend: 'up',
clients: {
      value: 78,
      change: 15.3,
      trend: 'up',
cancellations: {
      value: 12,
      change: -2.5,
      trend: 'down',
const upcomingAppointments = [
    {
      id: '1',
      client: 'Jane Smith',
      service: 'Haircut',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24),
      status: 'confirmed',
{
      id: '2',
      client: 'John Doe',
      service: 'Massage',
      date: new Date(Date.now() + 1000 * 60 * 60 * 48),
      status: 'confirmed',
{
      id: '3',
      client: 'Alice Johnson',
      service: 'Facial',
      date: new Date(Date.now() + 1000 * 60 * 60 * 72),
      status: 'pending',
];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Revenue"
          value={`$${stats.revenue.value.toLocaleString()}`}
          change={stats.revenue.change}
          trend={stats.revenue.trend}
        />
        <OverviewCard
          title="Appointments"
          value={stats.appointments.value.toString()}
          change={stats.appointments.change}
          trend={stats.appointments.trend}
        />
        <OverviewCard
          title="Clients"
          value={stats.clients.value.toString()}
          change={stats.clients.change}
          trend={stats.clients.trend}
        />
        <OverviewCard
          title="Cancellations"
          value={stats.cancellations.value.toString()}
          change={stats.cancellations.change}
          trend={stats.cancellations.trend}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-lg border p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Revenue Overview</h2>
          <AnalyticsChart />
        </div>

        <div className="rounded-lg border p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Upcoming Appointments</h2>
          <AppointmentsList appointments={upcomingAppointments} />
        </div>
      </div>
    </div>
