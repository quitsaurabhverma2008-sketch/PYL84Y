import { NextResponse } from 'next/server';
import { rooms, users, messages } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allRooms: any[] = [];
    for (const [, room] of rooms) {
      allRooms.push({ ...room });
    }

    const allUsers: any[] = [];
    for (const [, user] of users) {
      allUsers.push({ ...user });
    }

    const allMessages: Record<string, any[]> = {};
    for (const [roomId, msgs] of messages) {
      allMessages[roomId] = msgs.map(m => ({ ...m }));
    }

    return NextResponse.json({ rooms: allRooms, users: allUsers, messages: allMessages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
