/**
 * POST /api/auth/refresh
 *
 * Refresh token rotation:
 *  - Reads HttpOnly refresh token cookie (never from body/query)
 *  - Verifies HS256 signature and expiry
 *  - Issues a new access token + rotated refresh token (new jti, same family)
 *  - Old refresh token is invalidated by cookie replacement
 *  - Tokens are NEVER logged
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  generateJti,
} from '@/lib/auth/tokenUtils';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import type { AppRole } from '@/lib/rbac/permissions';

const REFRESH_COOKIE = 'sc_rt';
const REFRESH_TTL_S  = 7 * 24 * 3600;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Supabase admin credentials not configured.');
  return createSupabaseAdmin(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Read refresh token from HttpOnly cookie only
    const rawToken = req.cookies.get(REFRESH_COOKIE)?.value;

    if (!rawToken) {
      return NextResponse.json({ error: 'No refresh token provided.' }, { status: 401 });
    }

    // 2. Verify signature and expiry
    let payload;
    try {
      payload = await verifyRefreshToken(rawToken);
    } catch {
      // Invalid or expired — clear cookie
      const res = NextResponse.json({ error: 'Refresh token is invalid or expired.' }, { status: 401 });
      res.cookies.set(REFRESH_COOKIE, '', { maxAge: 0, path: '/api/auth' });
      return res;
    }

    const { sub: userId, role: tokenRole, family } = payload;

    if (!userId || !family) {
      return NextResponse.json({ error: 'Malformed token.' }, { status: 401 });
    }

    // 3. Verify user is still active (parameterized Supabase query)
    const admin = getAdminClient();
    const { data: profileData, error: profileError } = await admin
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', userId)
      .single();

    if (profileError || !profileData?.is_active) {
      const res = NextResponse.json(
        { error: 'Account is inactive or not found.' },
        { status: 403 }
      );
      res.cookies.set(REFRESH_COOKIE, '', { maxAge: 0, path: '/api/auth' });
      return res;
    }

    // Use the current DB role (may have changed since token was issued)
    const role: AppRole = (profileData.role as AppRole) ?? (tokenRole as AppRole) ?? 'viewer';

    // 4. Rotate: issue new access token + new refresh token (same family, new jti)
    const newJti = generateJti();

    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken(userId, role),
      signRefreshToken(userId, role, newJti, family),
    ]);

    // 5. Build response
    const res = NextResponse.json({ accessToken: newAccessToken, role }, { status: 200 });

    res.cookies.set(REFRESH_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: REFRESH_TTL_S,
    });

    // NEVER log tokens
    console.info(`[auth/refresh] rotated uid=${userId} role=${role}`);

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[auth/refresh] error: ${message}`);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
