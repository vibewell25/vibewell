'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/analytics">
            View Analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View detailed analytics about try-on sessions, user engagement, and sharing activity.
            </p>
            <Button variant="link" className="p-0 mt-4" asChild>
              <Link href="/admin/analytics">View Analytics →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions.
            </p>
            <Button variant="link" className="p-0 mt-4" asChild>
              <Link href="/admin/users">Manage Users →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure platform settings and preferences.
            </p>
            <Button variant="link" className="p-0 mt-4" asChild>
              <Link href="/admin/settings">View Settings →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 