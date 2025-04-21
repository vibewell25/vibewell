/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils/testing-library';
import '@testing-library/jest-dom';
import { RecentSearches } from '../RecentSearches';
import * as useLocalStorageModule from '../../hooks/useLocalStorage';

// Mock the useLocalStorage hook
jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

describe('RecentSearches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default empty searches
    jest.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([[], jest.fn()]);
  });

  it('renders empty state correctly', () => {
    // Act
    render(<RecentSearches />);

    // Assert
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('No recent searches')).toBeInTheDocument();
  });

  it('renders existing searches correctly', () => {
    // Arrange - Mock existing searches
    const existingSearches = ['React hooks', 'TypeScript', 'Jest testing'];
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([existingSearches, jest.fn()]);

    // Act
    render(<RecentSearches />);

    // Assert
    existingSearches.forEach((search, index) => {
      expect(screen.getByTestId(`search-item-${index}`)).toHaveTextContent(search);
    });
    expect(screen.getByTestId('clear-searches')).toBeInTheDocument();
  });

  it('adds a new search term when form is submitted', () => {
    // Arrange
    const setSearchesMock = jest.fn();
    jest.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([[], setSearchesMock]);

    // Act
    render(<RecentSearches />);
    const input = screen.getByTestId('search-input');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'New search term' } });
    fireEvent.submit(form);

    // Assert
    expect(setSearchesMock).toHaveBeenCalledWith(expect.any(Function));
    // Test the updater function
    const updaterFn = setSearchesMock.mock.calls[0][0];
    const result = updaterFn([]);
    expect(result).toEqual(['New search term']);
  });

  it('removes duplicate search terms', () => {
    // Arrange
    const existingSearches = ['React hooks', 'TypeScript'];
    const setSearchesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([existingSearches, setSearchesMock]);

    // Act
    render(<RecentSearches />);
    const input = screen.getByTestId('search-input');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'TypeScript' } });
    fireEvent.submit(form);

    // Assert
    expect(setSearchesMock).toHaveBeenCalledWith(expect.any(Function));
    // Test the updater function
    const updaterFn = setSearchesMock.mock.calls[0][0];
    const result = updaterFn(existingSearches);

    // TypeScript should be moved to the beginning
    expect(result).toEqual(['TypeScript', 'React hooks']);
  });

  it('limits the number of searches to maxSearches', () => {
    // Arrange
    const existingSearches = ['React hooks', 'TypeScript', 'Jest testing'];
    const setSearchesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([existingSearches, setSearchesMock]);

    // Act
    render(<RecentSearches maxSearches={3} />);
    const input = screen.getByTestId('search-input');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'New search term' } });
    fireEvent.submit(form);

    // Assert
    expect(setSearchesMock).toHaveBeenCalledWith(expect.any(Function));
    // Test the updater function
    const updaterFn = setSearchesMock.mock.calls[0][0];
    const result = updaterFn(existingSearches);

    // Should have 3 items max, with new search at the beginning
    expect(result).toEqual(['New search term', 'React hooks', 'TypeScript']);
    expect(result.length).toBe(3);
  });

  it('removes a search term when remove button is clicked', () => {
    // Arrange
    const existingSearches = ['React hooks', 'TypeScript', 'Jest testing'];
    const setSearchesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([existingSearches, setSearchesMock]);

    // Act
    render(<RecentSearches />);
    const removeButton = screen.getByTestId('remove-search-1'); // Remove TypeScript (index 1)
    fireEvent.click(removeButton);

    // Assert
    expect(setSearchesMock).toHaveBeenCalledWith(expect.any(Function));
    // Test the updater function
    const updaterFn = setSearchesMock.mock.calls[0][0];
    const result = updaterFn(existingSearches);

    // TypeScript should be removed
    expect(result).toEqual(['React hooks', 'Jest testing']);
  });

  it('clears all searches when clear button is clicked', () => {
    // Arrange
    const existingSearches = ['React hooks', 'TypeScript', 'Jest testing'];
    const setSearchesMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([existingSearches, setSearchesMock]);

    // Act
    render(<RecentSearches />);
    const clearButton = screen.getByTestId('clear-searches');
    fireEvent.click(clearButton);

    // Assert
    expect(setSearchesMock).toHaveBeenCalledWith([]);
  });

  it('calls onSearchSelect when a search term is clicked', () => {
    // Arrange
    const existingSearches = ['React hooks', 'TypeScript', 'Jest testing'];
    const onSearchSelectMock = jest.fn();
    jest
      .spyOn(useLocalStorageModule, 'useLocalStorage')
      .mockReturnValue([existingSearches, jest.fn()]);

    // Act
    render(<RecentSearches onSearchSelect={onSearchSelectMock} />);
    const searchItem = screen.getByTestId('search-item-1'); // Click on TypeScript (index 1)
    fireEvent.click(searchItem);

    // Assert
    expect(onSearchSelectMock).toHaveBeenCalledWith('TypeScript');
  });
});
