import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { Navbar, Sidebar, MobileMenu, Breadcrumbs } from '../';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/dashboard',
  }),
  usePathname: () => '/dashboard',
}));

describe('Navigation Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset viewport size
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });

  describe('Navbar', () => {
    const defaultProps = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        avatar: '/avatar.jpg',
      },
      onLogout: vi.fn(),
    };

    it('renders correctly', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByAltText('User avatar')).toBeInTheDocument();
    });

    it('handles user menu interactions', async () => {
      render(<Navbar {...defaultProps} />);

      await user.click(screen.getByAltText('User avatar'));
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('handles logout', async () => {
      render(<Navbar {...defaultProps} />);

      await user.click(screen.getByAltText('User avatar'));
      await user.click(screen.getByText('Logout'));

      expect(defaultProps.onLogout).toHaveBeenCalled();
    });

    it('displays notification badge', () => {
      render(<Navbar {...defaultProps} notifications={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    const defaultProps = {
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Profile', href: '/profile', icon: 'user' },
        { label: 'Settings', href: '/settings', icon: 'settings' },
      ],
    };

    it('renders navigation items correctly', () => {
      render(<Sidebar {...defaultProps} />);
      defaultProps.items.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('highlights active item', () => {
      render(<Sidebar {...defaultProps} />);
      const activeItem = screen.getByText('Dashboard').closest('a');
      expect(activeItem).toHaveClass('active');
    });

    it('collapses and expands', async () => {
      render(<Sidebar {...defaultProps} collapsible />);

      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(toggleButton);

      // In collapsed state, only icons should be visible
      expect(screen.queryByText('Dashboard')).not.toBeVisible();

      // Expand again
      await user.click(toggleButton);
      expect(screen.getByText('Dashboard')).toBeVisible();
    });

    it('handles hover interactions when collapsed', async () => {
      render(<Sidebar {...defaultProps} collapsible />);

      // Collapse sidebar
      await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));

      // Hover over item should show tooltip
      const item = screen.getByTitle('Dashboard');
      fireEvent.mouseEnter(item);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeVisible();
      });
    });
  });

  describe('MobileMenu', () => {
    const defaultProps = {
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Profile', href: '/profile', icon: 'user' },
      ],
      isOpen: false,
      onClose: vi.fn(),
    };

    it('renders when open', () => {
      render(<MobileMenu {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      defaultProps.items.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('handles close button click', async () => {
      render(<MobileMenu {...defaultProps} isOpen={true} />);

      await user.click(screen.getByRole('button', { name: /close menu/i }));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('closes on overlay click', async () => {
      render(<MobileMenu {...defaultProps} isOpen={true} />);

      await user.click(screen.getByTestId('menu-overlay'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('handles navigation item clicks', async () => {
      const router = useRouter();
      render(<MobileMenu {...defaultProps} isOpen={true} />);

      await user.click(screen.getByText('Profile'));
      expect(router.push).toHaveBeenCalledWith('/profile');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Breadcrumbs', () => {
    const defaultProps = {
      items: [
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/dashboard/settings' },
      ],
    };

    it('renders breadcrumb items correctly', () => {
      render(<Breadcrumbs {...defaultProps} />);
      defaultProps.items.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('renders separators between items', () => {
      render(<Breadcrumbs {...defaultProps} />);
      // Should have 2 separators for 3 items
      expect(screen.getAllByTestId('breadcrumb-separator')).toHaveLength(2);
    });

    it('makes last item non-interactive', () => {
      render(<Breadcrumbs {...defaultProps} />);
      const lastItem = screen.getByText('Settings');
      expect(lastItem.closest('a')).toBeNull();
    });

    it('handles navigation clicks', async () => {
      const router = useRouter();
      render(<Breadcrumbs {...defaultProps} />);

      await user.click(screen.getByText('Dashboard'));
      expect(router.push).toHaveBeenCalledWith('/dashboard');
    });

    it('truncates long paths', () => {
      const longPath = {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Very Long Category Name', href: '/category' },
          { label: 'Even Longer Subcategory Name', href: '/category/subcategory' },
          { label: 'Current Page', href: '/category/subcategory/page' },
        ],
      };

      render(<Breadcrumbs {...longPath} maxItems={3} />);
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('Navbar meets accessibility standards', async () => {
      const { container } = render(
        <Navbar
          user={{ name: 'Test User', email: 'test@example.com', avatar: '/avatar.jpg' }}
          onLogout={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Sidebar meets accessibility standards', async () => {
      const { container } = render(
        <Sidebar
          items={[
            { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
            { label: 'Profile', href: '/profile', icon: 'user' },
          ]}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('MobileMenu meets accessibility standards', async () => {
      const { container } = render(
        <MobileMenu
          items={[
            { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
            { label: 'Profile', href: '/profile', icon: 'user' },
          ]}
          isOpen={true}
          onClose={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Breadcrumbs meets accessibility standards', async () => {
      const { container } = render(
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings', href: '/dashboard/settings' },
          ]}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
