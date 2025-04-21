import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export type User = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  role?: string;
};

export type Session = {
  user: User;
  expires: string;
};

/**
 * Get the current authenticated session
 */
export async function auth(): Promise<Session | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  const { user } = data.session;

  if (!user) {
    return null;
  }

  // Get user metadata from Supabase
  const { data: userData } = await supabase
    .from('users')
    .select('id, name, avatar_url, role')
    .eq('id', user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email,
      name: userData?.name || user.email?.split('@')[0] || 'User',
      image: userData?.avatar_url || null,
      role: userData?.role || 'user',
    },
    expires: data.session.expires_at?.toString() || '0',
  };
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session;
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(role: string | string[]): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.role) {
    return false;
  }

  if (Array.isArray(role)) {
    return role.includes(session.user.role);
  }

  return session.user.role === role;
}
