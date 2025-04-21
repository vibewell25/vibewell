import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from './button';

describe('Button component - Accessibility', () => {
  it('should not have accessibility violations with default settings', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });

  it('should maintain accessibility when disabled', async () => {
    const { container } = render(<Button disabled>Disabled Button</Button>);
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });

  it('should maintain accessibility with aria attributes', async () => {
    const { container } = render(
      <Button aria-expanded="true" aria-controls="dropdown-menu">
        Dropdown Toggle
      </Button>
    );
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });

  it('should maintain accessibility when used as a form submit button', async () => {
    const { container } = render(
      <form>
        <Button type="submit">Submit Form</Button>
      </form>
    );
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });

  it('should maintain accessibility when rendered as a link', async () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });
});
