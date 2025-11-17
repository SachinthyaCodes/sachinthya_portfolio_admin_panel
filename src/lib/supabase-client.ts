import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy Supabase client initialization that handles build time gracefully
let supabaseClient: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Enhanced logging for debugging Vercel deployment
  console.log('🔧 Supabase Client Initialization:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
  
  if (!supabaseUrl || !supabaseServiceKey) {
    const error = `Missing Supabase configuration: 
    - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}
    - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'SET' : 'MISSING'}
    
    Please check your environment variables in Vercel dashboard.`;
    
    console.error('❌ Supabase Configuration Error:', error);
    throw new Error(error);
  }
  
  try {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('✅ Supabase client created successfully');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw new Error(`Failed to initialize Supabase client: ${error}`);
  }
}

// Backward compatibility
export const createSupabaseServerClient = createSupabaseClient;