import { NextRequest, NextResponse } from 'next/server';
import { getRoomMessages, addRoomMessage } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const roomMessages = await getRoomMessages(roomId);
    const now = Date.now();
    const validMessages = roomMessages.filter(
      (msg) => !msg.expiresAt || msg.expiresAt > now
    );

    return NextResponse.json(validMessages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, senderId, senderName, content, type, imageUrl } = body;

    if (!roomId || !senderId || !senderName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = {
      id: Math.random().toString(36).substring(7),
      roomId,
      senderId,
      senderName,
      content,
      type: type || 'text',
      imageUrl,
      createdAt: Date.now(),
      expiresAt: undefined,
    };

    await addRoomMessage(roomId, message);

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
