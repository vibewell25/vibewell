import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createTestRunner } from '@/utils/createTestRunner';

describe('Component Performance Tests', () => {
  const runner = createTestRunner({
    performanceThreshold: 50, // 50ms threshold for individual components
  });

  describe('Button Component', () => {
    it('renders efficiently with default props', async () => {
      const performance = await runner.measurePerformance(
        <Button>Click me</Button>
      );
      expect(performance.renderTime).toBeLessThan(20);
      expect(performance.hydrationTime).toBeLessThan(30);
      expect(performance.totalTime).toBeLessThan(50);
      expect(performance.passes).toBe(true);
    });

    it('renders efficiently with all variants', async () => {
      const variants = ['default', 'destructive', 'outline', 'ghost'];
      
      for (const variant of variants) {
        const performance = await runner.measurePerformance(
          <Button variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        );
        expect(performance.totalTime).toBeLessThan(50);
        expect(performance.passes).toBe(true);
      }
    });

    it('renders efficiently with different sizes', async () => {
      const sizes = ['default', 'sm', 'lg'];
      
      for (const size of sizes) {
        const performance = await runner.measurePerformance(
          <Button size={size}>
            Size: {size}
          </Button>
        );
        expect(performance.totalTime).toBeLessThan(50);
        expect(performance.passes).toBe(true);
      }
    });

    it('handles rapid re-renders efficiently', async () => {
      const iterations = 10;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const { unmount } = runner.render(<Button>Click me</Button>);
        unmount();
      }
      const totalTime = performance.now() - startTime;
      expect(totalTime / iterations).toBeLessThan(20);
    });
  });

  describe('Card Component', () => {
    it('renders efficiently with minimal content', async () => {
      const performance = await runner.measurePerformance(
        <Card>
          <p>Simple content</p>
        </Card>
      );
      expect(performance.renderTime).toBeLessThan(20);
      expect(performance.hydrationTime).toBeLessThan(30);
      expect(performance.totalTime).toBeLessThan(50);
      expect(performance.passes).toBe(true);
    });

    it('renders efficiently with complex content', async () => {
      const performance = await runner.measurePerformance(
        <Card>
          <div>
            <h2>Complex Card</h2>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <ul>
              {Array.from({ length: 10 }).map((_, i) => (
                <li key={i}>List item {i + 1}</li>
              ))}
            </ul>
            <Button>Action</Button>
          </div>
        </Card>
      );
      expect(performance.totalTime).toBeLessThan(100); // Higher threshold for complex content
      expect(performance.passes).toBe(true);
    });

    it('handles nested cards efficiently', async () => {
      const performance = await runner.measurePerformance(
        <Card>
          <Card>
            <Card>
              <p>Deeply nested content</p>
            </Card>
          </Card>
        </Card>
      );
      expect(performance.totalTime).toBeLessThan(75); // Adjusted threshold for nested components
      expect(performance.passes).toBe(true);
    });
  });

  describe('Memory Usage', () => {
    it('maintains stable memory usage during repeated renders', async () => {
      const iterations = 100;
      const memoryMeasurements: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const performance = await runner.measurePerformance(
          <div>
            <Button>Button {i}</Button>
            <Card>Card {i}</Card>
          </div>
        );
        memoryMeasurements.push(performance.memoryUsage);
      }
      
      // Calculate memory growth
      const memoryGrowth = memoryMeasurements[memoryMeasurements.length - 1] - memoryMeasurements[0];
      const averageGrowthPerIteration = memoryGrowth / iterations;
      
      // Ensure memory growth is minimal
      expect(averageGrowthPerIteration).toBeLessThan(1024); // Less than 1KB per iteration
    });
  });

  describe('Layout Stability', () => {
    it('maintains stable layout during updates', async () => {
      const { container } = runner.render(
        <div style={{ width: '300px', height: '200px' }}>
          <Card>
            <Button>Test Button</Button>
          </Card>
        </div>
      );
      const initialRect = container.getBoundingClientRect();
      
      // Trigger updates
      for (let i = 0; i < 10; i++) {
        runner.render(
          <div style={{ width: '300px', height: '200px' }}>
            <Card>
              <Button>Updated Button {i}</Button>
            </Card>
          </div>
        );
      }
      const finalRect = container.getBoundingClientRect();
      
      // Check for layout stability
      expect(finalRect.width).toBe(initialRect.width);
      expect(finalRect.height).toBe(initialRect.height);
    });
  });
});
