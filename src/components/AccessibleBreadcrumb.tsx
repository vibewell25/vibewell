import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import DOMPurify from 'dompurify';

/**
 * Interface for a single breadcrumb item
 */
interface BreadcrumbItem {
  /** The display label for the breadcrumb item */
  label: string;
  /** Optional URL for the breadcrumb item */
  href?: string;
  /** Whether this item represents the current page */
  isCurrent?: boolean;
}

/**
 * Props for the AccessibleBreadcrumb component
 */
interface AccessibleBreadcrumbProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Custom separator between breadcrumb items */
  separator?: React.ReactNode;
  /** Callback function when a breadcrumb item is clicked */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Custom styles for different states */
  styles?: {
    container?: string;
    item?: string;
    currentItem?: string;
    separator?: string;
    link?: string;
  };
}

/**
 * Validates the breadcrumb items for security and correctness
 */
const validateBreadcrumbItems = (items: BreadcrumbItem[]): void => {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (items.length === 0) {
    throw new Error('Items array cannot be empty');
  }

  items.forEach((item, index) => {
    if (!item.label || typeof item.label !== 'string') {
      throw new Error(`Invalid label at index ${index}`);
    }

    // Sanitize label to prevent XSS
    const sanitizedLabel = DOMPurify.sanitize(item.label);
    if (sanitizedLabel !== item.label) {
      throw new Error(`Invalid characters in label at index ${index}`);
    }

    // Validate href if present
    if (item.href) {
      try {
        new URL(item.href);
      } catch {
        throw new Error(`Invalid URL at index ${index}`);
      }
    }
  });
};

/**
 * Sanitizes and validates a URL
 */
const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsedUrl.toString();
  } catch {
    return '#';
  }
};

export const AccessibleBreadcrumb: React.FC<AccessibleBreadcrumbProps> = ({
  items,
  className = '',
  separator = '/',
  onItemClick,
  styles = {},
}) => {
  // Validate items on component mount
  React.useEffect(() => {
    try {
      validateBreadcrumbItems(items);
    } catch (error) {
      console.error('Breadcrumb validation error:', error);
    }
  }, [items]);

  const defaultStyles = {
    container: 'flex items-center space-x-2',
    item: 'flex items-center',
    currentItem: 'text-gray-500',
    separator: 'mx-2 text-gray-500',
    link: 'text-primary hover:text-primary-dark focus:outline-none focus:underline',
  };

  const mergedStyles = {
    container: `${defaultStyles.container} ${styles.container || ''}`,
    item: `${defaultStyles.item} ${styles.item || ''}`,
    currentItem: `${defaultStyles.currentItem} ${styles.currentItem || ''}`,
    separator: `${defaultStyles.separator} ${styles.separator || ''}`,
    link: `${defaultStyles.link} ${styles.link || ''}`,
  };

  return (
    <ErrorBoundary fallback={<div>Error loading breadcrumb navigation</div>}>
      <nav className={`${className} ${mergedStyles.container}`} aria-label="Breadcrumb">
        <ol>
          {items.map((item, index) => {
            const isLastItem = index === items.length - 1;
            const isCurrent = item.isCurrent || isLastItem;
            const sanitizedHref = item.href ? sanitizeUrl(item.href) : undefined;

            return (
              <li key={index} className={mergedStyles.item}>
                {index > 0 && (
                  <span className={mergedStyles.separator} aria-hidden="true">
                    {separator}
                  </span>
                )}
                {isCurrent ? (
                  <span className={mergedStyles.currentItem} aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={sanitizedHref}
                    onClick={(e) => {
                      e.preventDefault();
                      onItemClick?.(item, index);
                    }}
                    className={mergedStyles.link}
                    rel={sanitizedHref?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    target={sanitizedHref?.startsWith('http') ? '_blank' : undefined}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </ErrorBoundary>
  );
};

export default AccessibleBreadcrumb;
