import { NextResponse } from 'next/server';
import { runCleanupIfNeeded } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await runCleanupIfNeeded();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
