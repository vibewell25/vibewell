import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';

function RegisterContent() {
  const router = useRouter();

  // Redirect to sign-up page
  React.useEffect(() => {
    router.replace('/auth/sign-up');
[router]);

  return null;
export default function RegisterPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Redirecting...</div>}
    >
      <RegisterContent />
    </Suspense>
