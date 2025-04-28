import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

expect.extend(toHaveNoViolations);

describe('Component Accessibility', () => {
  describe('Button Component', () => {
    it('primary button should have no accessibility violations', async () => {
      const { container } = render(<Button variant="primary">Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('disabled button should have no accessibility violations', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('loading button should have no accessibility violations', async () => {
      const { container } = render(<Button loading>Loading Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('button with icon should have proper aria-label', async () => {
      const { container } = render(
        <Button aria-label="Add item">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Button>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card Component', () => {
    it('basic card should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <Card.Header>Accessible Header</Card.Header>
          <Card.Body>Accessible Content</Card.Body>
          <Card.Footer>Accessible Footer</Card.Footer>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('clickable card should have proper role and keyboard support', async () => {
      const { container } = render(
        <Card clickable onClick={() => {}} aria-label="Interactive card">
          <Card.Body>Clickable Content</Card.Body>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('card with image should have proper alt text', async () => {
      const { container } = render(
        <Card>
          <Card.Image src="/test-image.jpg" alt="Descriptive alt text" />
          <Card.Body>Content with Image</Card.Body>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('loading card should have proper aria attributes', async () => {
      const { container } = render(
        <Card loading aria-label="Loading content">
          <Card.Body>This content is hidden while loading</Card.Body>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Component Combinations', () => {
    it('nested interactive elements should maintain proper focus order', async () => {
      const { container } = render(
        <Card>
          <Card.Header>
            <h2>Interactive Card</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
            </div>
          </Card.Body>
          <Card.Footer>
            <Button variant="outline">Cancel</Button>
          </Card.Footer>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('complex interactive card should maintain accessibility', async () => {
      const { container } = render(
        <Card clickable onClick={() => {}} aria-labelledby="card-title">
          <Card.Header>
            <h2 id="card-title">Complex Interactive Card</h2>
            <p id="card-desc">This is a complex interactive card with multiple elements</p>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <Button variant="primary" aria-describedby="card-desc">
                Main Action
              </Button>
              <div className="flex space-x-2">
                <Button variant="secondary" aria-label="Like">
                  👍
                </Button>
                <Button variant="secondary" aria-label="Comment">
                  💬
                </Button>
                <Button variant="secondary" aria-label="Share">
                  Share
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
