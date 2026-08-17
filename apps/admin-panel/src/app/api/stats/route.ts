import { NextResponse } from 'next/server';
import { getDashboardStats, getRevenueData } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [stats, revenue] = await Promise.all([
      getDashboardStats(),
      getRevenueData(),
    ]);
    return NextResponse.json({ stats, revenue });
  } catch (err: any) {
    console.error('[API/stats]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
