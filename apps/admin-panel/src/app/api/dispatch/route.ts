import { NextResponse } from 'next/server';
import { getDispatchQueue, getFleetStatus, assignDriver } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [queue, fleet] = await Promise.all([
      getDispatchQueue(),
      getFleetStatus(),
    ]);
    return NextResponse.json({ queue, fleet });
  } catch (err: any) {
    console.error('[API/dispatch]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, driverName } = body;
    if (!jobId || !driverName) {
      return NextResponse.json({ error: 'Missing jobId or driverName' }, { status: 400 });
    }
    await assignDriver(jobId, driverName);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API/dispatch POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
