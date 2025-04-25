import AsyncStorage from '@react-native-async-storage/async-storage';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
import {
  STORAGE_KEYS,
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  updateNotificationSettings,
} from '../push-notification';

describe('push-notification service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationSettings', () => {
    it('returns default settings if none stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const settings = await getNotificationSettings();
      expect(settings).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    });

    it('returns stored settings if present', async () => {
      const stored = { appointments: false, reminders: false, marketing: true, chat: false, events: true, systemUpdates: false };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(stored));
      const settings = await getNotificationSettings();
      expect(settings).toEqual(stored);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    });
  });

  describe('updateNotificationSettings', () => {
    it('merges partial settings, saves and sends to server', async () => {
      // initial stored settings
      const initial = { ...DEFAULT_NOTIFICATION_SETTINGS, marketing: false };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(initial)) // getNotificationSettings
        .mockResolvedValueOnce(null); // after update for next get

      // mock fetch for updateSettingsOnServer
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

      const partial = { marketing: true, reminders: false };
      const result = await updateNotificationSettings(partial);
      // result should be merged
      expect(result).toEqual({
        ...initial,
        ...partial,
      });
      // AsyncStorage.setItem called with merged settings
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.NOTIFICATION_SETTINGS,
        JSON.stringify({ ...initial, ...partial })
      );
      // fetch should be called
      expect(fetch).toHaveBeenCalled();
    });

    it('throws if storage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));      
      await expect(updateNotificationSettings({ appointments: false } as any))
        .rejects.toThrow('fail');
    });
  });
});
