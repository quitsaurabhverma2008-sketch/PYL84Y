import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { setRoom, addUser } from '@/lib/db';

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
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 });
    }

    const userId = uuidv4();
    const roomId = uuidv4();
    const permanentCode = generatePermanentCode();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const room = {
      id: roomId,
      code: permanentCode,
      isPermanent: true,
      createdBy: userId,
      createdAt: Date.now(),
      expiresAt,
      participants: [userId],
    };

    const user = {
      id: userId,
      name,
      email,
      phone,
      isPermanent: true,
      permanentCode,
      permanentExpiry: expiresAt,
      createdAt: Date.now(),
    };

    await setRoom(roomId, room);
    await addUser(userId, user);

    return NextResponse.json({ room, user, permanentCode });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create permanent room' }, { status: 500 });
  }
}
