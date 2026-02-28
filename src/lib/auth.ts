import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import prisma from '@/lib/db';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_TOKEN_EXPIRES_IN = '7d';
const ACCESS_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

export function getTokenFromHeader(authHeader?: string | null) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (!/^Bearer$/i.test(scheme) || !token) return null;
  return token;
}

export function getBearerToken(req: Request) {
  return getTokenFromHeader(req.headers.get('authorization'));
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function signAccessToken(userId: string) {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES_IN };
  const token = jwt.sign({ sub: userId }, JWT_SECRET, options);
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_MS);
  return { token, expiresAt };
}

export async function getAuthenticatedUser(req: Request) {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const payload = verifyToken(token) as { sub?: string };
    if (!payload?.sub) return null;

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return null;

    return { user };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
