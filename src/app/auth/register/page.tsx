'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function RegisterRedirectContent() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/auth/sign-up');
  }, [router]);
  
  return null;
}

export default function RegisterRedirect() {
  return (
    <Suspense fallback={<div>Redirecting...</div>}>
      <RegisterRedirectContent />
    </Suspense>
  );
} 