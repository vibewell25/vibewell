import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationCenter } from '@/components/NotificationCenter';
import * as useNotificationsHook from '@/hooks/use-notifications';

// Mock the useNotifications hook
vi.mock('@/hooks/use-notifications', () => ({
  useNotifications: vi.fn(),
}));

describe('NotificationCenter', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'New Message',
      message: 'You have a new message from John',
      type: 'message',
      createdAt: new Date().toISOString(),
      read: false,
      linkUrl: '/messages/123'
    },
    {
      id: 'notif-2',
      title: 'Booking Confirmed',
      message: 'Your booking has been confirmed',
      type: 'booking',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: true,
      linkUrl: '/bookings/456'
    }
  ];

  const mockUseNotifications = {
    notifications: mockNotifications,
    pagination: {
      currentPage: 1,
      totalCount: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    },
    counts: {
      total: 2,
      unread: 1
    },
    isLoading: false,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    goToNextPage: vi.fn(),
    goToPrevPage: vi.fn(),
    refresh: vi.fn()
  };

  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue(mockUseNotifications);
  });

  it('renders the notification bell icon with badge when there are unread notifications', () => {
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Bell icon should be visible
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Badge with count should be visible for unread notifications
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('shows notifications when clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Click on the bell icon
    await user.click(screen.getByRole('button'));
    
    // Notification titles should be visible
    expect(screen.getByText('New Message')).toBeInTheDocument();
    expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
  });

  it('allows filtering notifications by status', async () => {
    const user = userEvent.setup();
    
    // Setup mock for different filter values
    const mockUseNotificationsWithFilter = vi.fn()
      .mockImplementation((options) => {
        if (options.filter === 'unread') {
          return {
            ...mockUseNotifications,
            notifications: [mockNotifications[0]] // Only unread notification
          };
        } else if (options.filter === 'read') {
          return {
            ...mockUseNotifications,
            notifications: [mockNotifications[1]] // Only read notification
          };
        }
        return mockUseNotifications; // All notifications
      });
    
    vi.mocked(useNotificationsHook.useNotifications).mockImplementation(mockUseNotificationsWithFilter);
    
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Open notification center
    await user.click(screen.getByRole('button'));
    
    // Switch to unread tab
    await user.click(screen.getByRole('tab', { name: /unread/i }));
    
    // Only unread notification should be visible
    expect(screen.getByText('New Message')).toBeInTheDocument();
    expect(screen.queryByText('Booking Confirmed')).not.toBeInTheDocument();
    
    // Switch to read tab
    await user.click(screen.getByRole('tab', { name: /read/i }));
    
    // Only read notification should be visible
    expect(screen.queryByText('New Message')).not.toBeInTheDocument();
    expect(screen.getByText('Booking Confirmed')).toBeInTheDocument();
  });

  it('marks a notification as read when clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Open notification center
    await user.click(screen.getByRole('button'));
    
    // Find and click "Mark as read" for the first notification
    const markAsReadButton = screen.getAllByText('Mark as read')[0];
    await user.click(markAsReadButton);
    
    // Should call markAsRead with the notification id
    expect(mockUseNotifications.markAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('marks all notifications as read', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Open notification center
    await user.click(screen.getByRole('button'));
    
    // Find and click "Mark all as read"
    const markAllAsReadButton = screen.getByText('Mark all as read');
    await user.click(markAllAsReadButton);
    
    // Should call markAllAsRead
    expect(mockUseNotifications.markAllAsRead).toHaveBeenCalled();
  });

  it('navigates when a notification is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Open notification center
    await user.click(screen.getByRole('button'));
    
    // Find and click the notification content
    const notification = screen.getByText('New Message').closest('div[role="button"]');
    expect(notification).not.toBeNull();
    await user.click(notification!);
    
    // Should call onNavigate with the linkUrl
    expect(mockNavigate).toHaveBeenCalledWith('/messages/123');
    
    // Should also mark as read
    expect(mockUseNotifications.markAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('shows a loading state', () => {
    // Override the mock to show loading state
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      ...mockUseNotifications,
      isLoading: true,
      notifications: []
    });
    
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Open notification center
    userEvent.click(screen.getByRole('button'));
    
    // Loading indicator should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an empty state when there are no notifications', () => {
    // Override the mock to show empty state
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      ...mockUseNotifications,
      notifications: [],
      counts: { total: 0, unread: 0 }
    });
    
    render(<NotificationCenter onNavigate={mockNavigate} />);
    
    // Open notification center
    userEvent.click(screen.getByRole('button'));
    
    // Empty state message should be visible
    expect(screen.getByText(/no notifications to display/i)).toBeInTheDocument();
  });
}); 