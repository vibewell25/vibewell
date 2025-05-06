import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Smartphone } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface TwoFactorMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
export function TwoFactorAuth() {
  const [methods, setMethods] = useState<TwoFactorMethod[]>([
    {
      id: 'authenticator',
      name: 'Authenticator App',
      description: 'Use an authenticator app like Google Authenticator or Authy',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: false,
{
      id: 'sms',
      name: 'SMS Verification',
      description: 'Receive verification codes via SMS',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: false,
]);

  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleEnable = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');methodId: string) => {
    try {
      if (methodId === 'authenticator') {
        setShowQRCode(true);
else if (methodId === 'sms') {
        // Implement SMS verification setup
        toast({
          title: 'SMS Verification',
          description: 'Please enter your phone number to enable SMS verification.',
catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable two-factor authentication.',
        variant: 'destructive',
const handleDisable = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');methodId: string) => {
    try {
      // Implement disable logic here
      setMethods((prev) =>
        prev.map((method) => {
          if (method.id === methodId) {
            return { ...method, enabled: false };
return method;
),
toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.',
catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable two-factor authentication.',
        variant: 'destructive',
const handleVerify = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      // Implement verification logic here
      setShowQRCode(false);
      setVerificationCode('');
      setMethods((prev) =>
        prev.map((method) => {
          if (method.id === 'authenticator') {
            return { ...method, enabled: true };
return method;
),
toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled successfully.',
catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify the code.',
        variant: 'destructive',
return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {methods.map((method) => (
          <div key={method.id} className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1">{method.icon}</div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-medium">{method.name}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              {method.enabled ? (
                <Button variant="outline" onClick={() => handleDisable(method.id)}>
                  Disable
                </Button>
              ) : (
                <Button onClick={() => handleEnable(method.id)}>Enable</Button>
              )}
            </div>
          </div>
        ))}

        {showQRCode && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <QRCodeSVG
                value="otpauth://totp/Vibewell:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Vibewell"
                size={200}
              />
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the 6-digit code"
              />
            </div>
            <Button className="w-full" onClick={handleVerify}>
              Verify and Enable
            </Button>
          </div>
        )}

        {methods.find((m) => m.id === 'sms').enabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <Button className="w-full">Save Phone Number</Button>
          </div>
        )}
      </CardContent>
    </Card>
