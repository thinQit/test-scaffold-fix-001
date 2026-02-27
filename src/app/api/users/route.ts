import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthenticatedUser, hashPassword } from '@/lib/auth';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).optional()
});

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);

    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = auth;

    return NextResponse.json({
      success: true,
      data: {
        items: [
          {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt
          }
        ]
      }
    });
  } catch (error) {
    console.error('Users list error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch users.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(', ') },
        { status: 400 }
      );
    }

    const { email, password, displayName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create user.' },
      { status: 500 }
    );
  }
}

export default GET;
