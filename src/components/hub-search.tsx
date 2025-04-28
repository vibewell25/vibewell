'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, X, Clock } from 'lucide-react';
// Search categories for type-ahead
export type SearchCategory = 'all' | 'resources' | 'tools' | 'marketing' | 'financial' | 'staff';
// Suggested search item
interface SuggestedSearch {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}
interface HubSearchProps {
  defaultCategory?: SearchCategory;
  placeholder?: string;
  onSearch?: (query: string, category: SearchCategory) => void;
  className?: string;
  autoFocus?: boolean;
  allowEmptySearch?: boolean;
}
export function HubSearch({
  defaultCategory = 'all',
  placeholder = 'Search the Business Hub...',
  onSearch,
  className = '',
  autoFocus = false,
  allowEmptySearch = false,
}: HubSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>(defaultCategory);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSearches = localStorage.getItem('vibewell_recent_searches');
        if (storedSearches) {
          setRecentSearches(JSON.parse(storedSearches));
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);
  // Focus input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);
  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" shortcut to focus search
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur search
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        setShowSuggestions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // Update suggestions when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // In a real application, this would be an API call
    // For now, we'll create mock suggestions based on the query
    setIsLoading(true);
    // Simulate API call delay
    const timeout = setTimeout(() => {
      const mockSuggestions: SuggestedSearch[] = [
        {
          id: '1',
          title: `Resource: ${debouncedQuery}`,
          description: `Learn more about ${debouncedQuery} in the business context`,
          category: 'resource',
          url: `/business-hub/search?q=${encodeURIComponent(debouncedQuery)}&type=resource`,
        },
        {
          id: '2',
          title: `Marketing: ${debouncedQuery}`,
          description: `Marketing strategies related to ${debouncedQuery}`,
          category: 'marketing',
          url: `/business-hub/marketing?q=${encodeURIComponent(debouncedQuery)}`,
        },
        {
          id: '3',
          title: `Financial: ${debouncedQuery}`,
          description: `Financial aspects of ${debouncedQuery}`,
          category: 'financial',
          url: `/business-hub/financial-management?q=${encodeURIComponent(debouncedQuery)}`,
        },
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [debouncedQuery]);
  // Handle search submission
  const handleSearch = () => {
    if (!query && !allowEmptySearch) return;
    // Add to recent searches
    if (query.trim() !== '') {
      const updatedSearches = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      try {
        localStorage.setItem('vibewell_recent_searches', JSON.stringify(updatedSearches));
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }
    }
    // Call the onSearch callback if provided
    if (onSearch) {
      onSearch(query, category);
    } else {
      // Otherwise redirect to search page
      router.push(`/business-hub/search?q=${encodeURIComponent(query)}&category=${category}`);
    }
    // Hide suggestions
    setShowSuggestions(false);
  };
  // Handle clearing the search
  const handleClearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SuggestedSearch) => {
    // Add to recent searches
    const updatedSearches = [
      suggestion.title.split(': ')[1] || suggestion.title,
      ...recentSearches.filter((s) => s !== suggestion.title),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    try {
      localStorage.setItem('vibewell_recent_searches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
    // Navigate to suggestion URL
    router.push(suggestion.url);
    // Hide suggestions
    setShowSuggestions(false);
  };
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => setShowSuggestions(query.length >= 2)}
          onBlur={() => {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-12 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <Button type="button" className="absolute right-0 rounded-l-none" onClick={handleSearch}>
          Search
        </Button>
      </div>
      {/* Category selector */}
      <div className="mt-2 flex space-x-2 text-sm">
        <span className="text-gray-500">Search in:</span>
        {(['all', 'resources', 'tools', 'marketing', 'financial'] as SearchCategory[]).map(
          (cat) => (
            <button
              key={cat}
              type="button"
              className={`${
                category === cat ? 'font-medium text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ),
        )}
      </div>
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading suggestions...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-gray-500">{suggestion.description}</div>
                  </button>
                </li>
              ))}
              <li className="border-t border-gray-100">
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-blue-600 transition-colors hover:bg-gray-100"
                  onClick={handleSearch}
                >
                  <div className="flex items-center font-medium">
                    <Search className="mr-2 h-4 w-4" />
                    Search for "{query}"
                  </div>
                </button>
              </li>
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No suggestions found for "{query}"
            </div>
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
                Recent Searches
              </div>
              <ul>
                {recentSearches.map((search, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="flex w-full items-center px-4 py-2 text-left transition-colors hover:bg-gray-100"
                      onClick={() => {
                        setQuery(search);
                        setTimeout(() => handleSearch(), 0);
                      }}
                    >
                      <Clock className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{search}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
      {/* Keyboard shortcut hint */}
      <div className="absolute right-0 mt-2 text-xs text-gray-400">Press / to search</div>
    </div>
  );
}
