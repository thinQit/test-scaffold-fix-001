import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const featureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required')
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const feature = await db.feature.findUnique({ where: { id: params.id } });
    if (!feature) {
      return NextResponse.json({ success: false, error: 'Feature not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: feature });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch feature' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = featureSchema.parse(await request.json());
    const feature = await db.feature.update({ where: { id: params.id }, data: body });
    return NextResponse.json({ success: true, data: feature });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message || 'Invalid input' : 'Failed to update feature';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.feature.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete feature' }, { status: 500 });
  }
}
