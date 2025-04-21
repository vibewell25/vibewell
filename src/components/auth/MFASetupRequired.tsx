import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth-service';
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
  const router = useRouter();

  const initiateMFASetup = async () => {
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

  const handleVerification = async () => {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Two-Factor Authentication Required</h2>

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
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
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
          <div className="flex justify-center mb-6">
            <QRCode value={setupData.qrCodeUrl} size={200} />
          </div>
          <p className="mb-4">3. Enter the verification code from your authenticator app:</p>
          <input
            type="text"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-2 mb-4 border rounded"
            maxLength={6}
          />
          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6}
            className="w-full bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
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
            onChange={e => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-2 mb-4 border rounded"
            maxLength={6}
          />
          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6}
            className="w-full bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
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
            onChange={e => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-2 mb-4 border rounded"
            maxLength={6}
          />
          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6}
            className="w-full bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
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
          <div className="bg-gray-100 p-4 rounded mb-6">
            {setupData.backupCodes.map((code, index) => (
              <div key={index} className="font-mono mb-1">
                {code}
              </div>
            ))}
          </div>
          <button
            onClick={handleBackupCodesSaved}
            className="w-full bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
          >
            I've Saved My Backup Codes
          </button>
        </div>
      )}
    </div>
  );
};

export default MFASetupRequired;
