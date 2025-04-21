'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function AuthCallbackContent() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        router.push('/auth/login');
        return;
      }

      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Signing you in...</h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we complete the authentication process.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Loading authentication...</h1>
            </div>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
