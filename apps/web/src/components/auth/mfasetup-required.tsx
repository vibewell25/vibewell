import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setup2FA, verify2FA } from '@/lib/auth/two-factor';
import { QRCode } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { MFAMethodSelector } from './MFAMethodSelector';
import { MFAMethod } from '@/services/mfaService';

interface MFASetupRequiredProps {
  userId: string;
  userEmail: string;
  onSetupComplete: () => void;
}

type SetupStep = 'method-selection' | 'setup' | 'verify' | 'backup';

export const MFASetupRequired: React.FC<MFASetupRequiredProps> = ({
  userId,
  userEmail,
  onSetupComplete,
}) => {
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<SetupStep>('method-selection');
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod>();

  const initiateMFASetup = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setIsLoading(true);
      const result = await setup2FA(userId, userEmail);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setSetupData(result);
      setStep('verify');
    } catch (error) {
      toast.error('Failed to initiate MFA setup');
      console.error('MFA setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelection = (method: MFAMethod) => {
    setSelectedMethod(method);
    setStep('setup');
  };

  const handleVerification = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setIsLoading(true);
      const result = await verify2FA(userId, verificationCode);

      if (!result.success) {
        toast.error(result.error || 'Invalid verification code');
        return;
      }

      setStep('backup');
    } catch (error) {
      toast.error('Failed to verify MFA code');
      console.error('MFA verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodesSaved = () => {
    onSetupComplete();
    toast.success('MFA setup completed successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-bold">Two-Factor Authentication Required</h2>

      {step === 'method-selection' && (
        <div>
          <p className="mb-4 text-center">
            Please select your preferred method for two-factor authentication:
          </p>
          <MFAMethodSelector
            onMethodSelect={handleMethodSelection}
            selectedMethod={selectedMethod}
          />
        </div>
      )}

      {step === 'setup' && selectedMethod === 'authenticator' && (
        <div className="text-center">
          <p className="mb-4">You'll need to set up an authenticator app to continue.</p>
          <button
            onClick={initiateMFASetup}
            className="bg-primary hover:bg-primary-dark rounded px-6 py-2 text-white"
          >
            Begin Setup
          </button>
        </div>
      )}

      {step === 'verify' && setupData && selectedMethod === 'authenticator' && (
        <div>
          <p className="mb-4">
            1. Install an authenticator app like Google Authenticator or Authy if you haven't
            already.
          </p>
          <p className="mb-4">2. Scan this QR code with your authenticator app:</p>
          <div className="mb-6 flex justify-center">
            <QRCode value={setupData.qrCodeUrl} size={200} />
          </div>
          <p className="mb-4">3. Enter the verification code from your authenticator app:</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="mb-4 w-full rounded border px-4 py-2"
            maxLength={6}
          />
          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6}
            className="bg-primary hover:bg-primary-dark w-full rounded px-6 py-2 text-white disabled:opacity-50"
          >
            Verify Code
          </button>
        </div>
      )}

      {step === 'verify' && setupData && selectedMethod === 'sms' && (
        <div>
          <p className="mb-4">Enter the verification code sent to your phone:</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="mb-4 w-full rounded border px-4 py-2"
            maxLength={6}
          />
          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6}
            className="bg-primary hover:bg-primary-dark w-full rounded px-6 py-2 text-white disabled:opacity-50"
          >
            Verify Code
          </button>
        </div>
      )}

      {step === 'verify' && setupData && selectedMethod === 'email' && (
        <div>
          <p className="mb-4">Enter the verification code sent to your email:</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="mb-4 w-full rounded border px-4 py-2"
            maxLength={6}
          />
          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6}
            className="bg-primary hover:bg-primary-dark w-full rounded px-6 py-2 text-white disabled:opacity-50"
          >
            Verify Code
          </button>
        </div>
      )}

      {step === 'backup' && setupData && (
        <div>
          <p className="mb-4">
            Important: Save these backup codes in a secure place. You'll need them if you lose
            access to your{' '}
            {selectedMethod === 'authenticator'
              ? 'authenticator app'
              : selectedMethod === 'sms'
                ? 'phone'
                : 'email'}
            .
          </p>
          <div className="mb-6 rounded bg-gray-100 p-4">
            {setupData.backupCodes.map((code, index) => (
              <div key={index} className="mb-1 font-mono">
                {code}
              </div>
            ))}
          </div>
          <button
            onClick={handleBackupCodesSaved}
            className="bg-primary hover:bg-primary-dark w-full rounded px-6 py-2 text-white"
          >
            I've Saved My Backup Codes
          </button>
        </div>
      )}
    </div>
  );
};

export default MFASetupRequired;
