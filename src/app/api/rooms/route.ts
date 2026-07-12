import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { rooms, users } from '@/lib/db';

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generatePermanentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
    const roomCode = isPermanent ? generatePermanentCode() : generateRoomCode();

    const room = {
      id: roomId,
      code: roomCode,
      isPermanent,
      createdBy: userId,
      createdAt: Date.now(),
      expiresAt: isPermanent ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000,
      participants: [userId],
    };

    const user = {
      id: userId,
      name: userName,
      isPermanent,
      createdAt: Date.now(),
      permanentCode: isPermanent ? roomCode : undefined,
      permanentExpiry: isPermanent ? room.expiresAt : undefined,
    };

    rooms.set(roomId, room);
    users.set(userId, user);

    return NextResponse.json({ room, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
