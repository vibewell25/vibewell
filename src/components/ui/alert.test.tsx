import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add jest-axe matchers
expect?.extend(toHaveNoViolations);

describe('Alert Component', () => {
  it('renders alert with default variant', () => {
    render(
      <Alert>
        <div>Alert content</div>
      </Alert>,
    );

    const alert = screen?.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Alert content');
    expect(alert).toHaveClass('bg-background');
  });

  it('renders alert with destructive variant', () => {
    render(
      <Alert variant="destructive">
        <div>Destructive alert</div>
      </Alert>,
    );

    const alert = screen?.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Destructive alert');
    expect(alert).toHaveClass('border-destructive/50');
  });

  it('renders alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>This is the alert description providing more details.</AlertDescription>
      </Alert>,
    );

    expect(screen?.getByText('Alert Title')).toBeInTheDocument();
    expect(
      screen?.getByText('This is the alert description providing more details.'),
    ).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    render(
      <Alert className="custom-alert-class">
        <div>Alert with custom class</div>
      </Alert>,
    );

    const alert = screen?.getByRole('alert');
    expect(alert).toHaveClass('custom-alert-class');
  });

  it('applies custom data attributes', () => {
    render(
      <Alert data-testid="custom-alert">
        <div>Alert with custom data attribute</div>
      </Alert>,
    );

    expect(screen?.getByTestId('custom-alert')).toBeInTheDocument();
  });

  it('applies custom class names to AlertTitle', () => {
    render(
      <Alert>
        <AlertTitle className="custom-title-class">Alert Title</AlertTitle>
      </Alert>,
    );

    const title = screen?.getByText('Alert Title');
    expect(title).toHaveClass('custom-title-class');
  });

  it('applies custom class names to AlertDescription', () => {
    render(
      <Alert>
        <AlertDescription className="custom-description-class">Alert Description</AlertDescription>
      </Alert>,
    );

    const description = screen?.getByText('Alert Description');
    expect(description).toHaveClass('custom-description-class');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Accessibility Test</AlertTitle>
        <AlertDescription>Testing the alert component for accessibility.</AlertDescription>
      </Alert>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders complex content inside alert', () => {
    render(
      <Alert>
        <AlertTitle>Complex Alert</AlertTitle>
        <AlertDescription>
          <p>This is a paragraph inside the alert.</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
          <button>Action Button</button>
        </AlertDescription>
      </Alert>,
    );

    expect(screen?.getByText('Complex Alert')).toBeInTheDocument();
    expect(screen?.getByText('This is a paragraph inside the alert.')).toBeInTheDocument();
    expect(screen?.getByText('List item 1')).toBeInTheDocument();
    expect(screen?.getByText('List item 2')).toBeInTheDocument();
    expect(screen?.getByRole('button')).toBeInTheDocument();
  });
});
