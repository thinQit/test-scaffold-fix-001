import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const [users, leads] = await Promise.all([db.user.count(), db.lead.count()]);

  return NextResponse.json({
    success: true,
    data: {
      users,
      leads
    }
  });
}
