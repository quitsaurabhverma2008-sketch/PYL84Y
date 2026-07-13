import { NextRequest, NextResponse } from 'next/server';
import { searchUsers, getUserSocial } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const userId = searchParams.get('userId') || '';

    const results = await searchUsers(q);
    const currentUserSocial: { following: string[]; blocked: string[] } = userId ? await getUserSocial(userId) : { following: [], blocked: [] };

    const users = results
      .filter((u: any) => u.id !== userId)
      .filter((u: any) => !(currentUserSocial.blocked || []).includes(u.id))
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        bio: u.bio || '',
        permanentCode: u.permanentCode,
        isFollowing: (currentUserSocial.following || []).includes(u.id),
      }));

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
