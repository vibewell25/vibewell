import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DocSearch } from './DocSearch';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Setup custom render with test-utils if needed
const customRender = (ui: React.ReactElement) =>
  render(ui);

describe('DocSearch', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    customRender(<DocSearch />);
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    customRender(<DocSearch />);
    const input = screen.getByRole('searchbox') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input.value).toBe('test query');
  });

  it('navigates to search page on form submission with non-empty query', () => {
    customRender(<DocSearch />);
    const input = screen.getByRole('searchbox');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith('/docs/search?q=test%20query');
  });

  it('does not navigate on form submission with empty query', () => {
    customRender(<DocSearch />);
    const form = screen.getByRole('form');

    fireEvent.submit(form);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('trims whitespace from query before navigation', () => {
    customRender(<DocSearch />);
    const input = screen.getByRole('searchbox');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: '  test query  ' } });
    fireEvent.submit(form);

    expect(mockPush).toHaveBeenCalledWith('/docs/search?q=test%20query');
  });

  it('applies custom className when provided', () => {
    customRender(<DocSearch className="custom-class" />);
    const form = screen.getByRole('form');
    expect(form).toHaveClass('custom-class');
  });
}); 