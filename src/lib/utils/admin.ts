import { prisma } from '@/lib/database/client';



/**
 * Set a user's role in the profiles table
 * @param userId The user's UUID
 * @param role The role to set ('user' or 'admin')
 */
export async function setUserRole(userId: string, role: 'user' | 'admin') {
  try {
    // First check if a profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      // Profile doesn't exist, create one
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role,
          updated_at: new Date().toISOString(),
        });
      
      if (insertError) throw insertError;
    } else {
      // Profile exists, update it
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { success: false, error };
  }
}

/**
 * Get a user's role from the profiles table
 * @param userId The user's UUID
 * @returns The user's role or null if not found
 */
export async function getUserRole(userId: string): Promise<'user' | 'admin' | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) return null;
    return data.role as 'user' | 'admin';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if a user has admin role
 * @param userId The user's UUID
 * @returns Boolean indicating if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

/**
 * Create the first admin user
 * This should be run once during initial setup
 * @param userId The user's UUID to make admin
 */
export async function createFirstAdmin(userId: string) {
  try {
    // Check if any admins exist
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    
    if (error) throw error;
    
    // If no admins exist, make this user an admin
    if (!data || data.length === 0) {
      const result = await setUserRole(userId, 'admin');
      return { ...result, firstAdmin: true };
    }
    
    return { success: false, message: 'Admins already exist' };
  } catch (error) {
    console.error('Error creating first admin:', error);
    return { success: false, error };
  }
} 