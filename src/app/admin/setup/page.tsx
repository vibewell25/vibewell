'use client';

import { useState } from 'react';
import { setUserRole, createFirstAdmin } from '@/lib/utils/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSetupPage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetAdmin = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const result = await setUserRole(userId, 'admin');
      if (result.success) {
        toast({
          title: 'Success',
          description: 'User has been set as admin',
        });
        setUserId('');
      } else {
        throw result.error;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set user as admin',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFirstAdmin = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const result = await createFirstAdmin(userId);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.firstAdmin 
            ? 'First admin user created successfully' 
            : 'Admin already exists',
        });
        setUserId('');
      } else {
        if (result.message) {
          toast({
            title: 'Info',
            description: result.message,
          });
        } else {
          throw result.error;
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create first admin',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Setup</h1>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Set Admin Privileges</CardTitle>
          <CardDescription>
            Assign admin role to user accounts for dashboard access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setAdmin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setAdmin">Set Admin</TabsTrigger>
              <TabsTrigger value="firstAdmin">Create First Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setAdmin" className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm">
                  Set a specific user as admin by entering their UUID:
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user UUID"
                  />
                  <Button 
                    onClick={handleSetAdmin} 
                    disabled={loading || !userId}
                  >
                    {loading ? 'Processing...' : 'Make Admin'}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="firstAdmin" className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm">
                  First-time setup: Create the initial admin account if none exists yet:
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user UUID"
                  />
                  <Button 
                    onClick={handleCreateFirstAdmin} 
                    disabled={loading || !userId}
                  >
                    {loading ? 'Processing...' : 'Create First Admin'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium mb-2">How to find your User ID:</h3>
            <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Go to Supabase Dashboard → Authentication → Users</li>
              <li>Find your user account in the list</li>
              <li>Copy the UUID value (looks like: 123e4567-e89b-...)</li>
              <li>Paste it in the input field above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 