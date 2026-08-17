import { NextResponse } from 'next/server';
import { getBookings } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ bookings });
  } catch (err: any) {
    console.error('[API/bookings]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
