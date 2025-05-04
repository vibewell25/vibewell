import React, { useState, useRef, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface AccessibleMenuProps {
  items: MenuItem[];
  trigger: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
  onOpen?: () => void;
  onClose?: () => void;
}

export const AccessibleMenu: React.FC<AccessibleMenuProps> = ({
  items,
  trigger,
  className = '',
  align = 'left',
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const openMenu = () => {
    setIsOpen(true);
    setFocusedIndex(0);
    onOpen.();
  };

  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(null);
    triggerRef.current.focus();
    onClose.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev === null) return 0;
          const nextIndex = prev + 1;
          return nextIndex < items.length ? nextIndex : 0;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev === null) return items.length - 1;
          const nextIndex = prev - 1;
          return nextIndex >= 0 ? nextIndex : items.length - 1;
        });
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex !== null) {
          const item = items[focusedIndex];
          if (!item.disabled) {
            item.onClick.();
            closeMenu();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="focus:ring-primary focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className} `}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick.();
                    closeMenu();
                  }
                }}
                disabled={item.disabled}
                className={`w-full px-4 py-2 text-left text-sm ${
                  item.disabled
                    ? 'cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${focusedIndex === index ? 'bg-gray-100' : ''} focus:bg-gray-100 focus:outline-none`}
                tabIndex={-1}
              >
                <div className="flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibleMenu;
