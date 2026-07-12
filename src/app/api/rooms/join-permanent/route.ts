import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { findPermanentRoomByCode, setRoom, addUser, deleteRoom } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userName } = body;

    if (!code || !userName) {
      return NextResponse.json({ error: 'Code and username are required' }, { status: 400 });
    }

    const foundRoom = await findPermanentRoomByCode(code);

    if (!foundRoom) {
      return NextResponse.json({ error: 'Permanent room not found' }, { status: 404 });
    }

    if (foundRoom.expiresAt && foundRoom.expiresAt < Date.now()) {
      await deleteRoom(foundRoom.id);
      return NextResponse.json({ error: 'Room has expired' }, { status: 410 });
    }

    const userId = uuidv4();
    foundRoom.participants.push(userId);
    await setRoom(foundRoom.id, foundRoom);

    const user = {
      id: userId,
      name: userName,
      isPermanent: true,
      createdAt: Date.now(),
    };

    await addUser(userId, user);

    return NextResponse.json({ room: foundRoom, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join permanent room' }, { status: 500 });
  }
}
