import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
    
    const supabase = createSupabaseClient();
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, two_factor_enabled, created_at')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        two_factor_enabled: user.two_factor_enabled,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 });
  }
}