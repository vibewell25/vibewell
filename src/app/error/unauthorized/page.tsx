'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/clerk-auth-context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-center">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-red-500 h-6 w-6"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <p className="text-center mb-4">
            Sorry, you don't have the necessary permissions to view this page. 
            This area may be restricted to users with specific roles or privileges.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          {isAuthenticated && (
            <Button 
              variant="link" 
              className="w-full" 
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 