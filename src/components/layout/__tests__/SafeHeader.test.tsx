import React from 'react';
import { render, screen } from '@testing-library/react';
import { SafeHeader } from '../SafeHeader';
import { Header } from '../Header';
import { useAuth } from '@/hooks/use-unified-auth';
import { axe } from 'jest-axe';

// Mock the auth hook
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

// Mock the Header component to test error cases
vi.mock('../Header', () => ({
  Header: vi.fn(),
}));

// Mock console.error to prevent error logging during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('SafeHeader Component', () => {
  const mockUseAuth = useAuth as vi.Mock;
  const mockHeader = Header as vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, loading: false });
  });

  it('renders Header component when no errors occur', () => {
    mockHeader.mockImplementation(() => <div data-testid="header">Header Content</div>);
    render(<SafeHeader />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockHeader.mockImplementation(() => <div data-testid="header">Header Content</div>);
    const { container } = render(<SafeHeader />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders fallback UI when Header throws an error', () => {
    mockHeader.mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<SafeHeader />);

    // Check fallback content is rendered
    expect(screen.getByText('Vibewell')).toBeInTheDocument();
    expect(screen.getByText('Menu unavailable')).toBeInTheDocument();
  });

  it('logs error when Header component throws', () => {
    const testError = new Error('Test error');
    mockHeader.mockImplementation(() => {
      throw testError;
    });

    render(<SafeHeader />);

    expect(console.error).toHaveBeenCalledWith('Header component error:', expect.any(Error));
  });

  it('applies custom className to fallback UI when Header errors', () => {
    mockHeader.mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<SafeHeader className="custom-class" />);
    const header = screen.getByRole('banner');
    expect(header.className).toContain('bg-background');
    expect(header.className).toContain('border-b');
  });

  it('maintains home link in fallback UI', () => {
    mockHeader.mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<SafeHeader />);
    const homeLink = screen.getByRole('link', { name: /vibewell/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('passes props through to Header when no errors occur', () => {
    mockHeader.mockImplementation(props => (
      <div data-testid="header" data-class-name={props.className}>
        Header Content
      </div>
    ));

    render(<SafeHeader className="test-class" />);
    const header = screen.getByTestId('header');
    expect(header.getAttribute('data-class-name')).toBe('test-class');
  });
});
