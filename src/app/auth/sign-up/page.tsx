'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Redirect from sign-up to signup for route standardization
 */
export default function SignUpRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve any query parameters
    const params = searchParams?.toString() ? `?${searchParams?.toString()}` : '';
    router.replace(`/auth/signup${params}`);
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
