'use client';

import { useState, useRef, useEffect } from 'react';
import { useKeyboardInteraction } from './accessibility-utils';

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

export interface AccessibleNavigationProps {
  items: NavItem[];
  className?: string;
}

export function AccessibleNavigation({ items, className = '' }: AccessibleNavigationProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);

  // Handle keyboard navigation
  useKeyboardInteraction(
    () => {
      if (activeItem) {
        const item = document.getElementById(activeItem);
        if (item) {
          const link = item.querySelector('a');
          if (link) {
            link.click();
          }
        }
      }
    },
    () => {
      setActiveItem(null);
      setExpandedItems(new Set());
    },
  );

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeItem) return;

      const currentItem = document.getElementById(activeItem);
      if (!currentItem) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextItem = currentItem.nextElementSibling as HTMLElement;
          if (nextItem) {
            setActiveItem(nextItem.id);
            nextItem.focus();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          const prevItem = currentItem.previousElementSibling as HTMLElement;
          if (prevItem) {
            setActiveItem(prevItem.id);
            prevItem.focus();
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (currentItem.getAttribute('aria-expanded') === 'false') {
            setExpandedItems((prev) => {
              const newSet = new Set(prev);
              newSet.add(activeItem);
              return newSet;
            });
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (currentItem.getAttribute('aria-expanded') === 'true') {
            setExpandedItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(activeItem);
              return newSet;
            });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem]);

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const itemId = `nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <li key={item.label} id={itemId} role="none" className={level > 0 ? 'pl-4' : ''}>
        <div
          role="menuitem"
          tabIndex={0}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren}
          aria-current={activeItem === itemId ? 'page' : undefined}
          onFocus={() => setActiveItem(itemId)}
          onBlur={() => {
            if (!navRef.current.contains(document.activeElement)) {
              setActiveItem(null);
            }
          }}
          className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100"
        >
          <a href={item.href} className="flex-1" aria-label={item.description}>
            {item.label}
          </a>

          {hasChildren && (
            <button
              aria-label={isExpanded ? 'Collapse submenu' : 'Expand submenu'}
              onClick={() => {
                setExpandedItems((prev) => {
                  const newSet = new Set(prev);
                  if (isExpanded) {
                    newSet.delete(item.label);
                  } else {
                    newSet.add(item.label);
                  }
                  return newSet;
                });
              }}
              className="ml-2 rounded p-1 hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {hasChildren && isExpanded && item.children && (
          <ul role="menu" aria-label={`${item.label} submenu`} className="mt-1">
            {item.children.map((child) => renderNavItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav ref={navRef} role="navigation" aria-label="Main navigation" className={className}>
      <ul role="menubar" className="space-y-1">
        {items.map((item) => renderNavItem(item))}
      </ul>
    </nav>
  );
}

// Example usage:
/*
const navItems = [
  {
    label: 'Home',
    href: '/',
    description: 'Go to the home page'
  },
  {
    label: 'Products',
    href: '/products',
    description: 'View our product catalog',
    children: [
      {
        label: 'Category 1',
        href: '/products/category-1',
        description: 'Browse products in category 1'
      },
      {
        label: 'Category 2',
        href: '/products/category-2',
        description: 'Browse products in category 2'
      }
    ]
  },
  {
    label: 'About',
    href: '/about',
    description: 'Learn more about our company'
  }
];

<AccessibleNavigation items={navItems} className="w-64" />
*/
