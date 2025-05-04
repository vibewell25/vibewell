import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

export function RecoveryForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          code: code.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify recovery code');
      }

      toast.success('Recovery code verified successfully');

      // Redirect to the dashboard or home page
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid recovery code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium">
            Recovery Code
          </label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            pattern="^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$"
            required
            className="uppercase"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">
            Enter the recovery code exactly as it was shown to you, including dashes
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !code.trim()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Recovery Code
        </Button>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            type="button"
            onClick={() => router.push('/auth/login')}
            className="text-sm"
          >
            Return to login
          </Button>
        </div>
      </form>
    </Card>
  );
}
