import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const leadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('Valid email is required'),
  selected_plan: z.string().min(1).optional()
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  rateLimitMap.set(key, entry);
  return true;
}

export async function GET() {
  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: leads });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const key = getClientKey(request);
    if (!checkRateLimit(key)) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = leadSchema.parse(await request.json());
    const lead = await db.lead.create({
      data: {
        name: body.name,
        email: body.email,
        selectedPlan: body.selected_plan
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: lead.id,
        status: 'created',
        lead: {
          name: lead.name,
          email: lead.email,
          selected_plan: lead.selectedPlan,
          created_at: lead.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message || 'Invalid input' : 'Failed to create lead';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
