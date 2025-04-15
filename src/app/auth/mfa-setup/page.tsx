import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MFASetupRequired } from '@/components/auth/MFASetupRequired';

export const metadata: Metadata = {
  title: 'Set Up Two-Factor Authentication - VibeWell',
  description: 'Enhance your account security by setting up two-factor authentication.',
};

export default async function MFASetupPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Security Enhancement Required
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          To protect your account, we require all users to set up two-factor authentication.
        </p>
      </div>

      <div className="mt-8">
        <MFASetupRequired
          userId={session.user.id}
          userEmail={session.user.email || ''}
          onSetupComplete={() => {
            window.location.href = '/';
          }}
        />
      </div>
    </div>
  );
} 