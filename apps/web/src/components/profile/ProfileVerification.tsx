import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, Check, AlertCircle, Shield, Loader2 } from 'lucide-react';

interface VerificationMethod {
  id: string;
  type: 'email' | 'phone' | 'identity';
  status: 'verified' | 'pending' | 'unverified';
  label: string;
  description: string;
  icon: React.ReactNode;
export function ProfileVerification() {
  const [methods, setMethods] = useState<VerificationMethod[]>([
    {
      id: 'email',
      type: 'email',
      status: 'verified',
      label: 'Email Verification',
      description: 'Verify your email address',
      icon: <Mail className="h-4 w-4" />,
{
      id: 'phone',
      type: 'phone',
      status: 'pending',
      label: 'Phone Verification',
      description: 'Verify your phone number',
      icon: <Phone className="h-4 w-4" />,
{
      id: 'identity',
      type: 'identity',
      status: 'unverified',
      label: 'Identity Verification',
      description: 'Verify your identity with government ID',
      icon: <Shield className="h-4 w-4" />,
]);

  const [isVerifying, setIsVerifying] = useState(false);

  const verifiedMethods = methods.filter((m) => m.status === 'verified').length;
  const totalMethods = methods.length;
  const verificationPercentage = (verifiedMethods / totalMethods) * 100;

  const handleVerify = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');methodId: string) => {
    try {
      setIsVerifying(true);
      // Simulate verification process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMethods((prev) =>
        prev.map((method) => (method.id === methodId ? { ...method, status: 'verified' } : method)),
toast.success('Verification completed successfully');
catch (error) {
      console.error('Error during verification:', error);
      toast.error('Failed to complete verification');
finally {
      setIsVerifying(false);
const getStatusIcon = (status: VerificationMethod['status']) => {
    switch (status) {
      case 'verified':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'unverified':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Verification</span>
          <span className="text-sm font-normal text-muted-foreground">
            {verifiedMethods}/{totalMethods} verified
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {verificationPercentage.toFixed(0)}% Verified
            </span>
            {verifiedMethods === totalMethods && (
              <span className="text-sm text-green-500">Fully verified</span>
            )}
          </div>
          <Progress value={verificationPercentage} />
        </div>

        <div className="space-y-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-medium">{method.label}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(method.status)}
                {method.status === 'unverified' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(method.id)}
                    disabled={isVerifying}
                  >
                    Verify
                  </Button>
                )}
                {method.status === 'pending' && (
                  <span className="text-sm text-yellow-500">Pending</span>
                )}
                {method.status === 'verified' && (
                  <span className="text-sm text-green-500">Verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
