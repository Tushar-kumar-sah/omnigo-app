import { NextRequest, NextResponse } from 'next/server';
import { getActiveSOSIncidents, updateSOSStatus } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = await getActiveSOSIncidents();
    return NextResponse.json({ incidents });
  } catch (err: any) {
    console.error('[API/sos GET]', err);
    return NextResponse.json({ incidents: [] }); // graceful fallback
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    await updateSOSStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API/sos PATCH]', err);
    return NextResponse.json({ success: false }); // graceful fallback
  }
}
