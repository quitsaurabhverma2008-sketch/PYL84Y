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

    const roomDetails = allRooms.map(room => {
      const roomUsers = allUsers.filter(u =>
        room.participants.includes(u.id)
      );
      const roomMessages = allMessages[room.id] || [];

      return {
        ...room,
        userDetails: roomUsers,
        messageCount: roomMessages.length,
        messages: roomMessages,
      };
    });

    return NextResponse.json({
      totalRooms: allRooms.length,
      totalUsers: allUsers.length,
      totalMessages: Object.values(allMessages).reduce((sum, msgs) => sum + msgs.length, 0),
      rooms: roomDetails,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
