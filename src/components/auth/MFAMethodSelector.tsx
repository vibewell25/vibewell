import React from 'react';
import { MFAMethod } from '@/services/mfaService';

interface MFAMethodSelectorProps {
  onMethodSelect: (method: MFAMethod) => void;
  selectedMethod?: MFAMethod;
}

export const MFAMethodSelector: React.FC<MFAMethodSelectorProps> = ({
  onMethodSelect,
  selectedMethod
}) => {
  const methods: { id: MFAMethod; title: string; description: string; icon: string }[] = [
    {
      id: 'totp',
      title: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or any other TOTP app',
      icon: '🔐'
    },
    {
      id: 'sms',
      title: 'SMS Verification',
      description: 'Receive codes via text message',
      icon: '📱'
    },
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Receive codes via email',
      icon: '📧'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        Choose Your Preferred Verification Method
      </h3>
      <div className="grid gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            className={`flex items-start p-4 border rounded-lg transition-all ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            }`}
          >
            <span className="text-2xl mr-4">{method.icon}</span>
            <div className="text-left">
              <h4 className="font-medium">{method.title}</h4>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MFAMethodSelector; 