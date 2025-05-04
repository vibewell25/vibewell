import React, { useState, useRef } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccessibleAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpandedItems?: string[];
  className?: string;
  onItemToggle?: (itemId: string, isExpanded: boolean) => void;
}

export const AccessibleAccordion: React.FC<AccessibleAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpandedItems = [],
  className = '',
  onItemToggle,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpandedItems);
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleItemClick = (itemId: string) => {
    setExpandedItems((prev) => {
      const isExpanded = prev.includes(itemId);
      const newExpandedItems = allowMultiple
        ? isExpanded
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
        : isExpanded
          ? []
          : [itemId];

      onItemToggle.(itemId, !isExpanded);
      return newExpandedItems;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    const itemIndex = items.findIndex((item) => item.id === itemId);

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleItemClick(itemId);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextItem = items[itemIndex + 1];
        if (nextItem && !nextItem.disabled) {
          itemRefs.current[nextItem.id].focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevItem = items[itemIndex - 1];
        if (prevItem && !prevItem.disabled) {
          itemRefs.current[prevItem.id].focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        const firstItem = items.find((item) => !item.disabled);
        if (firstItem) {
          itemRefs.current[firstItem.id].focus();
        }
        break;
      case 'End':
        e.preventDefault();
        const lastItem = [...items].reverse().find((item) => !item.disabled);
        if (lastItem) {
          itemRefs.current[lastItem.id].focus();
        }
        break;
    }
  };

  return (
    <div className={className}>
      {items.map((item) => {
        const isExpanded = expandedItems.includes(item.id);

        return (
          <div key={item.id} className="border-b border-gray-200">
            <h3>
              <button
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                id={`accordion-${item.id}-header`}
                aria-expanded={isExpanded}
                aria-controls={`accordion-${item.id}-panel`}
                aria-disabled={item.disabled}
                disabled={item.disabled}
                className={`w-full px-4 py-3 text-left font-medium ${isExpanded ? 'text-primary' : 'text-gray-700'} ${item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'} focus:ring-primary focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={() => handleItemClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
              >
                {item.title}
                <span
                  className={`float-right transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} `}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
            </h3>
            <div
              id={`accordion-${item.id}-panel`}
              role="region"
              aria-labelledby={`accordion-${item.id}-header`}
              className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-screen' : 'max-h-0'} `}
            >
              <div className="px-4 py-3">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccessibleAccordion;
