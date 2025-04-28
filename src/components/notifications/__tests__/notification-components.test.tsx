import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { NotificationProvider, NotificationList, NotificationBadge, useNotifications } from '../';

// Mock notification service
const mockNotificationService = {
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  markAsRead: vi.fn(),
  clearAll: vi.fn(),
  getNotifications: vi.fn(),
};

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    title: 'New Message',
    message: 'You have a new message from John',
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    title: 'Booking Confirmed',
    message: 'Your session has been confirmed',
    type: 'success',
    timestamp: new Date().toISOString(),
    read: true,
  },
];

describe('Notification Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);
  });

  describe('NotificationProvider', () => {
    it('provides notification context to children', () => {
      const TestComponent = () => {
        const { notifications } = useNotifications();
        return <div>Notification Count: {notifications.length}</div>;
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>,
      );

      expect(screen.getByText('Notification Count: 2')).toBeInTheDocument();
    });

    it('subscribes to notifications on mount', () => {
      render(
        <NotificationProvider>
          <div>Test Content</div>
        </NotificationProvider>,
      );

      expect(mockNotificationService.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = render(
        <NotificationProvider>
          <div>Test Content</div>
        </NotificationProvider>,
      );

      unmount();
      expect(mockNotificationService.unsubscribe).toHaveBeenCalled();
    });

    it('handles notification updates', async () => {
      const TestComponent = () => {
        const { notifications, markAsRead } = useNotifications();
        return (
          <div>
            <span>Unread: {notifications.filter((n) => !n.read).length}</span>
            <button onClick={() => markAsRead('1')}>Mark as Read</button>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>,
      );

      expect(screen.getByText('Unread: 1')).toBeInTheDocument();
      await user.click(screen.getByText('Mark as Read'));
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('1');
    });
  });

  describe('NotificationList', () => {
    it('renders list of notifications', async () => {
      render(
        <NotificationProvider>
          <NotificationList />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('New Message')).toBeInTheDocument();
        expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
      });
    });

    it('handles empty state', async () => {
      mockNotificationService.getNotifications.mockResolvedValue([]);

      render(
        <NotificationProvider>
          <NotificationList />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeInTheDocument();
      });
    });

    it('marks notification as read on click', async () => {
      render(
        <NotificationProvider>
          <NotificationList />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('New Message')).toBeInTheDocument();
      });

      await user.click(screen.getByText('New Message'));
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('1');
    });

    it('supports notification filtering', async () => {
      render(
        <NotificationProvider>
          <NotificationList filter="unread" />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('New Message')).toBeInTheDocument();
        expect(screen.queryByText('Booking Confirmed')).not.toBeInTheDocument();
      });
    });

    it('supports notification sorting', async () => {
      render(
        <NotificationProvider>
          <NotificationList sortBy="timestamp" />
        </NotificationProvider>,
      );

      const notifications = screen.getAllByTestId('notification-item');
      expect(notifications[0]).toHaveTextContent('New Message');
      expect(notifications[1]).toHaveTextContent('Booking Confirmed');
    });
  });

  describe('NotificationBadge', () => {
    it('displays unread count', async () => {
      render(
        <NotificationProvider>
          <NotificationBadge />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('hides when no unread notifications', async () => {
      mockNotificationService.getNotifications.mockResolvedValue([
        { ...mockNotifications[0], read: true },
        { ...mockNotifications[1], read: true },
      ]);

      render(
        <NotificationProvider>
          <NotificationBadge />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
      });
    });

    it('supports custom max count display', async () => {
      mockNotificationService.getNotifications.mockResolvedValue([
        ...mockNotifications,
        {
          id: '3',
          title: 'Another Notification',
          message: 'Test message',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ]);

      render(
        <NotificationProvider>
          <NotificationBadge maxCount={2} />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('2+')).toBeInTheDocument();
      });
    });

    it('handles click events', async () => {
      const onClickSpy = vi.fn();

      render(
        <NotificationProvider>
          <NotificationBadge onClick={onClickSpy} />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('notification-badge'));
      expect(onClickSpy).toHaveBeenCalled();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('NotificationList meets accessibility standards', async () => {
      const { container } = render(
        <NotificationProvider>
          <NotificationList />
        </NotificationProvider>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('NotificationBadge meets accessibility standards', async () => {
      const { container } = render(
        <NotificationProvider>
          <NotificationBadge />
        </NotificationProvider>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Notifications are announced to screen readers', async () => {
      render(
        <NotificationProvider>
          <NotificationList />
        </NotificationProvider>,
      );

      await waitFor(() => {
        const notifications = screen.getAllByRole('alert');
        expect(notifications).toHaveLength(2);
        expect(notifications[0]).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('NotificationBadge has proper ARIA attributes', async () => {
      render(
        <NotificationProvider>
          <NotificationBadge />
        </NotificationProvider>,
      );

      await waitFor(() => {
        const badge = screen.getByTestId('notification-badge');
        expect(badge).toHaveAttribute('aria-label', 'Unread notifications');
        expect(badge).toHaveAttribute('role', 'status');
      });
    });
  });
});
