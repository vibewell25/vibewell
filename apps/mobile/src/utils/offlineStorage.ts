
    
    
    import AsyncStorage from '@react-native-async-storage/async-storage';

    
    import NetInfo from '@react-native-community/netinfo';

export interface OfflineQueue {
  id: string;
  action: string;
  data: any;
  timestamp: number;
}

export class OfflineManager {
  private static QUEUE_KEY = '@offline_queue';
  private static DATA_PREFIX = '@offline_data_';

  static async saveData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(

            this.DATA_PREFIX + key,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  static async getData(key: string): Promise<any> {
    try {

          const data = await AsyncStorage.getItem(this.DATA_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  static async addToQueue(action: string, data: any): Promise<void> {
    try {
      const queue = await this.getQueue();
      queue.push({
        id: Math.random().toString(36).substr(2, 9),
        action,
        data,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  static async getQueue(): Promise<OfflineQueue[]> {
    try {
      const queue = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  static async processQueue(processor: (item: OfflineQueue) => Promise<boolean>): Promise<void> {
    const queue = await this.getQueue();
    const networkState = await NetInfo.fetch();

    if (!networkState.isConnected) {
      return;
    }

    const remainingItems: OfflineQueue[] = [];
    
    for (const item of queue) {
      try {
        const success = await processor(item);
        if (!success) {
          remainingItems.push(item);
        }
      } catch (error) {
        console.error('Error processing queue item:', error);
        remainingItems.push(item);
      }
    }

    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(remainingItems));
  }

  static async clearQueue(): Promise<void> {
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify([]));
  }
} 