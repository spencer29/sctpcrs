/**
 * POST /api/auth/login
 *
 * Security features:
 *  - Input validation (email format, password length)
 *  - Rate limiting per IP and per email (5 attempts / 15 min)
 *  - bcrypt password verification via Supabase admin (parameterized — no raw SQL)
 *  - Safe, generic error messages (no credential enumeration)
 *  - Refresh token rotation (signed HS256 JWT, HttpOnly cookie)
 *  - Role-based access control metadata in response
 *  - Passwords and tokens are NEVER logged
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { isRateLimited, recordFailedAttempt, clearAttempts } from '@/lib/auth/rateLimiter';
import { signAccessToken, signRefreshToken, generateJti } from '@/lib/auth/tokenUtils';
import type { AppRole } from '@/lib/rbac/permissions';

// ── Supabase admin client (service-role key, server-only) ──────────────────
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured.');
  }

  return createSupabaseAdmin(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Input validation ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput(email: unknown, password: unknown): string | null {
  if (typeof email !== 'string' || !email.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(email.trim())) return 'Invalid email format.';
  if (typeof password !== 'string' || password.length < 8)
    return 'Password must be at least 8 characters.';
  if (password.length > 128) return 'Password is too long.';
  return null;
}

// ── Generic auth failure response (no credential enumeration) ─────────────
function authFailure() {
  return NextResponse.json(
    { error: 'Invalid credentials. Please check your email and password.' },
    { status: 401 }
  );
}

// ── Cookie helpers ─────────────────────────────────────────────────────────
const REFRESH_COOKIE = 'sc_rt';
const REFRESH_TTL_S  = 7 * 24 * 3600; // 7 days

function setRefreshCookie(res: NextResponse, token: string): void {
  res.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: REFRESH_TTL_S,
  });
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Resolve client IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  let email = '';

  try {
    // 2. Parse body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const raw = body as Record<string, unknown>;
    email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
    const password: unknown = raw.password;

    // 3. Input validation
    const validationError = validateInput(email, password);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 422 });
    }

    // 4. Rate limiting
    const { limited, retryAfterMs } = isRateLimited(ip, email);
    if (limited) {
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSec) },
        }
      );
    }

    // 5. Fetch user record via parameterized Supabase query (no raw SQL)
    const admin = getAdminClient();

    // Use admin listUsers with filter — parameterized, no string interpolation
    const { data: listData, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    // We use a targeted RPC/select instead of listUsers for exact email lookup
    // to avoid scanning all users. Supabase admin.getUserByEmail is parameterized.
    const { data: userData, error: userError } =
      await admin.auth.admin.getUserByEmail(email);

    if (userError || !userData?.user) {
      recordFailedAttempt(ip, email);
      return authFailure();
    }

    const authUser = userData.user;

    // 6. Verify password with bcrypt
    //    Supabase stores passwords as bcrypt hashes in auth.users.encrypted_password.
    //    We fetch it via a service-role RPC to avoid exposing it in client queries.
    const { data: pwRow, error: pwError } = await admin
      .from('auth.users')
      .select('encrypted_password')
      .eq('id', authUser.id)
      .single();

    // Supabase doesn't expose auth.users via the data API directly.
    // Use a dedicated RPC that returns only the hash for this user id.
    // If the RPC doesn't exist yet, fall back to Supabase's built-in signInWithPassword
    // (which is already bcrypt-backed) and treat this route as an enrichment layer.
    let passwordValid = false;

    if (!pwError && pwRow && (pwRow as Record<string, unknown>).encrypted_password) {
      const hash = (pwRow as Record<string, unknown>).encrypted_password as string;
      passwordValid = await bcrypt.compare(password as string, hash);
    } else {
      // Fallback: delegate credential check to Supabase auth
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!signInRes.ok) {
        recordFailedAttempt(ip, email);
        return authFailure();
      }

      passwordValid = true;
    }

    if (!passwordValid) {
      recordFailedAttempt(ip, email);
      return authFailure();
    }

    // 7. Fetch user profile for role (parameterized Supabase select)
    const { data: profileData } = await admin
      .from('user_profiles')
      .select('role, full_name, is_active')
      .eq('id', authUser.id)
      .single();

    if (!profileData?.is_active) {
      // Account disabled — generic message
      return NextResponse.json(
        { error: 'Your account is not active. Please contact your administrator.' },
        { status: 403 }
      );
    }

    const role: AppRole = (profileData?.role as AppRole) ?? 'viewer';

    // 8. Clear rate-limit counters on success
    clearAttempts(ip, email);

    // 9. Issue tokens
    const jti    = generateJti();
    const family = generateJti(); // new family on fresh login

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(authUser.id, role),
      signRefreshToken(authUser.id, role, jti, family),
    ]);

    // 10. Build response — access token in body, refresh token in HttpOnly cookie
    const res = NextResponse.json(
      {
        accessToken,
        user: {
          id: authUser.id,
          email: authUser.email,
          fullName: profileData?.full_name ?? '',
          role,
        },
      },
      { status: 200 }
    );

    setRefreshCookie(res, refreshToken);

    // NEVER log passwords, tokens, or hashes
    console.info(`[auth/login] success uid=${authUser.id} role=${role}`);

    return res;
  } catch (err: unknown) {
    // Log error type only — no credentials
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[auth/login] error: ${message}`);

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
