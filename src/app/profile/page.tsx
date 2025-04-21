'use client';

import React, { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/use-unified-auth';
import { ProfileForm } from '@/components/user/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BellIcon, CogIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { Globe as GlobeIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface ConnectedAccount {
  id: string;
  provider: string;
  email: string;
  connectedAt: string;
  lastUsed: string;
}

function ProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    {
      id: 'appointments',
      name: 'Appointment Reminders',
      description: 'Get notified about upcoming appointments and changes',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'wellness',
      name: 'Wellness Updates',
      description: 'Receive updates about your wellness journey',
      email: true,
      push: false,
      inApp: true,
    },
    {
      id: 'promotions',
      name: 'Promotions & Offers',
      description: 'Stay informed about special offers and discounts',
      email: true,
      push: false,
      inApp: false,
    },
  ]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: 'google',
      provider: 'Google',
      email: 'user@gmail.com',
      connectedAt: '2024-01-01',
      lastUsed: '2024-04-01',
    },
  ]);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [loading, user, router]);

  const handleNotificationToggle = (id: string, type: 'email' | 'push' | 'inApp') => {
    setNotificationPreferences(prev =>
      prev.map(pref => (pref.id === id ? { ...pref, [type]: !pref[type] } : pref))
    );
    toast.success('Notification preferences updated');
  };

  const handleDisconnectAccount = (id: string) => {
    setConnectedAccounts(prev => prev.filter(account => account.id !== id));
    toast.success('Account disconnected');
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    ) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Add account deletion logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellIcon className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <CogIcon className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline">Change Photo</Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        JPG, GIF or PNG. Max size of 800K
                      </p>
                    </div>
                  </div>
                  <ProfileForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Manage your connected social media accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectedAccounts.map(account => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <GlobeIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{account.provider}</p>
                            <p className="text-sm text-muted-foreground">{account.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Connected {new Date(account.connectedAt).toLocaleDateString()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnectAccount(account.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      Connect New Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {notificationPreferences.map(preference => (
                    <div key={preference.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{preference.name}</h3>
                          <p className="text-sm text-muted-foreground">{preference.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${preference.id}-email`}
                            checked={preference.email}
                            onCheckedChange={() => handleNotificationToggle(preference.id, 'email')}
                          />
                          <Label htmlFor={`${preference.id}-email`}>Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${preference.id}-push`}
                            checked={preference.push}
                            onCheckedChange={() => handleNotificationToggle(preference.id, 'push')}
                          />
                          <Label htmlFor={`${preference.id}-push`}>Push</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${preference.id}-inApp`}
                            checked={preference.inApp}
                            onCheckedChange={() => handleNotificationToggle(preference.id, 'inApp')}
                          />
                          <Label htmlFor={`${preference.id}-inApp`}>In-App</Label>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Change Password</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                        <Button>Update Password</Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium mb-2">Active Sessions</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Chrome on macOS</p>
                            <p className="text-sm text-muted-foreground">
                              Last active: 2 hours ago
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                      >
                        {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the app looks and feels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select defaultValue="system">
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your privacy and data sharing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Profile Visibility</h3>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your profile
                        </p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Data Collection</h3>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect usage data to improve the app
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
