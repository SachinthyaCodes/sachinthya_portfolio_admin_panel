import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { TwoFactorAuth } from '@/lib/two-factor';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { code, tempToken, useBackupCode = false } = await request.json();

    if (!code || !tempToken) {
      return NextResponse.json({ error: 'Code and temp token are required' }, { status: 400 });
    }

    // Verify temp token format
    if (!useBackupCode && !TwoFactorAuth.isValidTokenFormat(code)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    if (useBackupCode && !TwoFactorAuth.isValidBackupCodeFormat(code)) {
      return NextResponse.json({ error: 'Invalid backup code format' }, { status: 400 });
    }

    const supabase = createSupabaseClient();
    
    // Get 2FA session
    const { data: session, error: sessionError } = await supabase
      .from('two_factor_sessions')
      .select('*')
      .eq('temp_token', tempToken)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (userError || !user || !user.two_factor_enabled) {
      return NextResponse.json({ error: 'User not found or 2FA not enabled' }, { status: 400 });
    }

    let isValid = false;
    let updatedBackupCodes = user.backup_codes;

    if (useBackupCode) {
      // Verify backup code
      isValid = TwoFactorAuth.verifyBackupCode(code, user.backup_codes || []);
      if (isValid) {
        // Remove used backup code
        updatedBackupCodes = TwoFactorAuth.removeUsedBackupCode(code, user.backup_codes || []);
        
        // Update user with new backup codes list
        await supabase
          .from('users')
          .update({ backup_codes: updatedBackupCodes })
          .eq('id', user.id);
      }
    } else {
      // Verify TOTP token
      isValid = TwoFactorAuth.verifyToken(code, user.two_factor_secret);
    }

    if (!isValid) {
      return NextResponse.json({ 
        error: useBackupCode ? 'Invalid backup code' : 'Invalid verification code' 
      }, { status: 400 });
    }

    // Mark session as verified
    await supabase
      .from('two_factor_sessions')
      .update({ verified: true })
      .eq('id', session.id);

    // Generate final JWT token
    const finalToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        twoFactorVerified: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Clean up old sessions for this user
    await supabase
      .from('two_factor_sessions')
      .delete()
      .eq('user_id', user.id)
      .neq('id', session.id);

    return NextResponse.json({
      success: true,
      token: finalToken,
      message: '2FA verification successful',
      ...(useBackupCode && { remainingBackupCodes: updatedBackupCodes?.length || 0 })
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}