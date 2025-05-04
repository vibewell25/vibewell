import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers } from '@/hooks/use-users';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/lib/monitoring/analytics';

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Created At' },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}>
          Delete
        </Button>
      </div>
    ),
  },
];

export default function AdminDashboard() {
  const { users, isLoading, error } = useUsers();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Track page view
  React.useEffect(() => {
    trackEvent('admin_dashboard_view');
  }, []);

  if (!user.isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={() => handleAddUser()}>Add User</Button>
            </div>

            <DataTable columns={columns} data={filteredUsers} pagination sorting filtering />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-6">
            <h2 className="mb-4 text-2xl font-semibold">User Analytics</h2>
            {/* Add analytics components here */}
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="mb-4 text-2xl font-semibold">Admin Settings</h2>
            {/* Add settings components here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Handler functions
const handleEdit = (user) => {
  trackEvent('admin_edit_user', { userId: user.id });
  // Implement edit functionality
};

const handleDelete = (user) => {
  trackEvent('admin_delete_user', { userId: user.id });
  // Implement delete functionality
};

const handleAddUser = () => {
  trackEvent('admin_add_user');
  // Implement add user functionality
};
