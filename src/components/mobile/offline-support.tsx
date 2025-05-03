import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';

interface OfflineSupportProps {
  className?: string;
}

interface CachedData {
  appointments: any[];
  services: any[];
  lastSynced: string;
}

export function OfflineSupport({ className = '' }: OfflineSupportProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window?.addEventListener('online', handleOnline);
    window?.addEventListener('offline', handleOffline);

    // Load cached data from IndexedDB
    loadCachedData();

    return () => {
      window?.removeEventListener('online', handleOnline);
      window?.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const db = await openDatabase();
      const data = await db?.getAll('cachedData');
      if (data?.length > 0) {
        setCachedData(data[0]);
      }
    } catch (error) {
      console?.error('Error loading cached data:', error);
    }
  };

  const syncData = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Please connect to the internet to sync data',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSyncing(true);

      // Get cached data from IndexedDB
      const db = await openDatabase();
      const cachedData = await db?.getAll('cachedData');

      if (cachedData?.length > 0) {
        // Sync appointments
        const appointments = cachedData[0].appointments || [];
        for (const appointment of appointments) {
          if (appointment?.needsSync) {
            await syncAppointment(appointment);
          }
        }

        // Sync other data as needed
        // ...

        // Update last synced timestamp
        await db?.put('cachedData', {
          ...cachedData[0],
          lastSynced: new Date().toISOString(),
        });

        await loadCachedData();
      }

      toast({
        title: 'Sync Complete',
        description: 'Your data has been successfully synchronized',
      });
    } catch (error) {
      console?.error('Error syncing data:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to synchronize data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAppointment = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');appointment: any) => {
    const response = await fetch('/api/appointments/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON?.stringify(appointment),
    });

    if (!response?.ok) {
      throw new Error('Failed to sync appointment');
    }

    return response?.json();
  };

  const openDatabase = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB?.open('vibewell', 1);

      request?.onerror = () => reject(request?.error);
      request?.onsuccess = () => resolve(request?.result);

      request?.onupgradeneeded = (event) => {
        const db = (event?.target as IDBOpenDBRequest).result;
        if (!db?.objectStoreNames.contains('cachedData')) {
          db?.createObjectStore('cachedData', { keyPath: 'id' });
        }
      };
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Offline Support</span>
          <div className="flex items-center space-x-2">
            <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-normal">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Last Synced</h3>
              <p className="text-sm text-gray-500">
                {cachedData?.lastSynced
                  ? new Date(cachedData?.lastSynced).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <Button
              onClick={syncData}
              disabled={!isOnline || isSyncing}
              className="flex items-center space-x-2"
            >
              {isSyncing ? (
                <Icons?.Spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons?.RefreshCw className="h-4 w-4" />
              )}
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </Button>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Cached Data</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Appointments</span>
                <span>{cachedData?.appointments?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Services</span>
                <span>{cachedData?.services?.length || 0}</span>
              </div>
            </div>
          </div>

          {!isOnline && (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                You're currently offline. Your changes will be synchronized when you're back online.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
