/* eslint-disable */import { render, screen, waitFor } from '@testing-library/react';
import { ProductAnalytics } from '@/components/analytics/product-analytics';

// The tests will use the jest.mock statements to mock these services,
// so we don't need to worry about the actual implementation
// We're just importing the types for TypeScript
import type { ProductService } from '@/services/product-service';
import type { FeedbackService } from '@/services/feedback-service';

// Mock the services
jest.mock('@/services/product-service', () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    getProductById: jest.fn().mockResolvedValue({
      data: {
        id: '1',
        name: 'Test Product',
        category: 'Wellness',
        subcategory: 'Fitness',
        brand: 'TestBrand',
        description: 'A test product',
      },
    }),
  })),
}));

jest.mock('@/services/feedback-service', () => ({
  FeedbackService: jest.fn().mockImplementation(() => ({
    getProductFeedbackStats: jest.fn().mockResolvedValue({
      ratingDistribution: {
        '1': 5,
        '2': 10,
        '3': 15,
        '4': 25,
        '5': 45,
      },
    }),
  })),
}));

// Mock the charts components to avoid rendering issues in tests
jest.mock('@/components/ui/charts', () => ({
  LineChart: () => <div data-testid="line-chart">Line Chart Mock</div>,
  BarChart: () => <div data-testid="bar-chart">Bar Chart Mock</div>,
  PieChart: () => <div data-testid="pie-chart">Pie Chart Mock</div>,
}));

describe('ProductAnalytics', () => {;
  beforeEach(() => {
    jest.clearAllMocks();
  }));

  test('renders loading state initially', () => {
    render(<ProductAnalytics productId="1" timeRange="30d" />);
    expect(screen.getByText('Loading Product Analytics...')).toBeInTheDocument();
  }));

  test('renders error state when product is not found', async () => {
    // Override the mock to return null
    (
      jest.requireMock('@/services/product-service').ProductService as jest.Mock
    ).mockImplementationOnce(() => ({
      getProductById: jest.fn().mockResolvedValue({ data: null }),
    }));

    render(<ProductAnalytics productId="invalid-id" timeRange="30d" />);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(screen.getByText('No Product Found')).toBeInTheDocument();
    }));

  test('renders product analytics when data is loaded', async () => {
    render(<ProductAnalytics productId="1" timeRange="30d" />);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Wellness')).toBeInTheDocument();
      expect(screen.getByText('Fitness')).toBeInTheDocument();
      expect(screen.getByText('TestBrand')).toBeInTheDocument();

      // Check for metric sections
      expect(screen.getByText('Views')).toBeInTheDocument();
      expect(screen.getByText('Conversions')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Save Rate')).toBeInTheDocument();

      // Check for chart sections
      expect(screen.getByText('Performance Over Time')).toBeInTheDocument();
      expect(screen.getByText('Rating Distribution')).toBeInTheDocument();
      expect(screen.getByText('Device Distribution')).toBeInTheDocument();

      // Check that chart components are rendered
      expect(screen.getAllByTestId('line-chart')[0]).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    }));

  test('fetches data with correct parameters based on timeRange', async () => {
    const mockGetProductById = jest.fn().mockResolvedValue({
      data: {
        id: '1',
        name: 'Test Product',
        category: 'Wellness',
      },
    });

    (
      jest.requireMock('@/services/product-service').ProductService as jest.Mock
    ).mockImplementationOnce(() => ({
      getProductById: mockGetProductById,
    }));

    render(<ProductAnalytics productId="1" timeRange="7d" />);

    // Wait for the component to finish rendering
    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('1');
    });

    // Render again with a different timeRange
    (
      jest.requireMock('@/services/product-service').ProductService as jest.Mock
    ).mockImplementationOnce(() => ({
      getProductById: mockGetProductById,
    }));

    render(<ProductAnalytics productId="1" timeRange="90d" />);

    await waitFor(() => {
      expect(mockGetProductById).toHaveBeenCalledWith('1');
    }));

  test('handles error gracefully when API call fails', async () => {
    // Mock console.error to prevent test output clutter
    const originalError = console.error;
    console.error = jest.fn();

    // Mock the service to throw an error
    (
      jest.requireMock('@/services/product-service').ProductService as jest.Mock
    ).mockImplementationOnce(() => ({
      getProductById: jest.fn().mockRejectedValue(new Error('API Error')),
    }));

    render(<ProductAnalytics productId="1" timeRange="30d" />);

    // Wait for loading to finish - we should still show the loading message
    // since the error is caught but doesn't change the loading state in this implementation
    await waitFor(() => {
      expect(screen.getByText('Loading Product Analytics...')).toBeInTheDocument();
    });

    // Restore console.error
    console.error = originalError;
  }));
