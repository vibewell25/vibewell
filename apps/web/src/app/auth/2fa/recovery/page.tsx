import { Metadata } from 'next';
import { RecoveryForm } from '@/components/auth/RecoveryForm';

export {};

export default function RecoveryPage() {
  return (
    <div className="container mx-auto max-w-md py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">Account Recovery</h1>
        <p className="text-gray-600">Enter a recovery code to regain access to your account</p>
      </div>

      <RecoveryForm />
    </div>
  );
}
