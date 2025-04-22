import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface StorageItem<T> {
  data: T;
  timestamp: number;
  synced: boolean;
}

class OfflineStorage {
  private static instance: OfflineStorage;
  private syncQueue: Map<string, StorageItem<any>>;
  private isOnline: boolean;

  private constructor() {
    this.syncQueue = new Map();
    this.isOnline = true;
    this.initNetworkListener();
  }

  public static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  public async storeData<T>(key: string, value: T): Promise<boolean> {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        synced: false
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
      if (!this.isOnline) {
        this.syncQueue.set(key, item);
      }
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  }

  public async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        const item: StorageItem<T> = JSON.parse(jsonValue);
        return item.data;
      }
      return null;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  }

  public async removeData(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      this.syncQueue.delete(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  }

  private async processSyncQueue(): Promise<void> {
    for (const [key, item] of this.syncQueue.entries()) {
      try {
        // Implement your sync logic here
        // For example, sending data to server
        await this.syncWithServer(item);
        
        // Update sync status
        item.synced = true;
        await AsyncStorage.setItem(key, JSON.stringify(item));
        this.syncQueue.delete(key);
      } catch (error) {
        console.error(`Error syncing item ${key}:`, error);
        item.synced = false;
        await AsyncStorage.setItem(key, JSON.stringify(item));
      }
    }
  }

  private async syncWithServer(item: StorageItem<any>): Promise<void> {
    // Implement your server sync logic here
    // This is a placeholder for actual API calls
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  public async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      this.syncQueue.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  public async getSyncStatus(key: string): Promise<boolean> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        const item: StorageItem<unknown> = JSON.parse(jsonValue);
        return item.synced;
      }
      return false;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return false;
    }
  }

  public async setSyncStatus(key: string, synced: boolean): Promise<boolean> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        const item: StorageItem<unknown> = JSON.parse(jsonValue);
        item.synced = synced;
        await AsyncStorage.setItem(key, JSON.stringify(item));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting sync status:', error);
      return false;
    }
  }

  public async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }
}

export default OfflineStorage; 