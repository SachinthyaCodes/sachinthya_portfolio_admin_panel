import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Login API called');
    
    // Check if we can create Supabase client
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch (clientError) {
      console.error('❌ Supabase client creation failed:', clientError);
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          details: process.env.NODE_ENV === 'development' ? String(clientError) : 'Please check server configuration'
        },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { email, password } = body;

    console.log('📧 Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email using Supabase
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (dbError || !users) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, users.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!users.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: users.id, 
        email: users.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = users;

    return NextResponse.json({
      access_token: token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}