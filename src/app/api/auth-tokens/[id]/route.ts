import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = await prisma.authToken.findFirst({
      where: { id: context.params.id, userId: auth.user.id }
    });

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: token });
  } catch (error) {
    console.error('Get auth token error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch auth token.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await prisma.authToken.deleteMany({
      where: { id: context.params.id, userId: auth.user.id }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: 'Token not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { message: 'Token revoked' } });
  } catch (error) {
    console.error('Delete auth token error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to revoke token.' },
      { status: 500 }
    );
  }
}

export default GET;
