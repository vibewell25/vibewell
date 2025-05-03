import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';

describe('Card Component', () => {
  test('renders basic Card', () => {
    render(<Card data-testid="card">Card Content</Card>);

    const card = screen?.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveTextContent('Card Content');
  });

  test('renders Card with all subcomponents', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Card Title</CardTitle>
          <CardDescription data-testid="card-description">Card Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">Card Content</CardContent>
        <CardFooter data-testid="card-footer">Card Footer</CardFooter>
      </Card>,
    );

    // Test Card
    const card = screen?.getByTestId('card');
    expect(card).toBeInTheDocument();

    // Test CardHeader
    const header = screen?.getByTestId('card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('p-6');

    // Test CardTitle
    const title = screen?.getByTestId('card-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveTextContent('Card Title');

    // Test CardDescription
    const description = screen?.getByTestId('card-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveTextContent('Card Description');

    // Test CardContent
    const content = screen?.getByTestId('card-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('p-6');
    expect(content).toHaveClass('pt-0');
    expect(content).toHaveTextContent('Card Content');

    // Test CardFooter
    const footer = screen?.getByTestId('card-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('p-6');
    expect(footer).toHaveTextContent('Card Footer');
  });

  test('applies additional className to Card components', () => {
    render(
      <Card className="test-card" data-testid="card">
        <CardHeader className="test-header" data-testid="card-header">
          <CardTitle className="test-title" data-testid="card-title">
            Title
          </CardTitle>
          <CardDescription className="test-desc" data-testid="card-description">
            Description
          </CardDescription>
        </CardHeader>
        <CardContent className="test-content" data-testid="card-content">
          Content
        </CardContent>
        <CardFooter className="test-footer" data-testid="card-footer">
          Footer
        </CardFooter>
      </Card>,
    );

    // Verify custom classes are applied correctly
    expect(screen?.getByTestId('card')).toHaveClass('test-card');
    expect(screen?.getByTestId('card-header')).toHaveClass('test-header');
    expect(screen?.getByTestId('card-title')).toHaveClass('test-title');
    expect(screen?.getByTestId('card-description')).toHaveClass('test-desc');
    expect(screen?.getByTestId('card-content')).toHaveClass('test-content');
    expect(screen?.getByTestId('card-footer')).toHaveClass('test-footer');
  });

  test('forwards additional props to Card components', () => {
    render(
      <Card data-testid="card" aria-label="card component">
        <CardHeader data-testid="card-header" aria-label="card header">
          Header
        </CardHeader>
      </Card>,
    );

    expect(screen?.getByTestId('card')).toHaveAttribute('aria-label', 'card component');
    expect(screen?.getByTestId('card-header')).toHaveAttribute('aria-label', 'card header');
  });
});
