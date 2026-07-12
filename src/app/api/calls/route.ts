import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
})();

const memCalls = new Map<string, any>();

async function getCallState(roomId: string): Promise<any | null> {
  if (redis) {
    return await redis.get(`call:${roomId}`);
  }
  return memCalls.get(roomId) || null;
}

async function setCallState(roomId: string, state: any): Promise<void> {
  if (redis) {
    await redis.set(`call:${roomId}`, state);
  } else {
    memCalls.set(roomId, state);
  }
}

async function deleteCallState(roomId: string): Promise<void> {
  if (redis) {
    await redis.del(`call:${roomId}`);
  } else {
    memCalls.delete(roomId);
  }
}

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId');
  const userId = req.nextUrl.searchParams.get('userId');
  if (!roomId || !userId) {
    return NextResponse.json({ error: 'roomId and userId required' }, { status: 400 });
  }

  const state = await getCallState(roomId);
  if (!state) return NextResponse.json({ status: 'idle' });

  const isCaller = state.callerId === userId;
  const isReceiver = state.receiverId === userId;

  if (state.status === 'ringing' && isReceiver) {
    return NextResponse.json({
      status: 'ringing',
      callType: state.callType,
      callerName: state.callerName,
      callerId: state.callerId,
      offer: state.offer,
    });
  }

  if (state.status === 'ringing' && isCaller) {
    return NextResponse.json({ status: 'ringing', callType: state.callType });
  }

  if (state.status === 'answered') {
    if (isCaller && state.answer) {
      return NextResponse.json({ status: 'answered', answer: state.answer, callType: state.callType });
    }
    if (isReceiver) {
      return NextResponse.json({ status: 'answered', callType: state.callType });
    }
  }

  if (state.status === 'ended' || state.status === 'declined') {
    return NextResponse.json({ status: state.status });
  }

  return NextResponse.json({ status: state.status || 'idle' });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, roomId } = body;

  if (!action || !roomId) {
    return NextResponse.json({ error: 'action and roomId required' }, { status: 400 });
  }

  if (action === 'initiate') {
    const { callerId, callerName, receiverId, receiverName, callType, offer } = body;
    await setCallState(roomId, {
      status: 'ringing',
      callType,
      callerId,
      callerName,
      receiverId,
      receiverName,
      offer,
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'answer') {
    const { answer, receiverId } = body;
    const state = await getCallState(roomId);
    if (!state) return NextResponse.json({ error: 'No active call' }, { status: 400 });
    state.status = 'answered';
    state.answer = answer;
    state.answeredAt = Date.now();
    await setCallState(roomId, state);
    return NextResponse.json({ ok: true });
  }

  if (action === 'decline') {
    const state = await getCallState(roomId);
    if (!state) return NextResponse.json({ error: 'No active call' }, { status: 400 });
    state.status = 'declined';
    state.declinedAt = Date.now();
    await setCallState(roomId, state);
    setTimeout(() => deleteCallState(roomId), 10000);
    return NextResponse.json({ ok: true });
  }

  if (action === 'end') {
    const state = await getCallState(roomId);
    if (!state) return NextResponse.json({ error: 'No active call' }, { status: 400 });
    state.status = 'ended';
    state.endedAt = Date.now();
    await setCallState(roomId, state);
    setTimeout(() => deleteCallState(roomId), 10000);
    return NextResponse.json({ ok: true });
  }

  if (action === 'ice') {
    const { candidate, senderId } = body;
    const state = await getCallState(roomId);
    if (!state) return NextResponse.json({ error: 'No active call' }, { status: 400 });
    if (!state.iceCandidates) state.iceCandidates = [];
    state.iceCandidates.push({ candidate, senderId, at: Date.now() });
    await setCallState(roomId, state);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
