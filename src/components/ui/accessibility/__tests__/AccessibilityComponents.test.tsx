import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipLink } from '../SkipLink';
import { VisuallyHidden, ScreenReaderOnly, IconLabel, A11yButton } from '../VisuallyHidden';
import { LiveAnnouncerProvider, useLiveAnnouncer, Announce } from '../LiveAnnouncer';

// Mock functions for testing
const mockFn = jest.fn();

describe('SkipLink', () => {
  it('renders correctly with default props', () => {
    render(<SkipLink />);
    
    const link = screen.getByText('Skip to content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link.className).toContain('sr-only');
    expect(link.className).toContain('focus:not-sr-only');
  });
  
  it('accepts custom props', () => {
    render(<SkipLink contentId="custom-content" label="Skip to main" className="custom-class" />);
    
    const link = screen.getByText('Skip to main');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#custom-content');
    expect(link.className).toContain('custom-class');
  });
});

describe('VisuallyHidden', () => {
  it('renders hidden content by default', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    
    const element = screen.getByText('Hidden text');
    expect(element).toBeInTheDocument();
    expect(element.className).toContain('sr-only');
  });
  
  it('renders visible content when hidden is false', () => {
    render(<VisuallyHidden hidden={false}>Visible text</VisuallyHidden>);
    
    const element = screen.getByText('Visible text');
    expect(element).toBeInTheDocument();
    expect(element.className).not.toContain('sr-only');
  });
  
  it('renders with custom element type', () => {
    render(<VisuallyHidden as="div">Hidden div</VisuallyHidden>);
    
    const element = screen.getByText('Hidden div');
    expect(element.tagName).toBe('DIV');
  });
});

describe('ScreenReaderOnly', () => {
  it('renders content that is visually hidden', () => {
    render(<ScreenReaderOnly>Screen reader text</ScreenReaderOnly>);
    
    const element = screen.getByText('Screen reader text');
    expect(element).toBeInTheDocument();
    expect(element.className).toContain('sr-only');
  });
});

describe('IconLabel', () => {
  it('renders icon with visually hidden label', () => {
    render(
      <IconLabel
        icon={<span data-testid="test-icon">🔍</span>}
        label="Search"
      />
    );
    
    const icon = screen.getByTestId('test-icon');
    const label = screen.getByText('Search');
    
    expect(icon).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label.className).toContain('sr-only');
  });
});

describe('A11yButton', () => {
  it('renders button with visually hidden label', () => {
    const handleClick = jest.fn();
    render(
      <A11yButton a11yLabel="Accessible action" onClick={handleClick}>
        <span data-testid="button-icon">🔔</span>
      </A11yButton>
    );
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('button-icon');
    const label = screen.getByText('Accessible action');
    
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label.className).toContain('sr-only');
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// Mock component that uses LiveAnnouncer
const AnnouncerTestComponent = () => {
  const { announce } = useLiveAnnouncer();
  
  return (
    <div>
      <button 
        data-testid="announce-button"
        onClick={() => announce('This is an announcement', 'polite')}
      >
        Make Announcement
      </button>
      <button
        data-testid="announce-assertive-button"
        onClick={() => announce('Important announcement', 'assertive')}
      >
        Make Assertive Announcement
      </button>
    </div>
  );
};

describe('LiveAnnouncer', () => {
  it('renders announcer regions', () => {
    render(
      <LiveAnnouncerProvider>
        <div>Test content</div>
      </LiveAnnouncerProvider>
    );
    
    // Check for the live regions
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  
  it('announces content politely when triggered', () => {
    render(
      <LiveAnnouncerProvider>
        <AnnouncerTestComponent />
      </LiveAnnouncerProvider>
    );
    
    const announceButton = screen.getByTestId('announce-button');
    fireEvent.click(announceButton);
    
    // Check that the announcement appears in the polite live region
    const announcement = screen.getByText('This is an announcement');
    expect(announcement).toBeInTheDocument();
    expect(announcement.parentElement).toHaveAttribute('aria-live', 'polite');
  });
  
  it('announces content assertively when triggered', () => {
    render(
      <LiveAnnouncerProvider>
        <AnnouncerTestComponent />
      </LiveAnnouncerProvider>
    );
    
    const assertiveButton = screen.getByTestId('announce-assertive-button');
    fireEvent.click(assertiveButton);
    
    // Check that the announcement appears in the assertive live region
    const announcement = screen.getByText('Important announcement');
    expect(announcement).toBeInTheDocument();
    expect(announcement.parentElement).toHaveAttribute('aria-live', 'assertive');
  });
  
  it('renders announcement immediately using Announce component', () => {
    render(
      <LiveAnnouncerProvider>
        <Announce message="Direct announcement" />
      </LiveAnnouncerProvider>
    );
    
    // Check that the announcement is made
    const announcement = screen.getByText('Direct announcement');
    expect(announcement).toBeInTheDocument();
  });
  
  it('throws error when useLiveAnnouncer is used outside provider', () => {
    // Silence expected console errors
    const consoleError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<AnnouncerTestComponent />);
    }).toThrow('useLiveAnnouncer must be used within a LiveAnnouncerProvider');
    
    // Restore console.error
    console.error = consoleError;
  });
}); 