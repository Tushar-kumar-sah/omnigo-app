import { NextResponse } from 'next/server';
import { getFraudIncidents } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = await getFraudIncidents();
    return NextResponse.json({ incidents });
  } catch (err: any) {
    // fraud_incidents table may not exist — return empty gracefully
    return NextResponse.json({ incidents: [] });
  }
}
