import React from 'react';

interface AccessiblePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
export const AccessiblePagination: React.FC<AccessiblePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
) => {
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
for (let i = startPage; i <= endPage; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      pages.push(i);
return pages;
const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
const renderPageButton = (page: number) => (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      className={`rounded px-3 py-1 ${
        currentPage === page ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
focus:ring-primary focus:outline-none focus:ring-2 focus:ring-offset-2`}
      aria-current={currentPage === page ? 'page' : undefined}
      aria-label={`Page ${page}`}
    >
      {page}
    </button>
const renderNavigationButton = (
    label: string,
    page: number,
    disabled: boolean,
    ariaLabel: string,
  ) => (
    <button
      onClick={() => handlePageChange(page)}
      disabled={disabled}
      className={`rounded px-3 py-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} focus:ring-primary focus:outline-none focus:ring-2 focus:ring-offset-2`}
      aria-label={ariaLabel}
    >
      {label}
    </button>
return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex items-center space-x-1">
        {showFirstLast && (
          <li>{renderNavigationButton('First', 1, currentPage === 1, 'Go to first page')}</li>
        )}
        {showPrevNext && (
          <li>
            {renderNavigationButton(
              'Previous',
              currentPage - 1,
              currentPage === 1,
              'Go to previous page',
            )}
          </li>
        )}
        {getPageNumbers().map(renderPageButton)}
        {showPrevNext && (
          <li>
            {renderNavigationButton(
              'Next',
              currentPage + 1,
              currentPage === totalPages,
              'Go to next page',
            )}
          </li>
        )}
        {showFirstLast && (
          <li>
            {renderNavigationButton(
              'Last',
              totalPages,
              currentPage === totalPages,
              'Go to last page',
            )}
          </li>
        )}
      </ul>
    </nav>
export default AccessiblePagination;
