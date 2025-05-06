/* eslint-disable */import { render, screen, fireEvent } from '@testing-library/react';
import { MobileLayout } from '../MobileLayout';
import { usePathname } from 'next/navigation';
import { axe } from 'jest-axe';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock the Icons component
vi.mock('@/components/icons', () => ({
  Icons: {
    HomeIcon: () => <div data-testid="home-icon">Home Icon</div>,
    HomeSolid: () => <div data-testid="home-solid-icon">Home Solid Icon</div>,
    MapPinIcon: () => <div data-testid="map-pin-icon">Map Pin Icon</div>,
    MapPinSolid: () => <div data-testid="map-pin-solid-icon">Map Pin Solid Icon</div>,
    ChatBubbleLeftIcon: () => <div data-testid="chat-icon">Chat Icon</div>,
    ChatBubbleLeftSolid: () => <div data-testid="chat-solid-icon">Chat Solid Icon</div>,
    UserIcon: () => <div data-testid="user-icon">User Icon</div>,
    UserSolid: () => <div data-testid="user-solid-icon">User Solid Icon</div>,
    Cog6ToothIcon: () => <div data-testid="settings-icon">Settings Icon</div>,
  },
}));

// Mock the Sheet components
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }) => <div data-testid="sheet-content">{children}</div>,
  SheetTrigger: ({ children }) => <div data-testid="sheet-trigger">{children}</div>,
}));

// Mock the ThemeSelector component
vi.mock('@/components/theme-selector', () => ({
  ThemeSelector: () => <div data-testid="theme-selector">Theme Selector</div>,
}));

describe('MobileLayout Component', () => {
  const mockPathname = usePathname as vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    mockPathname.mockReturnValue('/');
    render(<MobileLayout>Test Content</MobileLayout>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockPathname.mockReturnValue('/');
    const { container } = render(<MobileLayout>Test Content</MobileLayout>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders navigation items with correct active states', () => {
    mockPathname.mockReturnValue('/feed');
    render(<MobileLayout>Test Content</MobileLayout>);

    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Check active state
    expect(screen.getByTestId('home-solid-icon')).toBeInTheDocument();
    expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
  });

  it('hides navigation when hideNavigation prop is true', () => {
    mockPathname.mockReturnValue('/');
    render(<MobileLayout hideNavigation>Test Content</MobileLayout>);

    expect(screen.queryByText('Feed')).not.toBeInTheDocument();
    expect(screen.queryByText('Bookings')).not.toBeInTheDocument();
    expect(screen.queryByText('Messages')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('shows settings sheet when settings button is clicked', () => {
    mockPathname.mockReturnValue('/');
    render(<MobileLayout>Test Content</MobileLayout>);

    const settingsButton = screen.getByText('Settings');
    expect(settingsButton).toBeInTheDocument();

    fireEvent.click(settingsButton);
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('renders accessibility options in settings', () => {
    mockPathname.mockReturnValue('/');
    render(<MobileLayout>Test Content</MobileLayout>);

    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Text Size')).toBeInTheDocument();
    expect(screen.getByText('Screen Reader Support')).toBeInTheDocument();
    expect(screen.getByText('Reduced Motion')).toBeInTheDocument();
  });

  it('renders theme selector in settings', () => {
    mockPathname.mockReturnValue('/');
    render(<MobileLayout>Test Content</MobileLayout>);

    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('theme-selector')).toBeInTheDocument();
  });

  it('applies active styles to current route', () => {
    mockPathname.mockReturnValue('/profile');
    render(<MobileLayout>Test Content</MobileLayout>);

    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink).toHaveClass('text-primary');
    expect(screen.getByTestId('user-solid-icon')).toBeInTheDocument();
  }));
