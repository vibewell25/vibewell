import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Laptop, Smartphone, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Device {
  id: string;
  name: string;
  browser: string;
  os: string;
  lastUsed: string;
  createdAt: string;
}

interface TrustedDeviceManagerProps {
  userId: string;
  onDeviceChange?: () => void;
}

export function TrustedDeviceManager({ userId, onDeviceChange }: TrustedDeviceManagerProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await fetch('/api/auth/trusted-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' }),
      });

      if (!response.ok) throw new Error('Failed to fetch devices');

      const data = await response.json();
      setDevices(data.devices);
    } catch (error) {
      toast.error('Failed to fetch trusted devices');
    }
  };

  const handleRevoke = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');device: Device) => {
    setSelectedDevice(device);
    setShowConfirmRevoke(true);
  };

  const confirmRevoke = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!selectedDevice) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/trusted-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke',
          deviceId: selectedDevice.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke device');
      }

      toast.success('Device removed successfully');
      setShowConfirmRevoke(false);
      await fetchDevices();
      if (onDeviceChange) onDeviceChange();
    } catch (error) {
      toast.error('Failed to revoke device');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (device: Device) => {
    const os = device.os.toLowerCase();
    if (os.includes('android') || os.includes('ios') || os.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Laptop className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Trusted Devices</h3>
        <p className="mb-6 text-sm text-gray-600">
          These are the devices that are currently trusted for your account. You can revoke access
          for any device at any time.
        </p>

        {devices.length === 0 ? (
          <Alert>
            <AlertDescription>
              No trusted devices found. Devices will appear here when you choose to trust them
              during login.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  {getDeviceIcon(device)}
                  <div>
                    <h4 className="font-medium">{device.name}</h4>
                    <p className="text-sm text-gray-500">
                      {device.browser} • {device.os}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last used {formatDistanceToNow(new Date(device.lastUsed))} ago
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRevoke(device)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={showConfirmRevoke} onOpenChange={setShowConfirmRevoke}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Device Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to revoke access for this device? You'll need to re-authenticate
              if you want to use it again.
            </p>
            {selectedDevice && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium">{selectedDevice.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedDevice.browser} • {selectedDevice.os}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmRevoke(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmRevoke} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Revoke Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
