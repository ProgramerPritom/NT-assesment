import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

function parseJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check public paths
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // Get token from Cookie or Authorization header
  const token =
    request.cookies.get('nexus_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const payload = token ? parseJwtPayload(token) : null;

  // 1. API Route Guards
  if (pathname.startsWith('/api')) {
    if (isPublic) {
      return NextResponse.next();
    }

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing or expired token' },
        { status: 401 }
      );
    }

    const role = payload.role;

    // Admin only routes
    if (pathname.startsWith('/api/users') && role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Manager / Admin mutation routes
    if (
      (pathname.startsWith('/api/clients') || pathname.startsWith('/api/governance')) &&
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) &&
      role === 'STAFF'
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Manager or Admin authorization required' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 2. Page Route Guards
  if (!payload && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (payload && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
