'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth, UserRole } from '@/contexts/clerk-auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPage() {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the administration portal. This page is only accessible to users with admin privileges.
          </p>
        </header>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage users and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    View and edit user information, assign roles, and manage account status.
                  </p>
                  <Button variant="outline">View Users</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Role Assignment</CardTitle>
                  <CardDescription>Configure user permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Assign roles and permissions to control access to features.
                  </p>
                  <Button variant="outline">Manage Roles</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Verification</CardTitle>
                  <CardDescription>Verify provider accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Review and approve service provider applications.
                  </p>
                  <Button variant="outline">Verification Queue</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>Manage platform content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Create, edit, and publish content across the platform.
                  </p>
                  <Button variant="outline">Edit Content</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                  <CardDescription>User activity and growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    View user registration, engagement, and retention metrics.
                  </p>
                  <Button variant="outline">View Reports</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Service Analytics</CardTitle>
                  <CardDescription>Service performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Review booking statistics and service popularity.
                  </p>
                  <Button variant="outline">View Statistics</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure platform settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Manage global configuration and system parameters.
                  </p>
                  <Button variant="outline">View Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
} 