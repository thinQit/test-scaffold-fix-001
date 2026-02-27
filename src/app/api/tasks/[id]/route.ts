import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { TaskPriority, TaskStatus } from '@prisma/client';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional()
});

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: { id: context.params.id, ownerId: auth.user.id }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch task.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().formErrors.join(', ') },
        { status: 400 }
      );
    }

    const updates: {
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
      priority?: TaskPriority;
      status?: TaskStatus;
    } = {};

    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.dueDate !== undefined) {
      updates.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    }
    if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority as TaskPriority;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status as TaskStatus;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields provided for update.' },
        { status: 400 }
      );
    }

    const existing = await prisma.task.findFirst({
      where: { id: context.params.id, ownerId: auth.user.id }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: updates
    });

    return NextResponse.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Update task error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update task.' },
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

    const deleted = await prisma.task.deleteMany({
      where: { id: context.params.id, ownerId: auth.user.id }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { message: 'Task deleted' } });
  } catch (error) {
    console.error('Delete task error', error);
    return NextResponse.json(
      { success: false, error: 'Unable to delete task.' },
      { status: 500 }
    );
  }
}

export default GET;
