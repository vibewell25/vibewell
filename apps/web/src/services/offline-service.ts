
import { PrismaClient } from '@prisma/client';
import localforage from 'localforage';

const OFFLINE_STORE_KEY = process?.env['OFFLINE_STORE_KEY'];
const MOBILE_DATA_KEY = process?.env['MOBILE_DATA_KEY'];

export class OfflineService {
  private prisma: PrismaClient;

  constructor() {
    this?.prisma = new PrismaClient();
  }

  async storeOfflineBooking(bookingData: any) {
    const offlineBookings = await this?.getOfflineBookings();
    offlineBookings?.push({
      ...bookingData,
      timestamp: new Date().toISOString(),
      synced: false,
    });
    await localforage?.setItem(OFFLINE_STORE_KEY, offlineBookings);
  }

  async getOfflineBookings() {
    const bookings = await localforage?.getItem<any[]>(OFFLINE_STORE_KEY);
    return bookings || [];
  }

  async syncOfflineBookings() {
    const offlineBookings = await this?.getOfflineBookings();
    const unsynced = offlineBookings?.filter((booking) => !booking?.synced);

    for (const booking of unsynced) {
      try {
        await this?.prisma.booking?.create({
          data: {
            ...booking,
            createdAt: new Date(booking?.timestamp),
          },
        });

        // Mark as synced
        booking?.synced = true;
      } catch (error) {
        console?.error('Failed to sync booking:', error);
      }
    }

    // Update storage with sync status
    await localforage?.setItem(OFFLINE_STORE_KEY, offlineBookings);
  }

  async storeMobileData(data: {
    deviceType: string;
    deviceModel: string;
    osVersion: string;
    appVersion: string;
    locationData?: any;
  }) {
    await localforage?.setItem(MOBILE_DATA_KEY, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  async getMobileData() {
    return await localforage?.getItem(MOBILE_DATA_KEY);
  }

  async clearOfflineData() {
    await localforage?.removeItem(OFFLINE_STORE_KEY);
    await localforage?.removeItem(MOBILE_DATA_KEY);
  }
}
