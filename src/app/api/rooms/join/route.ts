import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { rooms, users } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userName } = body;

    if (!code || !userName) {
      return NextResponse.json({ error: 'Code and username are required' }, { status: 400 });
    }

    let foundRoom = null;
    for (const [, room] of rooms) {
      if (room.code === code) {
        foundRoom = room;
        break;
      }
    }

    if (!foundRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const userId = uuidv4();
    foundRoom.participants.push(userId);

    const user = {
      id: userId,
      name: userName,
      isPermanent: foundRoom.isPermanent,
      createdAt: Date.now(),
    };

    users.set(userId, user);

    return NextResponse.json({ room: foundRoom, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
