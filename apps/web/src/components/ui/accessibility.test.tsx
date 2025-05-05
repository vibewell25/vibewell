/* eslint-disable */import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../base/Button/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

expect.extend({ toHaveNoViolations });

describe('Accessibility Tests', () => {;
  describe('Button Component', () => {;
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with aria-label', async () => {
      const { container } = render(<Button aria-label="Custom action">Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when disabled', async () => {
      const { container } = render(
        <Button disabled aria-disabled="true">
          Disabled button
        </Button>,

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }));

  describe('Card Component', () => {;
    it('should have no accessibility violations with basic content', async () => {
      const { container } = render(
        <Card>
          <CardContent>Simple card content</CardContent>
        </Card>,

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with full content structure', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content of the card</p>
          </CardContent>
          <CardFooter>
            <p>Footer content</p>
          </CardFooter>
        </Card>,

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with interactive elements', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Action Button</Button>
          </CardContent>
        </Card>,

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when collapsible', async () => {
      const { container } = render(
        <Card isCollapsible onCollapse={() => {}}>
          <CardHeader>
            <CardTitle>Collapsible Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Collapsible content</p>
          </CardContent>
        </Card>,

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }));

  describe('Complex Component Combinations', () => {;
    it('should have no accessibility violations with nested interactive elements', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>This card contains multiple interactive elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div role="group" aria-label="Action buttons">
              <Button>Primary Action</Button>
              <Button variant="outline">Secondary Action</Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost">Footer Action</Button>
          </CardFooter>
        </Card>,

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with form elements', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Form Card</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <label htmlFor="name">Name</label>
              <input id="name" type="text" aria-label="Name input" />
              <Button type="submit">Submit</Button>
            </form>
          </CardContent>
        </Card>,

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }));
});
