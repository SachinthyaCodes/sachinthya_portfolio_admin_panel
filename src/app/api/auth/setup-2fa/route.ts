import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { TwoFactorAuth } from '@/lib/two-factor';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const supabase = createSupabaseClient();
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if 2FA is already enabled
    if (user.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
    }

    // Generate secret and QR code
    const secret = TwoFactorAuth.generateSecret(user.email);
    const qrCode = await TwoFactorAuth.generateQRCode(secret.otpauth_url!);
    const backupCodes = TwoFactorAuth.generateBackupCodes();

    // Store secret temporarily (not enabled until verified)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_secret: secret.base32,
        backup_codes: backupCodes
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user with 2FA secret:', updateError);
      return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
    }

    return NextResponse.json({
      qrCode,
      secret: secret.base32,
      backupCodes,
      message: 'Scan the QR code with your authenticator app and verify with a code to enable 2FA'
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}