import React from 'react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  // Rendering tests
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      renderWithProviders(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
it('renders with different variants', () => {
      const { rerender } = renderWithProviders(
        <Button variant="default">Default</Button>
expect(screen.getByRole('button')).toHaveClass('bg-primary');

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
it('renders with different sizes', () => {
      const { rerender } = renderWithProviders(<Button size="default">Default</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('h-10 px-4 py-2');

      rerender(<Button size="sm">Small</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('h-9 px-3');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('h-11 px-8');
// Interaction tests
  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
it('is disabled when disabled prop is true', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
it('handles loading state correctly', () => {
      renderWithProviders(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
// Accessibility tests
  describe('Accessibility', () => {
    it('meets accessibility guidelines', async () => {
      await testAccessibility(<Button>Accessible Button</Button>);
it('has correct ARIA attributes', () => {
      renderWithProviders(
        <Button aria-label="Custom Label" aria-describedby="desc">
          Button
        </Button>
const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
      expect(button).toHaveAttribute('aria-describedby', 'desc');
// Performance tests
  describe('Performance', () => {
    it('renders efficiently', async () => {
      const performance = await measurePerformance(<Button>Performance Test</Button>);
      expect(performance.average).toBeLessThan(50); // 50ms threshold
// Edge cases
  describe('Edge Cases', () => {
    it('handles long text content', () => {
      const longText = 'This is a very long button text that might cause issues with layout';
      renderWithProviders(<Button>{longText}</Button>);
      expect(screen.getByText(longText)).toBeInTheDocument();
it('handles empty content', () => {
      renderWithProviders(<Button />);
      expect(screen.getByRole('button')).toBeInTheDocument();
it('handles special characters', () => {
      const specialChars = '!@#$%^&*()_+';
      renderWithProviders(<Button>{specialChars}</Button>);
      expect(screen.getByText(specialChars)).toBeInTheDocument();
