/**
 * POST /api/auth/logout
 *
 * Clears the HttpOnly refresh token cookie.
 */

import { NextRequest, NextResponse } from 'next/server';

const REFRESH_COOKIE = 'sc_rt';

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 0,
  });
  return res;
}
