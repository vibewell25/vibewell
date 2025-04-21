'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <MobileLayout hideNavigation>
      <div className="flex flex-col px-6 py-12 h-screen">
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">Welcome back</h1>
          <p className="text-lg text-gray-600 mb-8">Login to your account</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 w-full rounded-md"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 w-full rounded-md"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-md font-medium text-base"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-primary hover:underline text-sm">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="pt-8 pb-4 text-center">
          <p className="text-gray-600">
            No account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}
    >
      <LoginContent />
    </Suspense>
  );
}
