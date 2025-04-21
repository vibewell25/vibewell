import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TrustedDeviceManager } from '@/components/auth/TrustedDeviceManager';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Trusted Devices - Security Settings - VibeWell',
  description: 'Manage your trusted devices and security settings',
};

export default async function TrustedDevicesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trusted Devices</h1>
        <p className="text-gray-600">
          Manage the devices that are trusted to access your account. You can revoke access for any
          device at any time.
        </p>
      </div>

      <TrustedDeviceManager userId={session.user.id} />

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">About Device Trust</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            When you trust a device, you won't need to enter a two-factor authentication code when
            signing in from that device for 30 days.
          </p>
          <p>
            For security reasons, you should only trust devices that you use regularly and have
            exclusive access to.
          </p>
          <p>
            If you lose access to a trusted device or suspect unauthorized access, revoke its access
            immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
