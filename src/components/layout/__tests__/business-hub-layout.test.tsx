import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessHubLayout } from '../business-hub-layout';
import { usePathname } from 'next/navigation';
import { axe } from 'jest-axe';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  BarChart: () => <div data-testid="bar-chart-icon">Bar Chart</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  MessageSquare: () => <div data-testid="message-icon">Message</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">Trending Up</div>,
  FileText: () => <div data-testid="file-text-icon">File Text</div>,
  PieChart: () => <div data-testid="pie-chart-icon">Pie Chart</div>,
}));

describe('BusinessHubLayout Component', () => {
  const mockPathname = usePathname as vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    mockPathname.mockReturnValue('/business-hub');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);
    expect(screen.getByText('Business Hub')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockPathname.mockReturnValue('/business-hub');
    const { container } = render(<BusinessHubLayout>Test Content</BusinessHubLayout>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders all navigation items', () => {
    mockPathname.mockReturnValue('/business-hub');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Client Acquisition')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies active styles to current route', () => {
    mockPathname.mockReturnValue('/business-hub/calendar');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    const calendarLink = screen.getByText('Calendar').closest('a');
    expect(calendarLink).toHaveClass('bg-primary/10');
    expect(calendarLink).toHaveClass('text-primary');
  });

  it('applies active styles to nested routes', () => {
    mockPathname.mockReturnValue('/business-hub/clients/details');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    const clientsLink = screen.getByText('Clients').closest('a');
    expect(clientsLink).toHaveClass('bg-primary/10');
    expect(clientsLink).toHaveClass('text-primary');
  });

  it('renders business profile section', () => {
    mockPathname.mockReturnValue('/business-hub');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    expect(screen.getByText('Business Profile')).toBeInTheDocument();
    expect(screen.getByText('business@vibewell.com')).toBeInTheDocument();
  });

  it('renders mobile header with menu button', () => {
    mockPathname.mockReturnValue('/business-hub');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    const menuButton = screen.getByRole('button', { name: /open sidebar/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('renders correct icons for navigation items', () => {
    mockPathname.mockReturnValue('/business-hub');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    mockPathname.mockReturnValue('/business-hub');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/business-hub');
    expect(links[1]).toHaveAttribute('href', '/business-hub/calendar');
    expect(links[2]).toHaveAttribute('href', '/business-hub/clients');
    expect(links[3]).toHaveAttribute('href', '/business-hub/messages');
  });

  it('applies hover styles to inactive navigation items', () => {
    mockPathname.mockReturnValue('/business-hub');
    render(<BusinessHubLayout>Test Content</BusinessHubLayout>);

    const calendarLink = screen.getByText('Calendar').closest('a');
    expect(calendarLink).toHaveClass('hover:bg-accent');
    expect(calendarLink).toHaveClass('hover:text-accent-foreground');
  });
});
