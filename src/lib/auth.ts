import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import prisma from './db';
import type { User } from '@prisma/client';

export interface AuthTokenPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

function getJwtSecret(): string {
  return process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function signAccessToken(userId: string): { token: string; jti: string; expiresAt: Date } {
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
  const token = jwt.sign({ sub: userId, jti }, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  });
  return { token, jti, expiresAt };
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export async function getAuthenticatedUser(
  req: Request
): Promise<{ user: User; token: string } | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload?.sub) return null;

  const tokenRecord = await prisma.authToken.findFirst({
    where: {
      token,
      userId: payload.sub,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!tokenRecord) return null;
  return { user: tokenRecord.user, token };
}

export default {
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
  getBearerToken,
  getAuthenticatedUser
};
