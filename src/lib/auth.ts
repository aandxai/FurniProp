import { Role } from '@prisma/client';
import { compare } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';

const COOKIE = 'furniprop_session';
const SESSION_DAYS = 14;

function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) return null;
  if (session.user.isDemo && (process.env.DEMO_MODE !== 'true' || process.env.NODE_ENV === 'production')) return null;
  return session.user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
}

export async function removeSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE);
}

export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || (user.isDemo && (process.env.DEMO_MODE !== 'true' || process.env.NODE_ENV === 'production'))) return null;
  return await compare(password, user.passwordHash) ? user : null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/account');
  return user;
}

export function safeNextPath(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/account';
}
