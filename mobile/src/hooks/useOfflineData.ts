import { useState, useEffect, useCallback } from 'react';
import OfflineStorage from '../utils/offline-storage';

export type SyncStatus = 'synced' | 'syncing' | 'failed' | null;

export interface UseOfflineDataOptions<T> {
  key: string;
  initialData?: T;
  onSync?: (data: T) => void;
}

export function useOfflineData<T>({ 
  key, 
  initialData = null as T, 
  onSync 
}: UseOfflineDataOptions<T>) {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(null);
  const storage = OfflineStorage.getInstance();

  useEffect(() => {
    loadData();
  }, [key]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedData = await storage.getData<T>(key);
      setData(storedData);
      const status = await storage.getSyncStatus(key);
      setSyncStatus(status ? 'synced' : 'failed');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = useCallback(async (newData: T) => {
    try {
      setSyncStatus('syncing');
      await storage.storeData(key, newData);
      setData(newData);
      setSyncStatus('synced');
      onSync?.(newData);
    } catch (err) {
      setSyncStatus('failed');
      setError(err instanceof Error ? err : new Error('Failed to save data'));
    }
  }, [key, onSync]);

  const removeData = useCallback(async () => {
    try {
      await storage.removeData(key);
      setData(null);
      setSyncStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove data'));
    }
  }, [key]);

  return {
    data,
    isLoading,
    error,
    syncStatus,
    saveData,
    removeData
  };
} 