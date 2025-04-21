import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { Toast, Alert, Modal, LoadingSpinner } from '../';

describe('Feedback Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Toast', () => {
    const defaultProps = {
      message: 'Test message',
      type: 'success' as const,
      onClose: vi.fn(),
    };

    it('renders correctly', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('auto-closes after duration', async () => {
      render(<Toast {...defaultProps} duration={3000} />);

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('can be closed manually', async () => {
      render(<Toast {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('renders different types correctly', () => {
      const { rerender } = render(<Toast {...defaultProps} type="success" />);
      expect(screen.getByRole('alert')).toHaveClass('success');

      rerender(<Toast {...defaultProps} type="error" />);
      expect(screen.getByRole('alert')).toHaveClass('error');

      rerender(<Toast {...defaultProps} type="warning" />);
      expect(screen.getByRole('alert')).toHaveClass('warning');

      rerender(<Toast {...defaultProps} type="info" />);
      expect(screen.getByRole('alert')).toHaveClass('info');
    });
  });

  describe('Alert', () => {
    const defaultProps = {
      title: 'Alert Title',
      message: 'Alert message',
      type: 'info' as const,
      onClose: vi.fn(),
    };

    it('renders correctly', () => {
      render(<Alert {...defaultProps} />);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('can be dismissed if dismissible', async () => {
      render(<Alert {...defaultProps} dismissible />);

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('renders different types with appropriate styling', () => {
      const types = ['info', 'success', 'warning', 'error'] as const;

      types.forEach(type => {
        const { container, unmount } = render(<Alert {...defaultProps} type={type} />);
        expect(container.firstChild).toHaveClass(type);
        unmount();
      });
    });

    it('supports custom actions', async () => {
      const onAction = vi.fn();
      render(<Alert {...defaultProps} actions={[{ label: 'Confirm', onClick: onAction }]} />);

      await user.click(screen.getByText('Confirm'));
      expect(onAction).toHaveBeenCalled();
    });
  });

  describe('Modal', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      title: 'Modal Title',
    };

    it('renders when open', () => {
      render(
        <Modal {...defaultProps}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <Modal {...defaultProps} isOpen={false}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.queryByText('Modal Title')).not.toBeInTheDocument();
    });

    it('closes on overlay click', async () => {
      render(
        <Modal {...defaultProps}>
          <div>Modal content</div>
        </Modal>
      );

      await user.click(screen.getByTestId('modal-overlay'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('closes on escape key', async () => {
      render(
        <Modal {...defaultProps}>
          <div>Modal content</div>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('prevents closing when closeOnOverlayClick is false', async () => {
      render(
        <Modal {...defaultProps} closeOnOverlayClick={false}>
          <div>Modal content</div>
        </Modal>
      );

      await user.click(screen.getByTestId('modal-overlay'));
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('traps focus within modal', async () => {
      render(
        <Modal {...defaultProps}>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </Modal>
      );

      await user.tab();
      expect(screen.getByText('First')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Second')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Third')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('First')).toHaveFocus();
    });
  });

  describe('LoadingSpinner', () => {
    it('renders correctly', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with custom size', () => {
      render(<LoadingSpinner size="large" />);
      expect(screen.getByRole('status')).toHaveClass('large');
    });

    it('renders with custom color', () => {
      render(<LoadingSpinner color="primary" />);
      expect(screen.getByRole('status')).toHaveClass('primary');
    });

    it('renders with label when provided', () => {
      render(<LoadingSpinner label="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('supports overlay mode', () => {
      render(<LoadingSpinner overlay />);
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('Toast meets accessibility standards', async () => {
      const { container } = render(
        <Toast message="Test message" type="success" onClose={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Alert meets accessibility standards', async () => {
      const { container } = render(
        <Alert title="Test Alert" message="Test message" type="info" onClose={() => {}} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Modal meets accessibility standards', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <div>Modal content</div>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('LoadingSpinner meets accessibility standards', async () => {
      const { container } = render(<LoadingSpinner label="Loading..." />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
