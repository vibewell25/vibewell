import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

const TwoFactorPage: NextPage = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchWithTimeout('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        router.push('/');
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">Two-Factor Authentication</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <Input
          type="text"
          placeholder="Enter authentication code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();

export default TwoFactorPage;
