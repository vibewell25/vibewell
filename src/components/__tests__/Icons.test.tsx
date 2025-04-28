import { render } from '@testing-library/react';
import { Icons } from '../icons';

describe('Icons', () => {
  it('renders standard icons correctly', () => {
    const { container } = render(
      <div>
        <Icons.BellIcon data-testid="bell-icon" />
        <Icons.UserIcon data-testid="user-icon" />
        <Icons.HomeIcon data-testid="home-icon" />
      </div>,
    );
    expect(container.querySelector('[data-testid="bell-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="user-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="home-icon"]')).toBeInTheDocument();
  });

  it('renders custom icons correctly', () => {
    const { container } = render(
      <div>
        <Icons.logo data-testid="logo-icon" />
        <Icons.google data-testid="google-icon" />
        <Icons.facebook data-testid="facebook-icon" />
      </div>,
    );
    expect(container.querySelector('[data-testid="logo-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="google-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="facebook-icon"]')).toBeInTheDocument();
  });

  it('passes size props correctly', () => {
    const { container } = render(<Icons.UserIcon size={32} data-testid="sized-icon" />);
    const icon = container.querySelector('[data-testid="sized-icon"]');
    expect(icon).toHaveAttribute('width', '32');
    expect(icon).toHaveAttribute('height', '32');
  });

  it('passes className props correctly', () => {
    const { container } = render(
      <Icons.UserIcon className="test-class" data-testid="class-icon" />,
    );
    const icon = container.querySelector('[data-testid="class-icon"]');
    expect(icon).toHaveClass('test-class');
  });

  it('renders solid variant icons', () => {
    const { container } = render(
      <div>
        <Icons.UserSolid data-testid="user-solid" />
        <Icons.HomeSolid data-testid="home-solid" />
      </div>,
    );
    expect(container.querySelector('[data-testid="user-solid"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="home-solid"]')).toBeInTheDocument();
  });

  it('renders spinner icon', () => {
    const { container } = render(<Icons.spinner data-testid="spinner-icon" />);
    expect(container.querySelector('[data-testid="spinner-icon"]')).toBeInTheDocument();
  });

  it('renders correctly with various props', () => {
    const { container } = render(
      <Icons.UserIcon
        className="test-class"
        size={24}
        stroke="red"
        fill="blue"
        data-testid="multi-prop-icon"
      />,
    );
    const icon = container.querySelector('[data-testid="multi-prop-icon"]');
    expect(icon).toHaveClass('test-class');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
    expect(icon).toHaveAttribute('stroke', 'red');
    expect(icon).toHaveAttribute('fill', 'blue');
  });
});
