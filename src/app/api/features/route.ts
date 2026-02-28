import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const featureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required')
});

export async function GET() {
  try {
    const features = await db.feature.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json({ success: true, data: features }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch features' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = featureSchema.parse(await request.json());
    const feature = await db.feature.create({ data: body });
    return NextResponse.json({ success: true, data: feature }, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message || 'Invalid input' : 'Failed to create feature';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
