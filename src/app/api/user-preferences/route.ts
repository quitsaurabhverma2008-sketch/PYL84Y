import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences, setUserPreferences, appendComboHistory } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  const prefs = await getUserPreferences(userId);
  return NextResponse.json(prefs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action } = body;
    if (!userId || !action) return NextResponse.json({ error: 'userId and action required' }, { status: 400 });

    if (action === 'setTheme') {
      const { themeId } = body;
      if (!themeId) return NextResponse.json({ error: 'themeId required' }, { status: 400 });
      await appendComboHistory(userId, themeId);
      return NextResponse.json({ ok: true });
    }

    if (action === 'setChatBg') {
      const { chatBg } = body;
      const prefs = await getUserPreferences(userId);
      prefs.chatBg = chatBg || null;
      await setUserPreferences(userId, prefs);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
