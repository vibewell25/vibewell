import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  UserIcon,
from '@heroicons/react/24/outline';

interface DashboardStats {
  revenue: {
    total: number;
    trend: number;
appointments: {
    total: number;
    completed: number;
    upcoming: number;
clients: {
    total: number;
    new: number;
services: {
    popular: Array<{
      name: string;
      bookings: number;
      revenue: number;
>;
interface UpcomingAppointment {
  id: string;
  client: {
    name: string;
    avatar?: string;
service: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
const mockStats: DashboardStats = {
  revenue: {
    total: 15780,
    trend: 12.5,
appointments: {
    total: 245,
    completed: 220,
    upcoming: 25,
clients: {
    total: 150,
    new: 15,
services: {
    popular: [
      {
        name: 'Haircut & Style',
        bookings: 45,
        revenue: 3375,
{
        name: 'Color Treatment',
        bookings: 32,
        revenue: 4800,
{
        name: 'Manicure',
        bookings: 28,
        revenue: 1400,
],
const mockAppointments: UpcomingAppointment[] = [
  {
    id: '1',
    client: {
      name: 'Emily Johnson',
      avatar: '/avatars/emily.jpg',
service: 'Haircut & Style',
    time: '10:00 AM',
    duration: 60,
    status: 'confirmed',
{
    id: '2',
    client: {
      name: 'Sarah Wilson',
service: 'Color Treatment',
    time: '11:30 AM',
    duration: 120,
    status: 'pending',
// Add more appointments as needed
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>(mockAppointments);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.revenue.trend}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointments.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.appointments.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients.total}</div>
              <p className="text-xs text-muted-foreground">{stats.clients.new} new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Popular Services</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.services.popular[0].name}</div>
              <p className="text-xs text-muted-foreground">
                {stats.services.popular[0].bookings} bookings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={appointment.client.avatar}
                          alt={appointment.client.name}
                        />
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{appointment.client.name}</div>
                        <div className="text-sm text-gray-500">{appointment.service}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center">
                          <ClockIcon className="mr-1 h-4 w-4" />
                          {appointment.time}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.duration} min</div>
                      </div>
                      <Badge
                        variant={
                          appointment.status === 'confirmed'
                            ? 'success'
                            : appointment.status === 'pending'
                              ? 'warning'
                              : 'destructive'
>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
