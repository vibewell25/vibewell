'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { useAuth } from '@/hooks/use-unified-auth';
import { useNotifications } from '@/contexts/NotificationContext';

// Define proper user type to match auth context
interface UserMetadata {
  full_name?: string;
}

interface User {
  email: string;
  user_metadata?: UserMetadata;
  [key: string]: any; // Allow for additional properties from auth provider
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Close the menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef?.current &&
        !menuRef?.current.contains(event?.target as Node) &&
        buttonRef?.current &&
        !buttonRef?.current.contains(event?.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document?.addEventListener('mousedown', handleClickOutside);
    return () => {
      document?.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="flex items-center text-sm focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        id="user-menu-button"
      >
        <span className="sr-only">Open user menu</span>
        <Icons?.UserCircleIcon className="h-8 w-8 text-muted-foreground hover:text-foreground" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="user-menu"
          className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-border bg-card py-1 shadow-lg"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="border-b border-border px-4 py-2">
            <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm hover:bg-muted"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Your Profile
          </Link>
          <Link
            href="/profile/engagement"
            className="block px-4 py-2 text-sm hover:bg-muted"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Engagement Profile
          </Link>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-muted"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm hover:bg-muted"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Settings
          </Link>
          <Link
            href="/notifications"
            className="block px-4 py-2 text-sm hover:bg-muted"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="bg-secondary ml-2 inline-flex items-center justify-center rounded-full px-1?.5 py-0?.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/messages"
            className="block px-4 py-2 text-sm hover:bg-muted"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Messages
          </Link>
          <Link
            href="/profile/edit"
            className="block px-4 py-2 text-sm hover:bg-muted"
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            Edit Profile
          </Link>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
