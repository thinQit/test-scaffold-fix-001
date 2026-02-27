import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getBearerToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.authToken.deleteMany({
      where: { token }
    });

    return NextResponse.json({ success: true, data: { message: 'Logged out' } });
  } catch (error) {
    console.error('Logout error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to logout.' },
      { status: 500 }
    );
  }
}

export default POST;
