import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-response';

export async function POST() {
  const response = successResponse({ message: 'Logged out successfully' });
  response.cookies.set('nexus_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
