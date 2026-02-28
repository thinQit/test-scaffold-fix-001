import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import prisma from '@/lib/db';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS || 60 * 60 * 24 * 7);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function getTokenFromHeader(authorization?: string | null) {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return null;
  return token || null;
}

export function getBearerToken(req: Request) {
  return getTokenFromHeader(req.headers.get('authorization'));
}

export function signAccessToken(userId: string) {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN_SECONDS };
  const token = jwt.sign({ sub: userId }, JWT_SECRET, options);
  const expiresAt = new Date(Date.now() + JWT_EXPIRES_IN_SECONDS * 1000);
  return { token, expiresAt };
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

type AuthenticatedUser = {
  user: {
    id: string;
    email: string;
    displayName?: string | null;
    createdAt?: Date;
  };
};

export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    const userId = typeof payload === 'object' ? (payload.sub ?? (payload as { userId?: string }).userId) : null;

    if (!userId || typeof userId !== 'string') return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return { user: user as AuthenticatedUser['user'] };
  } catch {
    return null;
  }
}
