import { NextRequest, NextResponse } from 'next/server';
import { findRoomByCode, deleteRoom } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const foundRoom = await findRoomByCode(code);

    if (!foundRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!foundRoom.isPermanent) {
      return NextResponse.json({ error: 'Not a permanent room' }, { status: 400 });
    }

    if (foundRoom.expiresAt && foundRoom.expiresAt < Date.now()) {
      await deleteRoom(foundRoom.id);
      return NextResponse.json({ error: 'Room has expired' }, { status: 410 });
    }

    return NextResponse.json(foundRoom);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search room' }, { status: 500 });
  }
}
