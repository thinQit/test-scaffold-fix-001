import { NextResponse } from 'next/server';

export async function GET() {
  const uptimeSeconds = Math.floor(process.uptime());
  const timestamp = new Date().toISOString();

  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      uptimeSeconds,
      timestamp
    }
  });
}

export default GET;
