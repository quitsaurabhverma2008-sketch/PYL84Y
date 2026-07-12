import { NextResponse } from 'next/server';
import { getAllRooms, getAllUsers, getAllMessages } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allRooms = await getAllRooms();
    const allUsers = await getAllUsers();
    const allMessages = await getAllMessages();

    return NextResponse.json({ rooms: allRooms, users: allUsers, messages: allMessages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
