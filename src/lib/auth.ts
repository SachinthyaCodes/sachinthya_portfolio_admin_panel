import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  email: string;
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { userId: string; email: string };
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function authenticateRequest(request: NextRequest): AuthUser | null {
  const token = getAuthToken(request);
  if (!token) {
    return null;
  }
  return verifyAuthToken(token);
}