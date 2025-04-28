import { getNotifications, markNotificationRead, NotificationItem } from '../notificationsApiService';
import { serverBaseUrl } from '../../config';

describe('notificationsApiService', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.resetAllMocks(); });

  it('fetches notifications', async () => {
    const mockNotifications: NotificationItem[] = [
      { id: '1', userId: 'u1', title: 'T', message: 'M', read: false, createdAt: '2025-04-25T00:00:00Z', updatedAt: '2025-04-25T00:00:00Z' }
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve({ notifications: mockNotifications }) });
    const items = await getNotifications();
    expect(global.fetch).toHaveBeenCalledWith(`${serverBaseUrl}/api/notifications`);
    expect(items).toEqual(mockNotifications);
  });

  it('marks a notification as read', async () => {
    const id = '1';
    const mockItem: NotificationItem = { id, userId: 'u1', title: 'T', message: 'M', read: true, createdAt: '2025-04-25T00:00:00Z', updatedAt: '2025-04-25T01:00:00Z' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockItem) });
    const result = await markNotificationRead(id);
    expect(global.fetch).toHaveBeenCalledWith(
      `${serverBaseUrl}/api/notifications/read/${id}`,
      { method: 'POST' }
    );
    expect(result).toEqual(mockItem);
  });
});
