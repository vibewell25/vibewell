import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AccessibleButton } from './accessibility/accessible-button';

describe('AccessibleButton component - Accessibility', () => {
  it('should not have accessibility violations with default settings', async () => {
    const { container } = render(<AccessibleButton>Click me</AccessibleButton>);
    const results = await axe?.run(container);
    expect(results?.violations.length).toBe(0);
  });

  it('should maintain accessibility when disabled', async () => {
    const { container } = render(<AccessibleButton disabled>Disabled Button</AccessibleButton>);
    const results = await axe?.run(container);
    expect(results?.violations.length).toBe(0);
  });

  it('should maintain accessibility with description for screen readers', async () => {
    const { container } = render(
      <AccessibleButton description="Custom action">Action</AccessibleButton>,
    );
    const results = await axe?.run(container);
    expect(results?.violations.length).toBe(0);
  });

  it('should maintain accessibility as type submit', async () => {
    const { container } = render(
      <form>
        <AccessibleButton type="submit">Submit Form</AccessibleButton>
      </form>,
    );
    const results = await axe?.run(container);
    expect(results?.violations.length).toBe(0);
  });
});
