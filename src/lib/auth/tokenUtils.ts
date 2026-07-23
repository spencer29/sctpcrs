/**
 * Refresh-token utilities using jose (Web-Crypto compatible).
 * Tokens are signed with HS256 using REFRESH_TOKEN_SECRET.
 * Passwords and raw tokens are never logged.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const SECRET_RAW = process.env.REFRESH_TOKEN_SECRET ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'change-me-in-production';
const SECRET = new TextEncoder().encode(SECRET_RAW);

const ACCESS_TTL_S  = 15 * 60;        // 15 minutes
const REFRESH_TTL_S = 7 * 24 * 3600;  // 7 days

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;       // user id
  role: string;
  jti: string;       // unique token id for rotation tracking
  family: string;    // token family for rotation detection
}

export async function signAccessToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_S}s`)
    .sign(SECRET);
}

export async function signRefreshToken(
  userId: string,
  role: string,
  jti: string,
  family: string
): Promise<string> {
  return new SignJWT({ sub: userId, role, jti, family } as RefreshTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_S}s`)
    .sign(SECRET);
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as RefreshTokenPayload;
}

export function generateJti(): string {
  // crypto.randomUUID is available in Node 14.17+ and all modern browsers
  return crypto.randomUUID();
}
