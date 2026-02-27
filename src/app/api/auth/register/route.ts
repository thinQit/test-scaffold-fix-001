import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { hashPassword, signAccessToken } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(', ') },
        { status: 400 }
      );
    }

    const { email, password, displayName } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName
      }
    });

    const { token, expiresAt } = signAccessToken(user.id);
    await prisma.authToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt
          },
          token
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to register user.' },
      { status: 500 }
    );
  }
}

export default POST;
