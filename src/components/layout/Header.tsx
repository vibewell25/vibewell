'use client';

import React from 'react';
import Link from 'next/link';
import { NotificationIndicator } from '@/components/notifications/NotificationIndicator';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { Icons } from '@/components/icons';

export interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { user, loading } = useAuth();
  
  return (
    <header className={`bg-background border-b border-border py-4 ${className}`}>
      <div className="container-app mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">Vibewell</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center space-x-4">
                  <NotificationIndicator />
                  <UserMenu />
                </div>
              ) : (
                <Link href="/auth/sign-in" className="btn-primary">
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
