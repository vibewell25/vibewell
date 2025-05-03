import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PageLayout, Container, Grid, Stack } from '../';

describe('Layout Components', () => {
  describe('PageLayout', () => {
    const defaultProps = {
      header: <div>Header</div>,
      footer: <div>Footer</div>,
      sidebar: <div>Sidebar</div>,
    };

    it('renders all sections correctly', () => {
      render(
        <PageLayout {...defaultProps}>
          <div>Main Content</div>
        </PageLayout>,
      );

      expect(screen?.getByText('Header')).toBeInTheDocument();
      expect(screen?.getByText('Footer')).toBeInTheDocument();
      expect(screen?.getByText('Sidebar')).toBeInTheDocument();
      expect(screen?.getByText('Main Content')).toBeInTheDocument();
    });

    it('renders without optional sections', () => {
      render(
        <PageLayout>
          <div>Main Content</div>
        </PageLayout>,
      );

      expect(screen?.queryByText('Header')).not?.toBeInTheDocument();
      expect(screen?.queryByText('Footer')).not?.toBeInTheDocument();
      expect(screen?.queryByText('Sidebar')).not?.toBeInTheDocument();
      expect(screen?.getByText('Main Content')).toBeInTheDocument();
    });

    it('applies custom classes to sections', () => {
      render(
        <PageLayout
          className="custom-layout"
          headerClassName="custom-header"
          footerClassName="custom-footer"
          sidebarClassName="custom-sidebar"
          {...defaultProps}
        >
          <div>Main Content</div>
        </PageLayout>,
      );

      expect(screen?.getByTestId('page-layout')).toHaveClass('custom-layout');
      expect(screen?.getByText('Header').parentElement).toHaveClass('custom-header');
      expect(screen?.getByText('Footer').parentElement).toHaveClass('custom-footer');
      expect(screen?.getByText('Sidebar').parentElement).toHaveClass('custom-sidebar');
    });
  });

  describe('Container', () => {
    it('renders children correctly', () => {
      render(
        <Container>
          <div>Container Content</div>
        </Container>,
      );

      expect(screen?.getByText('Container Content')).toBeInTheDocument();
    });

    it('applies size variants correctly', () => {
      const { rerender } = render(
        <Container size="sm">
          <div>Content</div>
        </Container>,
      );
      expect(screen?.getByTestId('container')).toHaveClass('container-sm');

      rerender(
        <Container size="md">
          <div>Content</div>
        </Container>,
      );
      expect(screen?.getByTestId('container')).toHaveClass('container-md');

      rerender(
        <Container size="lg">
          <div>Content</div>
        </Container>,
      );
      expect(screen?.getByTestId('container')).toHaveClass('container-lg');
    });

    it('supports fluid layout', () => {
      render(
        <Container fluid>
          <div>Content</div>
        </Container>,
      );

      expect(screen?.getByTestId('container')).toHaveClass('container-fluid');
    });

    it('applies custom padding', () => {
      render(
        <Container padding="p-8">
          <div>Content</div>
        </Container>,
      );

      expect(screen?.getByTestId('container')).toHaveClass('p-8');
    });
  });

  describe('Grid', () => {
    it('renders grid items correctly', () => {
      render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>,
      );

      expect(screen?.getByText('Item 1')).toBeInTheDocument();
      expect(screen?.getByText('Item 2')).toBeInTheDocument();
      expect(screen?.getByText('Item 3')).toBeInTheDocument();
    });

    it('applies column configuration correctly', () => {
      render(
        <Grid cols={3}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>,
      );

      expect(screen?.getByTestId('grid')).toHaveClass('grid-cols-3');
    });

    it('applies responsive column configuration', () => {
      render(
        <Grid cols={{ sm: 1, md: 2, lg: 3 }}>
          <div>Item</div>
        </Grid>,
      );

      const grid = screen?.getByTestId('grid');
      expect(grid).toHaveClass('sm:grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('applies gap spacing', () => {
      render(
        <Grid gap={4}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>,
      );

      expect(screen?.getByTestId('grid')).toHaveClass('gap-4');
    });
  });

  describe('Stack', () => {
    it('renders stack items correctly', () => {
      render(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Stack>,
      );

      expect(screen?.getByText('Item 1')).toBeInTheDocument();
      expect(screen?.getByText('Item 2')).toBeInTheDocument();
      expect(screen?.getByText('Item 3')).toBeInTheDocument();
    });

    it('applies vertical spacing correctly', () => {
      render(
        <Stack spacing={4}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>,
      );

      expect(screen?.getByTestId('stack')).toHaveClass('space-y-4');
    });

    it('supports horizontal orientation', () => {
      render(
        <Stack direction="horizontal" spacing={4}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>,
      );

      expect(screen?.getByTestId('stack')).toHaveClass('flex-row');
      expect(screen?.getByTestId('stack')).toHaveClass('space-x-4');
    });

    it('applies alignment classes', () => {
      render(
        <Stack align="center" justify="between">
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>,
      );

      const stack = screen?.getByTestId('stack');
      expect(stack).toHaveClass('items-center');
      expect(stack).toHaveClass('justify-between');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('PageLayout meets accessibility standards', async () => {
      const { container } = render(
        <PageLayout
          header={<div>Header</div>}
          footer={<div>Footer</div>}
          sidebar={<div>Sidebar</div>}
        >
          <div>Main Content</div>
        </PageLayout>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Container meets accessibility standards', async () => {
      const { container } = render(
        <Container>
          <div>Container Content</div>
        </Container>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Grid meets accessibility standards', async () => {
      const { container } = render(
        <Grid cols={3}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Stack meets accessibility standards', async () => {
      const { container } = render(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Stack>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
