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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tier = await db.pricingTier.findUnique({ where: { id: params.id } });
    if (!tier) {
      return NextResponse.json({ success: false, error: 'Pricing tier not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        id: tier.id,
        name: tier.name,
        price_monthly: tier.priceMonthly,
        features: parseFeatures(tier.features),
        cta_text: tier.ctaText
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch pricing tier' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = pricingSchema.parse(await request.json());
    const tier = await db.pricingTier.update({
      where: { id: params.id },
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
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors[0]?.message || 'Invalid input' : 'Failed to update pricing tier';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.pricingTier.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete pricing tier' }, { status: 500 });
  }
}
