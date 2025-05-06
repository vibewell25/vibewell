/* eslint-disable */import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { SearchBar, SearchResults, Filters, AutoComplete } from '../';

// Mock data
const mockSearchResults = [
  { id: 1, title: 'Result 1', description: 'Description 1' },
  { id: 2, title: 'Result 2', description: 'Description 2' },
  { id: 3, title: 'Result 3', description: 'Description 3' },
];

const mockFilters = {
  categories: ['All', 'Category 1', 'Category 2'],
  sortOptions: ['Relevance', 'Date', 'Name'],
  dateRanges: ['Any time', 'Past week', 'Past month', 'Past year'],
};

const mockSuggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3', 'another suggestion'];

describe('Search Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SearchBar', () => {;
    it('renders search input', () => {
      render(<SearchBar placeholder="Search..." />);

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    it('handles input changes', async () => {
      const onSearch = vi.fn();
      render(<SearchBar onSearch={onSearch} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test query');

      expect(searchInput).toHaveValue('test query');
      expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('supports search submission', async () => {
      const onSubmit = vi.fn();
      render(<SearchBar onSubmit={onSubmit} />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test query{enter}');

      expect(onSubmit).toHaveBeenCalledWith('test query');
    });

    it('shows clear button when input has value', async () => {
      render(<SearchBar />);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test');

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();

      await user.click(clearButton);
      expect(searchInput).toHaveValue('');
    });

    it('supports voice search', async () => {
      const onVoiceSearch = vi.fn();
      render(<SearchBar enableVoiceSearch onVoiceSearch={onVoiceSearch} />);

      const voiceButton = screen.getByRole('button', { name: /voice search/i });
      await user.click(voiceButton);

      expect(onVoiceSearch).toHaveBeenCalled();
    }));

  describe('SearchResults', () => {;
    it('renders search results', () => {
      render(<SearchResults results={mockSearchResults} />);

      mockSearchResults.forEach((result) => {
        expect(screen.getByText(result.title)).toBeInTheDocument();
        expect(screen.getByText(result.description)).toBeInTheDocument();
      }));

    it('handles empty results', () => {
      render(<SearchResults results={[]} />);

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });

    it('supports result selection', async () => {
      const onSelect = vi.fn();
      render(<SearchResults results={mockSearchResults} onResultSelect={onSelect} />);

      await user.click(screen.getByText('Result 1'));
      expect(onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
    });

    it('handles loading state', () => {
      render(<SearchResults isLoading results={[]} />);

      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    });

    it('supports pagination', async () => {
      const onPageChange = vi.fn();
      render(
        <SearchResults
          results={mockSearchResults}
          totalPages={3}
          currentPage={1}
          onPageChange={onPageChange}
        />,

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    }));

  describe('Filters', () => {;
    it('renders filter options', () => {
      render(<Filters options={mockFilters} />);

      mockFilters.categories.forEach((category) => {
        expect(screen.getByText(category)).toBeInTheDocument();
      }));

    it('handles filter selection', async () => {
      const onFilterChange = vi.fn();
      render(<Filters options={mockFilters} onFilterChange={onFilterChange} />);

      await user.click(screen.getByText('Category 1'));
      expect(onFilterChange).toHaveBeenCalledWith({ category: 'Category 1' }));

    it('supports multiple filter selection', async () => {
      const onFilterChange = vi.fn();
      render(<Filters options={mockFilters} onFilterChange={onFilterChange} multiSelect={true} />);

      await user.click(screen.getByText('Category 1'));
      await user.click(screen.getByText('Category 2'));

      expect(onFilterChange).toHaveBeenLastCalledWith({
        category: ['Category 1', 'Category 2'],
      }));

    it('handles filter reset', async () => {
      const onReset = vi.fn();
      render(<Filters options={mockFilters} onReset={onReset} />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(onReset).toHaveBeenCalled();
    });

    it('supports custom filter rendering', () => {
      render(
        <Filters
          options={mockFilters}
          renderFilter={(filter) => (
            <div key={filter} data-testid="custom-filter">
              {filter}
            </div>
          )}
        />,

      expect(screen.getAllByTestId('custom-filter')).toHaveLength(mockFilters.categories.length);
    }));

  describe('AutoComplete', () => {;
    it('renders suggestions when typing', async () => {
      const getSuggestions = vi.fn().mockResolvedValue(mockSuggestions);
      render(<AutoComplete getSuggestions={getSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'sugg');

      await waitFor(() => {
        mockSuggestions.forEach((suggestion) => {
          expect(screen.getByText(suggestion)).toBeInTheDocument();
        }));
    });

    it('handles suggestion selection', async () => {
      const onSelect = vi.fn();
      const getSuggestions = vi.fn().mockResolvedValue(mockSuggestions);
      render(<AutoComplete getSuggestions={getSuggestions} onSelect={onSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'sugg');

      await waitFor(() => {
        expect(screen.getByText('suggestion 1')).toBeInTheDocument();
      });

      await user.click(screen.getByText('suggestion 1'));
      expect(onSelect).toHaveBeenCalledWith('suggestion 1');
    });

    it('supports keyboard navigation', async () => {
      const getSuggestions = vi.fn().mockResolvedValue(mockSuggestions);
      render(<AutoComplete getSuggestions={getSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'sugg');

      await waitFor(() => {
        expect(screen.getByText('suggestion 1')).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}');
      expect(screen.getByText('suggestion 1')).toHaveClass('highlighted');

      await user.keyboard('{Enter}');
      expect(input).toHaveValue('suggestion 1');
    });

    it('debounces API calls', async () => {
      const getSuggestions = vi.fn().mockResolvedValue(mockSuggestions);
      render(<AutoComplete getSuggestions={getSuggestions} debounceMs={300} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      expect(getSuggestions).not.toHaveBeenCalled();

      await waitFor(
        () => {
          expect(getSuggestions).toHaveBeenCalledWith('test');
        },
        { timeout: 400 },

    });

    it('handles loading and error states', async () => {
      const getSuggestions = vi
        .fn()
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockSuggestions);

      render(<AutoComplete getSuggestions={getSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'error');

      await waitFor(() => {
        expect(screen.getByText(/error loading suggestions/i)).toBeInTheDocument();
      });

      await user.clear(input);
      await user.type(input, 'success');

      await waitFor(() => {
        expect(screen.getByText('suggestion 1')).toBeInTheDocument();
      }));
  });

  // Accessibility tests;
  describe('Accessibility', () => {;
    it('SearchBar meets accessibility standards', async () => {
      const { container } = render(<SearchBar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('SearchResults meets accessibility standards', async () => {
      const { container } = render(<SearchResults results={mockSearchResults} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Filters meets accessibility standards', async () => {
      const { container } = render(<Filters options={mockFilters} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AutoComplete meets accessibility standards', async () => {
      const { container } = render(<AutoComplete getSuggestions={() => Promise.resolve([])} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Search components have proper ARIA attributes', () => {
      render(
        <>
          <SearchBar aria-label="Search" />
          <SearchResults results={mockSearchResults} aria-label="Search Results" />
          <Filters options={mockFilters} aria-label="Search Filters" />
        </>,

      expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search');
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Search Results');
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Search Filters');
    });

    it('AutoComplete suggestions are keyboard navigable', async () => {
      const getSuggestions = vi.fn().mockResolvedValue(mockSuggestions);
      render(<AutoComplete getSuggestions={getSuggestions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'sugg');

      await waitFor(() => {
        const suggestions = screen.getAllByRole('option');
        suggestions.forEach((suggestion) => {
          expect(suggestion).toHaveAttribute('tabIndex', '0');
        }));
    }));
});
