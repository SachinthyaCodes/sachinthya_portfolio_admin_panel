import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy Supabase client initialization that handles build time gracefully
let supabaseClient: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    // During build time, create a dummy client to avoid errors
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      // This is a build time, return a dummy client
      const dummyClient = createClient('https://dummy.supabase.co', 'dummy-key');
      return dummyClient;
    }
    
    throw new Error('Missing Supabase configuration. Please check your environment variables.');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}

// Backward compatibility
export const createSupabaseServerClient = createSupabaseClient;