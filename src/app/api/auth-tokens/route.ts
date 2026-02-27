import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser, signAccessToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await prisma.authToken.findMany({
      where: { userId: auth.user.id },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: { items: tokens } });
  } catch (error) {
    console.error('List auth tokens error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch auth tokens.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { token, expiresAt } = signAccessToken(auth.user.id);
    const record = await prisma.authToken.create({
      data: {
        token,
        userId: auth.user.id,
        expiresAt
      }
    });

    return NextResponse.json(
      { success: true, data: record },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create auth token error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create auth token.' },
      { status: 500 }
    );
  }
}

export default GET;
