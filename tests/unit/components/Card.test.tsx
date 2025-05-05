import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
from '@/components/ui/Card';
import {
  renderWithProviders,
  testAccessibility,
  measurePerformance,
  screen,
from '../../utils/test-utils';

describe('Card Component', () => {
  // Rendering tests
  describe('Rendering', () => {
    it('renders a basic card correctly', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
it('renders with custom className', () => {
      renderWithProviders(
        <Card className="custom-class">
          <CardContent>Content</CardContent>
        </Card>
expect(screen.getByText('Content').parentElement).toHaveClass('custom-class');
it('renders nested content correctly', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>
              <span data-testid="nested">Nested Content</span>
            </CardTitle>
          </CardHeader>
        </Card>
expect(screen.getByTestId('nested')).toBeInTheDocument();
// Accessibility tests
  describe('Accessibility', () => {
    it('meets accessibility guidelines', async () => {
      await testAccessibility(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>This is an accessible card component</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
it('has correct heading structure', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle as="h2">Heading Level 2</CardTitle>
          </CardHeader>
        </Card>
expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
it('maintains correct ARIA landmarks', () => {
      renderWithProviders(
        <Card role="region" aria-label="Test Card">
          <CardContent>Content</CardContent>
        </Card>
expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Test Card');
// Performance tests
  describe('Performance', () => {
    it('renders efficiently', async () => {
      const performance = await measurePerformance(
        <Card>
          <CardHeader>
            <CardTitle>Performance Test</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
expect(performance.average).toBeLessThan(50); // 50ms threshold
// Edge cases
  describe('Edge Cases', () => {
    it('handles empty card', () => {
      renderWithProviders(<Card />);
      expect(screen.getByRole('article')).toBeInTheDocument();
it('handles long content without breaking layout', () => {
      const longText = 'a'.repeat(1000);
      renderWithProviders(
        <Card>
          <CardContent>{longText}</CardContent>
        </Card>
expect(screen.getByText(longText)).toBeInTheDocument();
it('handles deeply nested content', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>
              <div>
                <span>
                  <strong data-testid="deep-nested">Deep</strong>
                </span>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
expect(screen.getByTestId('deep-nested')).toBeInTheDocument();
// Component composition tests
  describe('Component Composition', () => {
    it('works with all sub-components', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
['Title', 'Description', 'Content', 'Footer'].forEach(text => {
        expect(screen.getByText(text)).toBeInTheDocument();
it('maintains correct structure with partial components', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content Only</CardContent>
        </Card>
expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.getByText('Content Only')).toBeInTheDocument();
      expect(screen.queryByRole('footer')).not.toBeInTheDocument();
