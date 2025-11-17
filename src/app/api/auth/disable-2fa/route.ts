import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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
      .select('two_factor_enabled')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    // Disable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: null
      })
      .eq('id', decoded.userId);

    if (updateError) {
      console.error('Failed to disable 2FA:', updateError);
      return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
    }

    // Clean up any existing 2FA sessions
    await supabase
      .from('two_factor_sessions')
      .delete()
      .eq('user_id', decoded.userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Two-Factor Authentication has been disabled' 
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}