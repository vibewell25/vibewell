import { Icons } from '@/components/icons';
import React, { useState } from 'react';
interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}
interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}
export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className = '',
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      if (allowMultiple) {
        return prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];
      } else {
        return prev.includes(itemId) ? [] : [itemId];
      }
    });
  };
  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {items.map((item) => (
        <div key={item.id}>
          <button
            type="button"
            className="flex w-full items-center justify-between py-4 text-left"
            onClick={() => toggleItem(item.id)}
            aria-expanded={openItems.includes(item.id)}
            aria-controls={`accordion-content-${item.id}`}
          >
            <span className="text-sm font-medium text-gray-900">{item.title}</span>
            <Icons.ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform ${
                openItems.includes(item.id) ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            id={`accordion-content-${item.id}`}
            className={`overflow-hidden transition-all duration-200 ${
              openItems.includes(item.id) ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div className="py-4">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}; 