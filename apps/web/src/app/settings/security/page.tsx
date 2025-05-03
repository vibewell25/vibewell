'use client';

import { useState } from 'react';
import { WebAuthnButton } from '@/components/auth/WebAuthnButton';
import { AuthenticatorList } from '@/components/auth/AuthenticatorList';
import { WebAuthnError } from '@/lib/auth/webauthn-types';
import type { Metadata } from '@/types/metadata';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Security Settings - VibeWell',
  description: 'Manage your security settings and authenticators',
};

interface Authenticator {
  id: string;
  createdAt: Date;
}

export default function SecuritySettingsPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSuccess = () => {
    setMessage({
      type: 'success',
      text: 'Device registered successfully!',
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleError = (error: Error) => {
    setMessage({
      type: 'error',
      text: error?.message,
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDelete = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');authenticatorId: string) => {
    try {
      const response = await fetch(`/api/auth/webauthn/authenticators?id=${authenticatorId}`, {
        method: 'DELETE',
      });

      if (!response?.ok) {
        const error = await response?.json();
        throw new WebAuthnError(
          error?.error || 'Failed to delete authenticator',
          error?.code || 'UNKNOWN_ERROR',
          error?.details,
        );
      }

      setMessage({
        type: 'success',
        text: 'Device removed successfully!',
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete authenticator');
      handleError(error);
      throw error;
    }
  };

  const handleRename = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');authenticatorId: string, name: string) => {
    try {
      const response = await fetch('/api/auth/webauthn/authenticators', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify({ id: authenticatorId, name }),
      });

      if (!response?.ok) {
        const error = await response?.json();
        throw new WebAuthnError(
          error?.error || 'Failed to rename authenticator',
          error?.code || 'UNKNOWN_ERROR',
          error?.details,
        );
      }

      setMessage({
        type: 'success',
        text: 'Device renamed successfully!',
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to rename authenticator');
      handleError(error);
      throw error;
    }
  };

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/sign-in');
  }

  const authenticators = await prisma.$queryRaw<Authenticator[]>`
    SELECT id, "createdAt"
    FROM "WebAuthnAuthenticator"
    WHERE "userId" = ${session?.user.id}
  `;

  return (
    <div className="container max-w-4xl space-y-8 py-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">
          Manage your account security and authentication methods
        </p>
      </div>
      <Separator />

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Biometric Authentication</CardTitle>
            <CardDescription>
              Add or manage biometric authentication methods for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authenticators?.length > 0 && (
              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 text-sm font-medium">Registered Authenticators</h4>
                <ul className="space-y-2 text-sm">
                  {authenticators?.map((auth) => (
                    <li key={auth?.id} className="flex items-center justify-between">
                      <span>
                        Authenticator registered on {new Date(auth?.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <WebAuthnButton
              mode="register"
              requireBiometrics={true}
              onSuccess={handleSuccess}
              onError={handleError}
              className="flex-shrink-0"
            />
          </CardContent>
        </Card>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            message?.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message?.text}
        </div>
      )}

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-xl font-semibold">
              Security Keys and Biometric Authentication
            </h2>
            <p className="text-gray-600">
              Add or manage security keys and biometric authentication methods for your account.
            </p>
          </div>
          <WebAuthnButton
            mode="register"
            requireBiometrics={false}
            onSuccess={handleSuccess}
            onError={handleError}
            className="flex-shrink-0"
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium">Registered Devices</h3>
          <AuthenticatorList onDelete={handleDelete} onRename={handleRename} />
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-xl font-semibold">Biometric Authentication</h2>
            <p className="text-gray-600">
              Add biometric authentication (fingerprint, face recognition) for enhanced security.
            </p>
          </div>
          <WebAuthnButton
            mode="register"
            requireBiometrics={true}
            onSuccess={handleSuccess}
            onError={handleError}
            className="flex-shrink-0"
          />
        </div>

        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-base font-medium">Why use biometric authentication?</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <svg
                className="mr-2 h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Enhanced security with physical verification
            </li>
            <li className="flex items-start">
              <svg
                className="mr-2 h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Quick and convenient login process
            </li>
            <li className="flex items-start">
              <svg
                className="mr-2 h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Protection against phishing and password theft
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
