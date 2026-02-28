import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const pricingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price_monthly: z.number().nonnegative(),
  features: z.array(z.string().min(1)).default([]),
  cta_text: z.string().min(1, 'CTA text is required')
});

function parseFeatures(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const tiers = await db.pricingTier.findMany({ orderBy: { priceMonthly: 'asc' } });
    const data = tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      price_monthly: tier.priceMonthly,
      features: parseFeatures(tier.features),
      cta_text: tier.ctaText
    }));
    return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch pricing tiers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = pricingSchema.parse(await request.json());
    const tier = await db.pricingTier.create({
      data: {
        name: body.name,
        priceMonthly: body.price_monthly,
        features: JSON.stringify(body.features),
        ctaText: body.cta_text
      }
    });
    return NextResponse.json({
      success: true,
      data: {
        id: tier.id,
        name: tier.name,
        price_monthly: tier.priceMonthly,
        features: body.features,
        cta_text: tier.ctaText
      }
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message || 'Invalid input' : 'Failed to create pricing tier';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
