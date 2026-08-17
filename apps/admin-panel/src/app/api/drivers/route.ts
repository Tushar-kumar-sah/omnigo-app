import { NextResponse } from 'next/server';
import { getDrivers } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const drivers = await getDrivers();
    return NextResponse.json({ drivers });
  } catch (err: any) {
    console.error('[API/drivers]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
