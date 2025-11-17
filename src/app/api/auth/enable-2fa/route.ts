import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { TwoFactorAuth } from '@/lib/two-factor';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token || !TwoFactorAuth.isValidTokenFormat(token)) {
      return NextResponse.json({ error: 'Invalid verification code format' }, { status: 400 });
    }

    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const authToken = authHeader.substring(7);
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any;
    
    const supabase = createSupabaseClient();
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user || !user.two_factor_secret) {
      return NextResponse.json({ error: 'Setup not completed' }, { status: 400 });
    }

    // Verify the TOTP token
    const isValid = TwoFactorAuth.verifyToken(token, user.two_factor_secret);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({ two_factor_enabled: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to enable 2FA:', updateError);
      return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Two-Factor Authentication has been enabled successfully' 
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}