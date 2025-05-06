import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple component for testing
const TestComponent = ({ text }: { text: string }) => {
  return <div data-testid="test-component">{text}</div>;
};

describe('Simple Test', () => {
  it('renders text correctly', () => {
    render(<TestComponent text="Hello, world!" />);
    expect(screen.getByTestId('test-component')).toHaveTextContent('Hello, world!');
  });
}); 