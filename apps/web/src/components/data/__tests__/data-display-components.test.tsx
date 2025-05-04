import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { Table, Chart, List, Card } from '../';

// Mock data
const mockTableData = [
  { id: 1, name: 'John Doe', age: 30, city: 'New York' },
  { id: 2, name: 'Jane Smith', age: 25, city: 'Los Angeles' },
  { id: 3, name: 'Bob Johnson', age: 35, city: 'Chicago' },
];

const mockChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Sales',
      data: [30, 45, 60],
    },
  ],
};

const mockListData = [
  { id: 1, title: 'Item 1', description: 'Description 1' },
  { id: 2, title: 'Item 2', description: 'Description 2' },
  { id: 3, title: 'Item 3', description: 'Description 3' },
];

describe('Data Display Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Table Component', () => {
    it('renders table with data', () => {
      render(<Table data={mockTableData} columns={['name', 'age', 'city']} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
    });

    it('supports sorting', async () => {
      render(<Table data={mockTableData} columns={['name', 'age', 'city']} sortable={true} />);

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      const cells = screen.getAllByRole('cell');
      expect(cells[0]).toHaveTextContent('Bob Johnson');
    });

    it('handles pagination', async () => {
      render(
        <Table
          data={mockTableData}
          columns={['name', 'age', 'city']}
          pagination={true}
          itemsPerPage={2}
        />,
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();

      await user.click(screen.getByText('Next'));
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('supports row selection', async () => {
      const onSelect = vi.fn();
      render(
        <Table
          data={mockTableData}
          columns={['name', 'age', 'city']}
          selectable={true}
          onRowSelect={onSelect}
        />,
      );

      const firstRow = screen.getByText('John Doe').closest('tr');
      await user.click(firstRow);
      expect(onSelect).toHaveBeenCalledWith(mockTableData[0]);
    });
  });

  describe('Chart Component', () => {
    it('renders chart with data', () => {
      render(<Chart data={mockChartData} type="line" options={{ responsive: true }} />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByText('Sales')).toBeInTheDocument();
    });

    it('updates when data changes', async () => {
      const { rerender } = render(
        <Chart data={mockChartData} type="line" options={{ responsive: true }} />,
      );

      const updatedData = {
        ...mockChartData,
        datasets: [{ ...mockChartData.datasets[0], data: [40, 55, 70] }],
      };

      rerender(<Chart data={updatedData} type="line" options={{ responsive: true }} />);

      const chart = screen.getByTestId('chart-container');
      expect(chart).toHaveAttribute('data-updated', 'true');
    });

    it('supports different chart types', () => {
      const { rerender } = render(
        <Chart data={mockChartData} type="line" options={{ responsive: true }} />,
      );

      expect(screen.getByTestId('chart-container')).toHaveAttribute('data-type', 'line');

      rerender(<Chart data={mockChartData} type="bar" options={{ responsive: true }} />);

      expect(screen.getByTestId('chart-container')).toHaveAttribute('data-type', 'bar');
    });

    it('handles loading and error states', async () => {
      render(<Chart data={mockChartData} type="line" isLoading={true} />);

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument();

      const { rerender } = render(
        <Chart data={mockChartData} type="line" error="Failed to load chart data" />,
      );

      expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    });
  });

  describe('List Component', () => {
    it('renders list items', () => {
      render(<List items={mockListData} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('supports custom item rendering', () => {
      render(
        <List
          items={mockListData}
          renderItem={(item) => (
            <div key={item.id} data-testid="custom-item">
              {item.title.toUpperCase()}
            </div>
          )}
        />,
      );

      expect(screen.getByText('ITEM 1')).toBeInTheDocument();
      expect(screen.getAllByTestId('custom-item')).toHaveLength(3);
    });

    it('handles item selection', async () => {
      const onSelect = vi.fn();
      render(<List items={mockListData} onItemSelect={onSelect} />);

      await user.click(screen.getByText('Item 1'));
      expect(onSelect).toHaveBeenCalledWith(mockListData[0]);
    });

    it('supports filtering', () => {
      render(<List items={mockListData} filter="2" filterKey="title" />);

      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.queryByText('Item 3')).not.toBeInTheDocument();
    });
  });

  describe('Card Component', () => {
    it('renders card content', () => {
      render(<Card title="Test Card" subtitle="Subtitle" content="Card content" />);

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('supports custom header and footer', () => {
      render(
        <Card
          header={<div data-testid="custom-header">Custom Header</div>}
          footer={<div data-testid="custom-footer">Custom Footer</div>}
        >
          Content
        </Card>,
      );

      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
    });

    it('handles click events', async () => {
      const onClick = vi.fn();
      render(<Card title="Clickable Card" onClick={onClick} />);

      await user.click(screen.getByText('Clickable Card'));
      expect(onClick).toHaveBeenCalled();
    });

    it('supports different variants', () => {
      render(<Card title="Card" variant="outlined" />);

      expect(screen.getByTestId('card')).toHaveClass('card-outlined');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('Table meets accessibility standards', async () => {
      const { container } = render(
        <Table data={mockTableData} columns={['name', 'age', 'city']} />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Chart meets accessibility standards', async () => {
      const { container } = render(<Chart data={mockChartData} type="line" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('List meets accessibility standards', async () => {
      const { container } = render(<List items={mockListData} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Card meets accessibility standards', async () => {
      const { container } = render(<Card title="Accessible Card" content="Content" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Table has proper ARIA labels', () => {
      render(
        <Table
          data={mockTableData}
          columns={['name', 'age', 'city']}
          aria-label="User Data Table"
        />,
      );
      expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'User Data Table');
    });

    it('Chart has proper ARIA descriptions', () => {
      render(<Chart data={mockChartData} type="line" aria-label="Sales Chart" />);
      expect(screen.getByTestId('chart-container')).toHaveAttribute('aria-label', 'Sales Chart');
    });
  });
});
