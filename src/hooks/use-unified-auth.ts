/**
 * Unified Authentication Hook
 * 
 * This hook provides a consistent interface for authentication across the application.
 * It serves as a single entry point for all authentication-related functionality,
 * supporting both web and mobile environments.
 * 
 * This re-exports the core functionality from unified-auth-context.tsx but adds
 * additional helper methods for common authentication patterns.
 */

// Import and re-export the main auth hook and types from the context
import { 
  useAuth as useAuthFromContext, 
  AuthProvider,
  UserRole,
  AuthContextType,
  MobileUser
} from '../contexts/unified-auth-context';

// Export the base hook and provider
export { useAuthFromContext as useAuth, AuthProvider, UserRole };

// Alias for backward compatibility
export const useUnifiedAuth = useAuthFromContext;

/**
 * Get the current authentication state without the React hook
 * For use in non-React contexts (like API routes)
 * 
 * @returns Promise resolving to the current auth state
 */
export async function getAuthState() {
  // Dynamic import to avoid issues with SSR
  const { supabase } = await import('../utils/supabase');
  const { data } = await supabase.auth.getSession();
  
  return {
    session: data.session,
    user: data.session?.user || null,
    isAuthenticated: !!data.session,
    userRole: (data.session?.user?.app_metadata?.role as UserRole) || UserRole.USER,
  };
}

/**
 * Check if the current user has a specific role
 * For use in non-React contexts (like API routes)
 * 
 * @param role - The role to check
 * @returns Promise resolving to a boolean indicating if the user has the role
 */
export async function checkUserRole(role: UserRole): Promise<boolean> {
  const { userRole } = await getAuthState();
  
  if (role === UserRole.ADMIN) {
    return userRole === UserRole.ADMIN;
  }
  
  if (role === UserRole.PREMIUM) {
    return userRole === UserRole.PREMIUM || userRole === UserRole.ADMIN;
  }
  
  return true; // All authenticated users have basic USER role
}

/**
 * Check if a user is authenticated
 * For use in non-React contexts (like API routes)
 * 
 * @returns Promise resolving to a boolean indicating if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { isAuthenticated } = await getAuthState();
  return isAuthenticated;
}

/**
 * Helper functions for common auth patterns
 */
export const AuthHelpers = {
  /**
   * Get the current user's name or email for display
   * 
   * @param auth - Auth context from useAuth()
   * @returns User's name or email, or "Guest" if not authenticated
   */
  getUserDisplayName: (auth: AuthContextType): string => {
    if (!auth.user) return 'Guest';
    
    if ('app_metadata' in auth.user) {
      // Supabase user
      return auth.user.user_metadata?.full_name 
        || auth.user.user_metadata?.name 
        || auth.user.email 
        || 'User';
    } else {
      // Mobile user
      return (auth.user as MobileUser).name || (auth.user as MobileUser).email || 'User';
    }
  },
  
  /**
   * Get the user's avatar URL if available
   * 
   * @param auth - Auth context from useAuth()
   * @returns URL to user's avatar or null
   */
  getUserAvatar: (auth: AuthContextType): string | null => {
    if (!auth.user) return null;
    
    if ('app_metadata' in auth.user) {
      // Supabase user
      return auth.user.user_metadata?.avatar_url || null;
    } else {
      // Mobile user - would need mobile-specific implementation
      return null;
    }
  },
  
  /**
   * Check if the current user can access premium content
   * 
   * @param auth - Auth context from useAuth()
   * @returns Whether the user has premium access
   */
  hasPremiumAccess: (auth: AuthContextType): boolean => {
    return auth.hasRole(UserRole.PREMIUM) || auth.isAdmin();
  }
};

// Default export for convenience
export default useAuthFromContext; 