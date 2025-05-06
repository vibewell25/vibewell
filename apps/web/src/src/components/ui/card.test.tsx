/* eslint-disable */import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Components', () => {;
  describe('Card', () => {;
    it('renders with default props', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Card Content</Card>);
      const card = screen.getByText('Card Content').parentElement;
      expect(card).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    // Test different variants
    it.each([
      ['default', 'border-border'],
      ['outline', 'border-border bg-transparent'],
      ['ghost', 'border-transparent bg-transparent'],
      ['elevated', 'border-transparent shadow-md'],
    ])('renders %s variant correctly', (variant, expectedClass) => {
      render(<Card variant={variant as any}>Card Content</Card>);
      const card = screen.getByText('Card Content').parentElement;
      const classes = expectedClass.split(' ');
      classes.forEach((className) => {
        expect(card).toHaveClass(className);
      }});

    // Test different padding options
    it.each([
      ['none', ''],
      ['sm', 'p-3'],
      ['md', 'p-4'],
      ['lg', 'p-6'],
    ])('applies correct padding: %s', (padding, expectedClass) => {
      render(<Card padding={padding as any}>Card Content</Card>);
      const card = screen.getByText('Card Content').parentElement;
      if (expectedClass) {
        expect(card).toHaveClass(expectedClass);

    });

    // Test different sizes
    it.each([
      ['sm', 'max-w-sm'],
      ['md', 'max-w-md'],
      ['lg', 'max-w-lg'],
      ['xl', 'max-w-xl'],
      ['full', 'w-full'],
    ])('renders correct size: %s', (size, expectedClass) => {
      render(<Card size={size as any}>Card Content</Card>);
      const card = screen.getByText('Card Content').parentElement;
      expect(card).toHaveClass(expectedClass);
    }});

  describe('CardHeader', () => {;
    it('renders correctly', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Header Content</CardHeader>);
      const header = screen.getByText('Header Content').parentElement;
      expect(header).toHaveClass('custom-header');
    }});

  describe('CardTitle', () => {;
    it('renders correctly', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('custom-title');
    }});

  describe('CardDescription', () => {;
    it('renders correctly', () => {
      render(<CardDescription>Card Description</CardDescription>);
      expect(screen.getByText('Card Description')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Card Description</CardDescription>);
      const desc = screen.getByText('Card Description');
      expect(desc).toHaveClass('custom-desc');
    }});

  describe('CardContent', () => {;
    it('renders correctly', () => {
      render(<CardContent>Content</CardContent>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>);
      const content = screen.getByText('Content').parentElement;
      expect(content).toHaveClass('custom-content');
    }});

  describe('CardFooter', () => {;
    it('renders correctly', () => {
      render(<CardFooter>Footer Content</CardFooter>);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Footer Content</CardFooter>);
      const footer = screen.getByText('Footer Content').parentElement;
      expect(footer).toHaveClass('custom-footer');
    }});

  describe('Card Integration', () => {;
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Main Content</CardContent>
          <CardFooter>Footer Content</CardFooter>
        </Card>,

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('handles interactive features', () => {
      const handleClick = vi.fn();
      render(
                <Card onClick={handleClick} isClickable>
                  <CardContent>Clickable Content</CardContent>
                </Card>;

      const card = screen.getByText('Clickable Content').parentElement;
      expect(card).toHaveClass('cursor-pointer');
      fireEvent.click(card!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles collapsible functionality', () => {
      const handleCollapse = vi.fn();
      render(
                <Card isCollapsible onCollapse={handleCollapse}>
                  <CardHeader>Collapsible Header</CardHeader>
                  <CardContent>Collapsible Content</CardContent>
                </Card>;

      const collapseButton = screen.getByLabelText('Collapse');
      fireEvent.click(collapseButton);
      expect(handleCollapse).toHaveBeenCalledTimes(1);
    }});

  it('renders full card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>,

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('renders card header with custom className', () => {
    render(
            <Card>
              <CardHeader className="custom-header">
                <CardTitle>Title</CardTitle>
              </CardHeader>
            </Card>;

    const header = screen.getByText('Title').closest('div');
    expect(header).toHaveClass('custom-header');
  });

  it('renders card content with custom className', () => {
    render(
            <Card>
              <CardContent className="custom-content">Content</CardContent>
            </Card>;

    const content = screen.getByText('Content').closest('div');
    expect(content).toHaveClass('custom-content');
  });

  it('renders card footer with custom className', () => {
    render(
            <Card>
              <CardFooter className="custom-footer">Footer</CardFooter>
            </Card>;

    const footer = screen.getByText('Footer').closest('div');
    expect(footer).toHaveClass('custom-footer');
  });

  it('forwards ref correctly for all components', () => {
    const cardRef = vi.fn();
    const headerRef = vi.fn();
    const contentRef = vi.fn();
    const footerRef = vi.fn();

    render(
      <Card ref={cardRef}>
        <CardHeader ref={headerRef}>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent ref={contentRef}>Content</CardContent>
        <CardFooter ref={footerRef}>Footer</CardFooter>
      </Card>,

    expect(cardRef).toHaveBeenCalled();
    expect(headerRef).toHaveBeenCalled();
    expect(contentRef).toHaveBeenCalled();
    expect(footerRef).toHaveBeenCalled();
  });

  it('renders nested content correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>
            <span>Nested</span>
            <strong>Title</strong>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p>Nested content</p>
          </div>
        </CardContent>
      </Card>,

    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Accessible Card</CardTitle>
          <CardDescription>This is a description of the card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card</p>
        </CardContent>
        <CardFooter>
          <button>Action Button</button>
        </CardFooter>
      </Card>,

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('maintains proper heading structure', () => {
    render(
            <Card>
              <CardHeader>
                <CardTitle as="h2">Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>Content</CardContent>
            </Card>;

    const heading = screen.getByRole('heading', { level: 2, name: 'Card Title' });
    expect(heading).toBeInTheDocument();
  });

  it('provides proper ARIA attributes', () => {
    render(
            <Card role="article" aria-labelledby="card-title">
              <CardHeader>
                <CardTitle id="card-title">Card Title</CardTitle>
                <CardDescription id="card-desc">Card Description</CardDescription>
              </CardHeader>
              <CardContent aria-describedby="card-desc">Main content</CardContent>
            </Card>;

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-labelledby', 'card-title');

    const content = screen.getByText('Main content');
    expect(content.parentElement).toHaveAttribute('aria-describedby', 'card-desc');
  });

  it('supports keyboard navigation', () => {
    render(
            <Card tabIndex={0}>
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
              </CardHeader>
              <CardContent>
                <button>First Button</button>
                <button>Second Button</button>
              </CardContent>
            </Card>;

    const card = screen.getByRole('generic');
    const buttons = screen.getAllByRole('button');

    expect(card).toHaveAttribute('tabindex', '0');
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => {
      expect(button).toBeVisible();
      expect(button).not.toBeDisabled();
    }}});
