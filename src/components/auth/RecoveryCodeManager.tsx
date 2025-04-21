import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface RecoveryCodeManagerProps {
  userId: string;
  onComplete?: () => void;
}

export const RecoveryCodeManager: React.FC<RecoveryCodeManagerProps> = ({ userId, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [remainingCodes, setRemainingCodes] = useState<number>(0);

  // Fetch remaining code count on mount
  useEffect(() => {
    fetchRemainingCodes();
  }, []);

  const fetchRemainingCodes = async () => {
    try {
      const response = await fetch('/api/auth/2fa/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'count' }),
      });

      if (!response.ok) throw new Error('Failed to fetch remaining codes');

      const data = await response.json();
      setRemainingCodes(data.count);
    } catch (error) {
      toast.error('Failed to fetch remaining recovery codes');
    }
  };

  const generateNewCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate recovery codes');
      }

      const data = await response.json();
      setCodes(data.codes);
      setShowCodes(true);
      await fetchRemainingCodes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate recovery codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowCodes(false);
    setCodes([]);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recovery Codes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Recovery codes allow you to access your account if you lose access to your authenticator
          device. Each code can only be used once.
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">
            Remaining codes: <strong>{remainingCodes}</strong>
          </span>
          <Button
            onClick={generateNewCodes}
            disabled={isLoading}
            variant={remainingCodes === 0 ? 'default' : 'outline'}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {remainingCodes === 0 ? 'Generate Codes' : 'Generate New Codes'}
          </Button>
        </div>

        {remainingCodes < 3 && (
          <Alert variant="warning" className="mt-4">
            <AlertDescription>
              You have fewer than 3 recovery codes remaining. We recommend generating new codes to
              ensure you don't lose access to your account.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      <Dialog open={showCodes} onOpenChange={setShowCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Recovery Codes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Save these recovery codes in a secure location. Each code can only be used once to
              recover access to your account.
            </p>

            <div className="bg-gray-100 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-2">
                {codes.map((code, index) => (
                  <code key={index} className="text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <Alert>
              <AlertDescription>Keep these codes safe! They won't be shown again.</AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(codes.join('\n'));
                  toast.success('Recovery codes copied to clipboard');
                }}
              >
                Copy to Clipboard
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
