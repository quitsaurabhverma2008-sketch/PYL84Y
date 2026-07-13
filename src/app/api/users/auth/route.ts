import { NextRequest, NextResponse } from 'next/server';
import { findUserByGmail, getAllRooms } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gmail } = body;

    if (!gmail || !gmail.trim()) {
      return NextResponse.json({ error: 'Gmail is required' }, { status: 400 });
    }

    const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!gmailRegex.test(gmail.trim())) {
      return NextResponse.json({ error: 'Invalid Gmail format' }, { status: 400 });
    }

    const user = await findUserByGmail(gmail.trim());

    if (!user) {
      return NextResponse.json({ error: 'Account not found with this Gmail' }, { status: 404 });
    }

    if (user.permanentExpiry && user.permanentExpiry < Date.now()) {
      return NextResponse.json({ error: 'Account expired. Please create a new one.' }, { status: 410 });
    }

    const allRooms = await getAllRooms();
    const room = allRooms.find((r: any) => r.isPermanent && r.participants.includes(user.id));

    if (!room) {
      return NextResponse.json({ error: 'No active room found for this account' }, { status: 404 });
    }

    return NextResponse.json({ user, room });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
