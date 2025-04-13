import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Component', () => {
  it('renders card with content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    );

    // Check that all parts of the card are rendered
    expect(screen.getByText('Card Title')).toBeTruthy();
    expect(screen.getByText('Card Description')).toBeTruthy();
    expect(screen.getByText('Card Content')).toBeTruthy();
    expect(screen.getByText('Card Footer')).toBeTruthy();
  });

  it('applies additional className to Card component', () => {
    const { container } = render(
      <Card className="custom-class">
        <CardContent>Content</CardContent>
      </Card>
    );

    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-class');
  });

  it('renders with custom data attributes', () => {
    render(
      <Card data-testid="test-card">
        <CardContent>Content</CardContent>
      </Card>
    );

    expect(screen.getByTestId('test-card')).toBeTruthy();
  });

  it('renders card with minimal content', () => {
    render(
      <Card>
        <CardContent>Minimal Content</CardContent>
      </Card>
    );

    expect(screen.getByText('Minimal Content')).toBeTruthy();
  });

  it('renders nested cards', () => {
    render(
      <Card>
        <CardContent>
          <Card>
            <CardContent>Nested Card</CardContent>
          </Card>
        </CardContent>
      </Card>
    );

    expect(screen.getByText('Nested Card')).toBeTruthy();
  });
}); 