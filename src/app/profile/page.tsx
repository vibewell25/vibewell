'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pencil, User, Mail, Globe, MapPin, Link as LinkIcon, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  email: string;
  bio: string | null;
  website: string | null;
  location: string | null;
  avatar_url: string | null;
  visibility: 'public' | 'private' | 'contacts';
  email_verified: boolean;
  created_at: string;
  notification_preferences: Record<string, boolean>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUserProfile() {
      try {
        setLoading(true);
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session?.user?.id) {
          setError('You must be logged in to view your profile');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }
        
        setUserId(session.user.id);
        
        // Fetch profile data
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (data) {
          setProfile(data as ProfileData);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    getUserProfile();
  }, [router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/4 mt-2" />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="ml-4 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'You must be logged in to view your profile'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              View and manage your profile information
            </p>
          </div>
          <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <Shield className="h-4 w-4 mr-1" />
            Secure Page
          </div>
        </div>
      </div>
      
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4 flex flex-row justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
              <p className="text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" className="flex items-center">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Details
              </TabsTrigger>
              <TabsTrigger value="visibility" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Visibility
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              {profile?.bio && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p>{profile.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">Email</p>
                    <p>{profile?.email}</p>
                  </div>
                </div>
                
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-sm">Location</p>
                      <p>{profile.location}</p>
                    </div>
                  </div>
                )}
                
                {profile?.website && (
                  <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-sm">Website</p>
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">Member Since</p>
                    <p>{formatDate(profile?.created_at || '')}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="visibility" className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Profile Visibility</h3>
                <p className="text-muted-foreground">
                  Your profile is currently set to <span className="font-medium">{profile?.visibility}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {profile?.visibility === 'public' && (
                    <li className="flex items-start">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2 mt-0.5">Public</span>
                      <span>Your profile is visible to everyone</span>
                    </li>
                  )}
                  {profile?.visibility === 'contacts' && (
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2 mt-0.5">Contacts</span>
                      <span>Your profile is only visible to people in your contacts</span>
                    </li>
                  )}
                  {profile?.visibility === 'private' && (
                    <li className="flex items-start">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs mr-2 mt-0.5">Private</span>
                      <span>Your profile is only visible to you</span>
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex justify-end">
                <Link href="/profile/edit">
                  <Button variant="outline">
                    Change Privacy Settings
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 