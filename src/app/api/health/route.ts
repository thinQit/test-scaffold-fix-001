import { NextRequest, NextResponse } from 'next/server';

const VERSION = process.env.APP_VERSION || '1.0.0';

export async function GET(request: NextRequest) {
  try {
    const full = request.nextUrl.searchParams.get('full') === 'true';
    if (!full) {
      return NextResponse.json({ success: true, data: { status: 'ok' } });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        uptime_seconds: Math.floor(process.uptime()),
        version: VERSION
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Health check failed' }, { status: 500 });
  }
}
