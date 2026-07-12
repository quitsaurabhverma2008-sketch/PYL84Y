import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { setRoom, addUser } from '@/lib/db';

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, isPermanent } = body;

    if (!userName) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const userId = uuidv4();
    const roomId = uuidv4();
    const roomCode = generateRoomCode();

    const room = {
      id: roomId,
      code: roomCode,
      isPermanent: false,
      createdBy: userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      participants: [userId],
    };

    const user = {
      id: userId,
      name: userName,
      isPermanent: false,
      createdAt: Date.now(),
    };

    await setRoom(roomId, room);
    await addUser(userId, user);

    return NextResponse.json({ room, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
