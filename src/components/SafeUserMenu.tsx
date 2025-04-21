'use client';

import { withErrorBoundary } from '@/hooks/useErrorBoundary';
import { UserMenu } from './user-menu';
import { Icons } from './icons';

/**
 * A version of the UserMenu component wrapped with an error boundary
 * to gracefully handle any errors that might occur during rendering.
 */
export const SafeUserMenu = withErrorBoundary(UserMenu, {
  fallback: (
    <button
      className="flex items-center text-sm focus:outline-none"
      aria-label="User menu (currently unavailable)"
      disabled
    >
      <Icons.UserCircleIcon className="h-8 w-8 text-muted-foreground opacity-50" />
    </button>
  ),
  onError: error => {
    // You could send this error to your monitoring service
    console.error('UserMenu component error:', error);
  },
});

export default SafeUserMenu;
