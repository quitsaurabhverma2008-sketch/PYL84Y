import { NextRequest, NextResponse } from 'next/server';
import { rooms } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    let foundRoom = null;
    for (const [, room] of rooms) {
      if (room.code === code && room.isPermanent) {
        foundRoom = room;
        break;
      }
    }

    if (!foundRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (foundRoom.expiresAt && foundRoom.expiresAt < Date.now()) {
      rooms.delete(foundRoom.id);
      return NextResponse.json({ error: 'Room has expired' }, { status: 410 });
    }

    return NextResponse.json(foundRoom);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search room' }, { status: 500 });
  }
}
