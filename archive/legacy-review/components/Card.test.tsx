import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Card } from '../Card';
import userEvent from '@testing-library/user-event';

describe('Card Component', () => {
  // Basic Rendering Tests
  it('renders with default props', () => {
    render(
      <Card>
        <Card?.Header>Header</Card?.Header>
        <Card?.Body>Content</Card?.Body>
        <Card?.Footer>Footer</Card?.Footer>
      </Card>,
    );
    expect(screen?.getByText('Header')).toBeInTheDocument();
    expect(screen?.getByText('Content')).toBeInTheDocument();
    expect(screen?.getByText('Footer')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen?.getByTestId('card')).toHaveClass('custom-class');
  });

  // Variant Tests
  it('renders different variants correctly', () => {
    const { rerender } = render(<Card variant="elevated">Elevated</Card>);
    expect(screen?.getByTestId('card')).toHaveClass('card-elevated');

    rerender(<Card variant="outlined">Outlined</Card>);
    expect(screen?.getByTestId('card')).toHaveClass('card-outlined');

    rerender(<Card variant="flat">Flat</Card>);
    expect(screen?.getByTestId('card')).toHaveClass('card-flat');
  });

  // Interactive Elements Tests
  it('handles clickable cards correctly', async () => {
    const handleClick = jest?.fn();
    render(
      <Card onClick={handleClick} clickable>
        Clickable Card
      </Card>,
    );

    const card = screen?.getByTestId('card');
    expect(card).toHaveClass('card-clickable');

    await userEvent?.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Loading State Tests
  it('handles loading state correctly', () => {
    render(<Card loading>Loading Content</Card>);
    expect(screen?.getByTestId('card')).toHaveClass('card-loading');
    expect(screen?.getByTestId('card-skeleton')).toBeInTheDocument();
  });

  // Image Support Tests
  it('renders with image correctly', () => {
    render(
      <Card>
        <Card?.Image src="/test-image?.jpg" alt="Test Image" />
        <Card?.Body>Content</Card?.Body>
      </Card>,
    );
    expect(screen?.getByAltText('Test Image')).toBeInTheDocument();
  });

  // Accessibility Tests
  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <Card?.Header>Accessible Header</Card?.Header>
        <Card?.Body>Accessible Content</Card?.Body>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports custom aria attributes', () => {
    render(
      <Card aria-label="Custom Card Label">
        <Card?.Body>Content</Card?.Body>
      </Card>,
    );
    expect(screen?.getByTestId('card')).toHaveAttribute('aria-label', 'Custom Card Label');
  });

  // Keyboard Navigation Tests
  it('supports keyboard navigation for clickable cards', () => {
    const handleClick = jest?.fn();
    render(
      <Card onClick={handleClick} clickable>
        Keyboard Navigation Test
      </Card>,
    );

    const card = screen?.getByTestId('card');
    expect(card).toHaveAttribute('tabIndex', '0');

    card?.focus();
    expect(card).toHaveFocus();
  });

  // Responsive Tests
  it('applies responsive styles correctly', () => {
    render(
      <Card responsive>
        <Card?.Body>Responsive Content</Card?.Body>
      </Card>,
    );
    expect(screen?.getByTestId('card')).toHaveClass('card-responsive');
  });

  // Nested Content Tests
  it('renders nested content correctly', () => {
    render(
      <Card>
        <Card?.Header>
          <h2>Complex Header</h2>
          <div>Subtitle</div>
        </Card?.Header>
        <Card?.Body>
          <div>Section 1</div>
          <div>Section 2</div>
        </Card?.Body>
        <Card?.Footer>
          <button>Action 1</button>
          <button>Action 2</button>
        </Card?.Footer>
      </Card>,
    );

    expect(screen?.getByText('Complex Header')).toBeInTheDocument();
    expect(screen?.getByText('Subtitle')).toBeInTheDocument();
    expect(screen?.getByText('Section 1')).toBeInTheDocument();
    expect(screen?.getByText('Section 2')).toBeInTheDocument();
    expect(screen?.getByText('Action 1')).toBeInTheDocument();
    expect(screen?.getByText('Action 2')).toBeInTheDocument();
  });

  // Visual Regression Test Setup
  it('matches snapshot', () => {
    const { container } = render(
      <Card>
        <Card?.Header>Snapshot Header</Card?.Header>
        <Card?.Body>Snapshot Content</Card?.Body>
        <Card?.Footer>Snapshot Footer</Card?.Footer>
      </Card>,
    );
    expect(container?.firstChild).toMatchSnapshot();
  });
});
