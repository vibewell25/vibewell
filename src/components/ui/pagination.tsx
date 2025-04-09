'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  siblingCount = 1,
  onPageChange,
}: PaginationProps) {
  // Generate page ranges
  const generatePagination = () => {
    // Always show first and last page
    const firstPage = 1;
    const lastPage = totalPages;

    // Calculate the range of pages to show
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);

    // Should we show dots
    const shouldShowLeftDots = leftSiblingIndex > firstPage + 1;
    const shouldShowRightDots = rightSiblingIndex < lastPage - 1;

    // Generate the page array
    const pageArray: (number | string)[] = [];

    // Always add first page
    pageArray.push(firstPage);

    // Add left dots if needed
    if (shouldShowLeftDots) {
      pageArray.push('leftDots');
    }

    // Add pages in range
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPage && i !== lastPage) {
        pageArray.push(i);
      }
    }

    // Add right dots if needed
    if (shouldShowRightDots) {
      pageArray.push('rightDots');
    }

    // Always add last page if there's more than one page
    if (lastPage > firstPage) {
      pageArray.push(lastPage);
    }

    return pageArray;
  };

  const pages = generatePagination();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav role="navigation" aria-label="Pagination Navigation">
      <ul className="flex items-center gap-1">
        {/* Previous Page Button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (page === 'leftDots' || page === 'rightDots') {
            return (
              <li key={`dots-${index}`}>
                <span className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              </li>
            );
          }

          return (
            <li key={`page-${page}`}>
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page as number)}
                aria-current={currentPage === page ? 'page' : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </Button>
            </li>
          );
        })}

        {/* Next Page Button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
} 