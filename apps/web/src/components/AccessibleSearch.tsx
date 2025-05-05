import React, { useState, useRef, useEffect } from 'react';

interface SearchResult {
  id: string;
  label: string;
  value: string;
interface AccessibleSearchProps {
  onSearch: (query: string) => void;
  results?: SearchResult[];
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  debounceTime?: number;
  onResultSelect?: (result: SearchResult) => void;
export const AccessibleSearch: React.FC<AccessibleSearchProps> = ({
  onSearch,
  results = [],
  placeholder = 'Search...',
  className = '',
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  debounceTime = 300,
  onResultSelect,
) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
timerRef.current = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
debounceTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
[query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
return () => {
      document.removeEventListener('mousedown', handleClickOutside);
[isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev === null) return 0;
          return prev < results.length - 1 ? prev + 1 : prev;
break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev === null) return results.length - 1;
          return prev > 0 ? prev - 1 : prev;
break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex !== null && results[focusedIndex]) {
          handleResultSelect(results[focusedIndex]);
break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
const handleResultSelect = (result: SearchResult) => {
    setQuery(result.label);
    setIsOpen(false);
    onResultSelect.(result);
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setFocusedIndex(null);
return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-md border px-3 py-2 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'focus:ring-primary focus:border-primary border-gray-300'
${disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'} focus:outline-none`}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
          disabled={disabled}
          required={required}
          role="combobox"
        />
        {isOpen && results.length > 0 && (
          <ul
            id="search-results"
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg"
          >
            {results.map((result, index) => (
              <li
                key={result.id}
                role="option"
                aria-selected={focusedIndex === index}
                onClick={() => handleResultSelect(result)}
                className={`cursor-pointer px-3 py-2 ${focusedIndex === index ? 'bg-primary text-white' : 'hover:bg-gray-100'} focus:bg-gray-100 focus:outline-none`}
              >
                {result.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p id="error-message" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id="helper-text" className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      <div role="status" aria-live="polite" className="sr-only">
        {results.length > 0 ? `${results.length} results found` : query && 'No results found'}
      </div>
    </div>
export default AccessibleSearch;
