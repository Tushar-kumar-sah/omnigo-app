import { NextResponse } from 'next/server';
import { getAuditTrails, getAdminRevenueSummaryLive } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [entries, summary] = await Promise.all([
      getAuditTrails(),
      getAdminRevenueSummaryLive(),
    ]);
    return NextResponse.json({ entries, summary });
  } catch (err: any) {
    console.error('[API/revenue]', err);
    return NextResponse.json({ error: err.message, entries: [], summary: { totalGMV: 0, omniGoRevenue: 0, driverPayouts: 0, pendingEscrow: 0 } }, { status: 500 });
  }
}
