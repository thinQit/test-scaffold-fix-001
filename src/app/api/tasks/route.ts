import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma, TaskStatus, TaskPriority } from '@prisma/client';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional()
});

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const status = searchParams.get('status') as TaskStatus | null;
    const dueBefore = searchParams.get('dueBefore');
    const dueAfter = searchParams.get('dueAfter');
    const search = searchParams.get('search');

    const where: Prisma.TaskWhereInput = {
      ownerId: auth.user.id
    };

    if (status) {
      where.status = status;
    }

    if (dueBefore || dueAfter) {
      where.dueDate = {
        ...(dueBefore ? { lte: new Date(dueBefore) } : {}),
        ...(dueAfter ? { gte: new Date(dueAfter) } : {})
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.task.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        meta: { page, limit, total }
      }
    });
  } catch (error) {
    console.error('List tasks error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch tasks.' },
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

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(', ') },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        ownerId: auth.user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        status: (parsed.data.status as TaskStatus) || 'todo',
        priority: (parsed.data.priority as TaskPriority) || 'medium',
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          task
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create task.' },
      { status: 500 }
    );
  }
}

export default GET;
