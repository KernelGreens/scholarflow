import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATH_PREFIXES = ['/api/auth', '/api/health', '/login', '/register'];

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? 'local_dev_secret_change_me_in_production',
  });

  const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublic =
    PUBLIC_PATH_PREFIXES.some((p) => nextUrl.pathname.startsWith(p));

  if (isAuthRoute || isPublic) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|.*\\..*).*)', '/'],
};
