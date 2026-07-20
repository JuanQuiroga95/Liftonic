import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Role-based redirection from root /dashboard
    if (pathname === '/dashboard') {
      const role = token.role as string;
      const url = req.nextUrl.clone();

      if (role === 'SUPER_ADMIN') {
        url.pathname = '/dashboard/admin';
      } else if (role === 'PROFESSOR') {
        url.pathname = '/dashboard/profesor';
      } else if (role === 'ALUMNO') {
        url.pathname = '/dashboard/alumno';
      } else {
        url.pathname = '/login'; // Fallback
      }
      return NextResponse.redirect(url);
    }

    // Protect specific paths based on role
    if (pathname.startsWith('/dashboard/admin') && token.role !== 'SUPER_ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    if (pathname.startsWith('/dashboard/profesor') && token.role !== 'PROFESSOR') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/dashboard/alumno') && token.role !== 'ALUMNO') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Prevent logged-in users from seeing login page
  if (pathname === '/login' && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
