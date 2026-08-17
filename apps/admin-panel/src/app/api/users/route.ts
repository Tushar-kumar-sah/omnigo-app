import { NextResponse } from 'next/server';
import { getUsers } from '@omnigo/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('[API/users]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
