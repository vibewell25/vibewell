import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Shield, Key, Lock, Bell, Smartphone, Mail } from 'lucide-react';
import Input from '@/components/ui/Input';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Box, Text } from '@chakra-ui/react';
import QRCode from 'qrcode.react';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'switch' | 'button' | 'input';
  value?: boolean | string;
  action?: () => Promise<void>;
export function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySetting[]>([
    {
      id: 'two-factor',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: <Shield className="h-5 w-5" />,
      type: 'switch',
      value: false,
      action: async () => { /* simulated */ },
{
      id: 'password',
      title: 'Change Password',
      description: 'Update your account password',
      icon: <Key className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to change password
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Password changed successfully!');
catch (error) {
          console.error('Error changing password:', error);
          toast.error('Failed to change password');
{
      id: 'login-alerts',
      title: 'Login Alerts',
      description: 'Get notified when someone logs into your account',
      icon: <Bell className="h-5 w-5" />,
      type: 'switch',
      value: true,
      action: async () => {
        try {
          // Simulate API call to update login alerts
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Login alerts updated successfully!');
catch (error) {
          console.error('Error updating login alerts:', error);
          toast.error('Failed to update login alerts');
{
      id: 'device-management',
      title: 'Device Management',
      description: 'View and manage your connected devices',
      icon: <Smartphone className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to manage devices
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Device management updated successfully!');
catch (error) {
          console.error('Error managing devices:', error);
          toast.error('Failed to manage devices');
{
      id: 'security-questions',
      title: 'Security Questions',
      description: 'Set up security questions for account recovery',
      icon: <Lock className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to set up security questions
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Security questions updated successfully!');
catch (error) {
          console.error('Error setting up security questions:', error);
          toast.error('Failed to set up security questions');
{
      id: 'email-verification',
      title: 'Email Verification',
      description: 'Verify your email address for security',
      icon: <Mail className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to verify email
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Verification email sent!');
catch (error) {
          console.error('Error sending verification email:', error);
          toast.error('Failed to send verification email');
]);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpToken, setTotpToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    fetch('/api/2fa/status')
      .then((res) => res.json())
      .then((data) =>
        setSettings((prev) =>
          prev.map((s) =>
            s.id === 'two-factor' ? { ...s, value: data.enabled } : s
          )
        )
[]);

  const handleSettingChange = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string, newValue?: boolean | string) => {
    if (id === 'two-factor') {
      if (newValue) {
        try {
          const res = await fetch('/api/2fa/register', { method: 'POST' });
          const data = await res.json();
          setOtpAuthUrl(data.otpAuthUrl);
          setBackupCodes(data.backupCodes);
          setShow2FAModal(true);
catch {
          toast.error('Failed to initiate 2FA registration');
else {
        try {
          const res = await fetch('/api/2fa/disable', { method: 'POST' });
          if (res.ok) {
            setSettings((prev) =>
              prev.map((s) =>
                s.id === id ? { ...s, value: false } : s
              )
toast.success('Two-factor authentication disabled');
else {
            throw new Error('Disable failed');
catch (err) {
          toast.error((err as Error).message || 'Failed to disable 2FA');
return;
try {
      const setting = settings.find((s) => s.id === id);
      if (setting.action) {
        await setting.action();
        if (newValue !== undefined) {
          setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value: newValue } : s)));
catch (error) {
      console.error('Error updating security setting:', error);
      toast.error('Failed to update security setting');
return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    {setting.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{setting.title}</h3>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {setting.type === 'switch' && (
                    <Switch
                      checked={setting.value as boolean}
                      onCheckedChange={(checked: boolean) => handleSettingChange(setting.id, checked)}
                    />
                  )}
                  {setting.type === 'button' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettingChange(setting.id)}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {show2FAModal && (
        <Modal isOpen onClose={() => setShow2FAModal(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Register Two-Factor Authentication</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box className="flex flex-col items-center">
                {otpAuthUrl && <QRCode value={otpAuthUrl} />}
                <Text className="mt-4">Scan the QR code with your authenticator app.</Text>
                <Text className="mt-2">Backup Codes:</Text>
                <Box as="ul" className="list-disc list-inside">
                  {backupCodes.map((code) => (
                    <Box as="li" key={code} className="font-mono">{code}</Box>
                  ))}
                </Box>
                <Input placeholder="Enter code from app" value={totpToken} onChange={(e) => setTotpToken(e.target.value)} className="mt-4" />
                {verifyError && <Text className="text-red-500 mt-2">{verifyError}</Text>}
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={verifying}
                onClick={async () => {
                  setVerifying(true);
                  setVerifyError('');
                  try {
                    const res = await fetch('/api/2fa/enable', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: totpToken }),
const data = await res.json();
                    if (res.ok && data.enabled) {
                      setSettings((prev) => prev.map((s) => (s.id === 'two-factor' ? { ...s, value: true } : s)));
                      toast.success('Two-factor authentication enabled');
                      setShow2FAModal(false);
else {
                      setVerifyError(data.error || 'Invalid code');
catch (err) {
                    setVerifyError((err as Error).message);
finally {
                    setVerifying(false);
>
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
