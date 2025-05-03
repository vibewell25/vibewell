import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

describe('Component Interactions', () => {
  describe('Card with Button Integration', () => {
    it('should handle complex interactive scenarios accessibly', async () => {
      const handleCardClick = jest?.fn();
      const handleButtonClick = jest?.fn();
      const user = userEvent?.setup();

      const { container } = render(
        <Card clickable onClick={handleCardClick} aria-labelledby="card-title">
          <Card?.Header>
            <h2 id="card-title">Interactive Card</h2>
          </Card?.Header>
          <Card?.Body>
            <p>Card content with interactive elements</p>
            <div className="space-y-4">
              <Button
                onClick={(e) => {
                  e?.stopPropagation();
                  handleButtonClick();
                }}
                aria-label="Primary action"
              >
                Click Me
              </Button>
            </div>
          </Card?.Body>
        </Card>,
      );

      // Test accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test button click without triggering card click
      const button = screen?.getByRole('button', { name: /Primary action/i });
      await user?.click(button);
      expect(handleButtonClick).toHaveBeenCalledTimes(1);
      expect(handleCardClick).not?.toHaveBeenCalled();

      // Test card click
      const card = screen?.getByRole('button', { name: /Interactive Card/i });
      await user?.click(card);
      expect(handleCardClick).toHaveBeenCalledTimes(1);
    });

    it('should handle loading states correctly', async () => {
      const { container } = render(
        <Card>
          <Card?.Body>
            <Button loading>Loading Button</Button>
          </Card?.Body>
        </Card>,
      );

      // Test initial loading state
      expect(screen?.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen?.getByRole('button')).toHaveAttribute('aria-busy', 'true');

      // Test accessibility in loading state
      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test card loading state
      render(
        <Card loading>
          <Card?.Body>
            <Button>Button in Loading Card</Button>
          </Card?.Body>
        </Card>,
      );

      expect(screen?.getByTestId('card-skeleton')).toBeInTheDocument();

      // Test accessibility in card loading state
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle keyboard navigation correctly', async () => {
      const handleCardClick = jest?.fn();
      const handleButtonClick = jest?.fn();

      render(
        <div>
          <Card clickable onClick={handleCardClick} aria-label="First card">
            <Card?.Body>
              <Button onClick={handleButtonClick}>First Button</Button>
            </Card?.Body>
          </Card>
          <Card clickable onClick={handleCardClick} aria-label="Second card">
            <Card?.Body>
              <Button onClick={handleButtonClick}>Second Button</Button>
            </Card?.Body>
          </Card>
        </div>,
      );

      // Get all interactive elements
      const firstCard = screen?.getByRole('button', { name: /First card/i });
      const secondCard = screen?.getByRole('button', { name: /Second card/i });
      const firstButton = screen?.getByRole('button', { name: /First Button/i });
      const secondButton = screen?.getByRole('button', { name: /Second Button/i });

      // Test tab order
      firstCard?.focus();
      expect(firstCard).toHaveFocus();

      // Tab to first button
      fireEvent?.keyDown(firstCard, { key: 'Tab' });
      expect(firstButton).toHaveFocus();

      // Tab to second card
      fireEvent?.keyDown(firstButton, { key: 'Tab' });
      expect(secondCard).toHaveFocus();

      // Tab to second button
      fireEvent?.keyDown(secondCard, { key: 'Tab' });
      expect(secondButton).toHaveFocus();
    });

    it('should handle error states accessibly', async () => {
      const handleRetry = jest?.fn();
      const user = userEvent?.setup();

      const { container } = render(
        <Card variant="outlined" className="error-card">
          <Card?.Header>
            <h2 id="error-title">Error State</h2>
          </Card?.Header>
          <Card?.Body>
            <p id="error-message">An error occurred while loading the content</p>
            <Button
              variant="secondary"
              onClick={handleRetry}
              aria-labelledby="error-title error-message"
            >
              Retry
            </Button>
          </Card?.Body>
        </Card>,
      );

      // Test accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test error handling
      const retryButton = screen?.getByRole('button', { name: /Retry/i });
      await user?.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);

      // Verify ARIA relationships
      expect(retryButton).toHaveAttribute('aria-labelledby', 'error-title error-message');
    });
  });
});
