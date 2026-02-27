import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const baseWhere: Prisma.TaskWhereInput = {
      ownerId: auth.user.id
    };

    if (startDateParam || endDateParam) {
      baseWhere.createdAt = {
        ...(startDateParam ? { gte: new Date(startDateParam) } : {}),
        ...(endDateParam ? { lte: new Date(endDateParam) } : {})
      };
    }

    const now = new Date();
    const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      completed,
      overdue,
      dueSoon,
      todo,
      inProgress
    ] = await Promise.all([
      prisma.task.count({ where: baseWhere }),
      prisma.task.count({ where: { ...baseWhere, status: 'done' } }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: { not: 'done' },
          dueDate: { lt: now }
        }
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: { not: 'done' },
          dueDate: { gte: now, lte: soon }
        }
      }),
      prisma.task.count({ where: { ...baseWhere, status: 'todo' } }),
      prisma.task.count({ where: { ...baseWhere, status: 'in_progress' } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        completed,
        overdue,
        dueSoon,
        byStatus: {
          todo,
          in_progress: inProgress,
          done: completed
        }
      }
    });
  } catch (error) {
    console.error('Dashboard summary error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch dashboard summary.' },
      { status: 500 }
    );
  }
}

export default GET;
