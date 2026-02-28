import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());

    const existing = await db.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: 'customer'
      }
    });

    const token = signToken({ sub: user.id, role: user.role });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }
      }
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message || 'Invalid input' : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
