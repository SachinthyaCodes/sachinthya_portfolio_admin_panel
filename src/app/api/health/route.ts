import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    const config = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'not-set',
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? 'SET ✅' : 'MISSING ❌',
        SUPABASE_SERVICE_ROLE_KEY: hasSupabaseServiceKey ? 'SET ✅' : 'MISSING ❌',
        JWT_SECRET: hasJwtSecret ? 'SET ✅' : 'MISSING ❌',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not-set'
      },
      status: hasSupabaseUrl && hasSupabaseServiceKey && hasJwtSecret ? 'HEALTHY ✅' : 'CONFIGURATION INCOMPLETE ❌'
    };

    console.log('🏥 Health check:', config);

    return NextResponse.json(config);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'ERROR ❌',
        error: String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}