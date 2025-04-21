import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface RecentSearchesProps {
  maxSearches?: number;
  onSearchSelect?: (search: string) => void;
  className?: string;
}

/**
 * A component that displays and manages recent searches
 * stored in localStorage
 */
export const RecentSearches: React.FC<RecentSearchesProps> = ({
  maxSearches = 5,
  onSearchSelect,
  className = '',
}) => {
  const [searches, setSearches] = useLocalStorage<string[]>('recent-searches', []);
  const [searchTerm, setSearchTerm] = useState('');

  // Add a new search term
  const addSearch = (term: string) => {
    if (!term.trim()) return;

    setSearches(prev => {
      // Remove the term if it already exists (to avoid duplicates)
      const filteredSearches = prev.filter(s => s !== term);

      // Add the new term at the beginning and limit the number of searches
      return [term, ...filteredSearches].slice(0, maxSearches);
    });

    setSearchTerm('');
  };

  // Remove a search term
  const removeSearch = (term: string) => {
    setSearches(prev => prev.filter(s => s !== term));
  };

  // Clear all searches
  const clearSearches = () => {
    setSearches([]);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSearch(searchTerm);
  };

  // Handle clicking on a search term
  const handleSearchClick = (term: string) => {
    if (onSearchSelect) {
      onSearchSelect(term);
    }
  };

  return (
    <div className={`recent-searches ${className}`}>
      <h2 className="text-lg font-medium mb-2">Recent Searches</h2>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-4 flex">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-1 p-2 border rounded-l-md"
          data-testid="search-input"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          data-testid="search-button"
        >
          Search
        </button>
      </form>

      {/* Recent searches list */}
      {searches.length > 0 ? (
        <>
          <ul className="space-y-2">
            {searches.map((search, index) => (
              <li
                key={`${search}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-100 rounded"
              >
                <button
                  className="flex-1 text-left hover:underline"
                  onClick={() => handleSearchClick(search)}
                  data-testid={`search-item-${index}`}
                >
                  {search}
                </button>
                <button
                  onClick={() => removeSearch(search)}
                  className="ml-2 text-red-600 hover:text-red-800"
                  aria-label={`Remove ${search}`}
                  data-testid={`remove-search-${index}`}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={clearSearches}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800"
            data-testid="clear-searches"
          >
            Clear all searches
          </button>
        </>
      ) : (
        <p className="text-gray-500 italic">No recent searches</p>
      )}
    </div>
  );
};
