'use client';;
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/profile/profile-form';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getUserSession() {
      try {
        setLoading(true);
        const {
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session.user.id) {
          setUserId(session.user.id);
        } else {
          setError('You must be logged in to edit your profile');
          setTimeout(() => router.push('/login'), 3000);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    }

    getUserSession();
  }, [router]);

  const handleProfileUpdateSuccess = () => {
    // Show success message or trigger any additional actions
    setTimeout(() => router.push('/profile'), 1500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Alert variant="destructive">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error || 'You must be logged in to edit your profile'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your personal information and preferences
            </p>
          </div>
          <div className="flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">
            <Shield className="mr-1 h-4 w-4" />
            Secure Page
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <ProfileForm userId={userId} onSuccess={handleProfileUpdateSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
