import { createClient } from '@supabase/supabase-js';

// Use default values for build time if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build-time';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 