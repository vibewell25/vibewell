import { Metadata } from 'next';
import { RecoveryForm } from '@/components/auth/RecoveryForm';

export const metadata: Metadata = {
  title: 'Account Recovery - VibeWell',
  description: 'Recover access to your account using a recovery code'
};

export default function RecoveryPage() {
  return (
    <div className="container max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Account Recovery</h1>
        <p className="text-gray-600">
          Enter a recovery code to regain access to your account
        </p>
      </div>
      
      <RecoveryForm />
    </div>
  );
} 