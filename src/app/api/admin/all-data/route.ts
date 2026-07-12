import { NextResponse } from 'next/server';
import { getAllRooms, getAllUsers, getAllMessages, hasKV } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allRooms = await getAllRooms();
    const allUsers = await getAllUsers();
    const allMessages = await getAllMessages();

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
      kvConnected: hasKV,
      totalRooms: allRooms.length,
      totalUsers: allUsers.length,
      totalMessages: Object.values(allMessages).reduce((sum, msgs) => sum + msgs.length, 0),
      rooms: roomDetails,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
