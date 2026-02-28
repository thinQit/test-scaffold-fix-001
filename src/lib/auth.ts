import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';

const jwtSecret: Secret = process.env.JWT_SECRET ?? 'dev-secret';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: jwt.JwtPayload, options: SignOptions = {}) {
  const defaultOptions: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, jwtSecret, { ...defaultOptions, ...options });
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret);
}

export function getTokenFromHeader(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}
