import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { useAuth } from '@/hooks/use-unified-auth';
import { axe } from 'jest-axe';

// Mock the auth hook
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

// Mock the NotificationIndicator component
vi.mock('@/components/notifications/NotificationIndicator', () => ({
  NotificationIndicator: () => <div data-testid="notification-indicator">Notifications</div>,
}));

// Mock the ThemeToggle component
vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock the UserMenu component
vi.mock('@/components/user-menu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

describe('Header Component', () => {
  const mockUseAuth = useAuth as vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Header />);
    expect(screen.getByText('Vibewell')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows loading state correctly', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<Header />);
    expect(screen.getByText('Vibewell')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
  });

  it('shows sign in button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Header />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument();
  });

  it('shows user menu and notifications when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
    });
    render(<Header />);
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByTestId('notification-indicator')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Header className="custom-class" />);
    const header = screen.getByRole('banner');
    expect(header.className).toContain('custom-class');
  });

  it('renders theme toggle regardless of auth state', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Header />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders logo link that navigates to home', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /vibewell/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
