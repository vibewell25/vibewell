'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    router.replace('/auth/sign-in');
  }, [router]);
  
  return null;
}

export default function LoginRedirect() {
  return (
    <Suspense fallback={<div>Redirecting...</div>}>
      <LoginRedirectContent />
    </Suspense>
  );
} 