import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthenticatedUser, hashPassword } from '@/lib/auth';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  displayName: z.string().min(1).optional()
});

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser(req);
    const { id } = context.params;

    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.user.id !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: auth.user.id,
        email: auth.user.email,
        displayName: auth.user.displayName,
        createdAt: auth.user.createdAt
      }
    });
  } catch (error) {
    console.error('User detail error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch user.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser(req);
    const { id } = context.params;

    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.user.id !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(', ') },
        { status: 400 }
      );
    }

    const updates: { email?: string; passwordHash?: string; displayName?: string } = {};
    if (parsed.data.email) updates.email = parsed.data.email;
    if (parsed.data.displayName) updates.displayName = parsed.data.displayName;
    if (parsed.data.password) updates.passwordHash = await hashPassword(parsed.data.password);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields provided for update.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update user.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser(req);
    const { id } = context.params;

    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.user.id !== id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.authToken.deleteMany({ where: { userId: id } }),
      prisma.task.deleteMany({ where: { ownerId: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true, data: { message: 'User deleted' } });
  } catch (error) {
    console.error('Delete user error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to delete user.' },
      { status: 500 }
    );
  }
}

export default GET;
