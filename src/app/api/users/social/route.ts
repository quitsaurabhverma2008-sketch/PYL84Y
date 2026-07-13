import { NextRequest, NextResponse } from 'next/server';
import { getUserSocial, setUserSocial, followUser, unfollowUser, blockUser, unblockUser, getUser, getAllRooms } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const social = await getUserSocial(userId);
    const user = await getUser(userId);
    const rooms = await getAllRooms();
    const userRooms = rooms.filter((r: any) => r.isPermanent && r.participants.includes(userId));

    const followers = await Promise.all(
      (social.followers || []).map(async (id: string) => {
        const u = await getUser(id);
        return u ? { id: u.id, name: u.name, bio: u.bio || '', permanentCode: u.permanentCode } : null;
      })
    );
    const following = await Promise.all(
      (social.following || []).map(async (id: string) => {
        const u = await getUser(id);
        return u ? { id: u.id, name: u.name, bio: u.bio || '', permanentCode: u.permanentCode } : null;
      })
    );

    return NextResponse.json({
      bio: user?.bio || social.bio || '',
      followers: followers.filter(Boolean),
      following: following.filter(Boolean),
      blocked: social.blocked || [],
      rooms: userRooms,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, targetId, bio } = body;
    if (!action || !userId) return NextResponse.json({ error: 'action and userId required' }, { status: 400 });

    switch (action) {
      case 'updateBio': {
        const social = await getUserSocial(userId);
        social.bio = bio || '';
        await setUserSocial(userId, social);
        const user = await getUser(userId);
        if (user) {
          user.bio = bio || '';
          const { addUser } = await import('@/lib/db');
          await addUser(userId, user);
        }
        return NextResponse.json({ success: true });
      }
      case 'follow': {
        if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });
        await followUser(userId, targetId);
        return NextResponse.json({ success: true });
      }
      case 'unfollow': {
        if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });
        await unfollowUser(userId, targetId);
        return NextResponse.json({ success: true });
      }
      case 'block': {
        if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });
        await blockUser(userId, targetId);
        return NextResponse.json({ success: true });
      }
      case 'unblock': {
        if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 });
        await unblockUser(userId, targetId);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
