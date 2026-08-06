import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// minimal: native scrypt password hashing using stdlib crypto
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(keyBuffer, derivedKey);
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null,
      userId: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return {
    session,
    userId: session.user.id,
    errorResponse: null,
  };
}
