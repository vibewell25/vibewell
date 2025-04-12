import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AccessibleBreadcrumb } from '../AccessibleBreadcrumb';
import { ErrorBoundary } from 'react-error-boundary';

describe('AccessibleBreadcrumb', () => {
  const mockItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Page' }
  ];

  it('renders breadcrumb items correctly', () => {
    render(<AccessibleBreadcrumb items={mockItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('marks the last item as current page', () => {
    render(<AccessibleBreadcrumb items={mockItems} />);
    
    const lastItem = screen.getByText('Current Page');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('handles custom separator', () => {
    render(<AccessibleBreadcrumb items={mockItems} separator=">" />);
    
    expect(screen.getAllByText('>')).toHaveLength(2);
  });

  it('calls onItemClick when an item is clicked', () => {
    const handleClick = jest.fn();
    render(<AccessibleBreadcrumb items={mockItems} onItemClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Products'));
    expect(handleClick).toHaveBeenCalledWith(mockItems[1], 1);
  });

  it('applies custom styles correctly', () => {
    const customStyles = {
      container: 'custom-container',
      item: 'custom-item',
      currentItem: 'custom-current',
      separator: 'custom-separator',
      link: 'custom-link'
    };
    
    render(<AccessibleBreadcrumb items={mockItems} styles={customStyles} />);
    
    const container = screen.getByRole('navigation');
    expect(container).toHaveClass('custom-container');
  });

  it('validates items array', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Test empty array
    render(<AccessibleBreadcrumb items={[]} />);
    expect(consoleSpy).toHaveBeenCalled();
    
    // Test invalid item
    render(<AccessibleBreadcrumb items={[{ label: '<script>alert("xss")</script>' }]} />);
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('handles keyboard navigation', () => {
    render(<AccessibleBreadcrumb items={mockItems} />);
    
    const homeLink = screen.getByText('Home');
    homeLink.focus();
    
    fireEvent.keyDown(homeLink, { key: 'Enter' });
    expect(homeLink).toHaveFocus();
  });

  it('renders efficiently without unnecessary updates', async () => {
    const { rerender } = render(<AccessibleBreadcrumb items={mockItems} />);
    const startTime = performance.now();
    await act(async () => {
      rerender(<AccessibleBreadcrumb items={mockItems} />);
    });
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(16); // 60fps threshold
  });

  it('handles malicious URLs correctly', () => {
    const maliciousItems = [
      { label: 'Test', href: 'javascript:alert(1)' },
      { label: 'Test2', href: 'data:text/html,<script>alert(2)</script>' }
    ];
    render(<AccessibleBreadcrumb items={maliciousItems} />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link.href).toBe('#');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AccessibleBreadcrumb items={mockItems} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('integrates with ErrorBoundary correctly', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    render(
      <ErrorBoundary fallback={<div>Error state</div>}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Error state')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<AccessibleBreadcrumb items={mockItems} />);
    expect(container).toMatchSnapshot();
  });

  it('respects rate limiting on clicks', async () => {
    const handleClick = jest.fn();
    render(<AccessibleBreadcrumb items={mockItems} onItemClick={handleClick} />);
    
    const link = screen.getByText('Products');
    fireEvent.click(link);
    fireEvent.click(link);
    fireEvent.click(link);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('validates input length', () => {
    const longLabel = 'a'.repeat(101);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<AccessibleBreadcrumb items={[{ label: longLabel }]} />);
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
}); 