import { Redis } from '@upstash/redis';

const hasStorage = !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL);

let redis: Redis | null = null;
if (hasStorage) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN!,
  });
}

const CLEANUP_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// In-memory fallback for local dev
const memRooms = new Map<string, any>();
const memUsers = new Map<string, any>();
const memMessages = new Map<string, any[]>();

async function getHash(key: string): Promise<Record<string, any>> {
  if (!redis) return {};
  const data = await redis.get<Record<string, any>>(key);
  return data || {};
}

async function saveHash(key: string, data: Record<string, any>): Promise<void> {
  if (!redis) return;
  await redis.set(key, data);
}

// === Cleanup System ===

export async function getNextCleanupTime(): Promise<number> {
  if (redis) {
    const ts = await redis.get<number>('nextCleanup');
    if (ts) return ts;
    const firstCleanup = Date.now() + CLEANUP_INTERVAL_MS;
    await redis.set('nextCleanup', firstCleanup);
    return firstCleanup;
  }
  return Date.now() + CLEANUP_INTERVAL_MS;
}

export async function runCleanupIfNeeded(): Promise<{ cleaned: boolean; roomsDeleted: number; messagesDeleted: number }> {
  const nextCleanup = await getNextCleanupTime();
  if (Date.now() < nextCleanup) {
    return { cleaned: false, roomsDeleted: 0, messagesDeleted: 0 };
  }

  const allRooms = await getAllRooms();
  const allMessages = await getAllMessages();
  const allUsers = await getAllUsers();
  const now = Date.now();

  let roomsDeleted = 0;
  let messagesDeleted = 0;

  for (const room of allRooms) {
    if (room.expiresAt && room.expiresAt < now) {
      await deleteRoom(room.id);
      roomsDeleted++;
      if (allMessages[room.id]) {
        messagesDeleted += allMessages[room.id].length;
        delete allMessages[room.id];
      }
    }
  }

  // Clean old messages (older than 3 days)
  for (const [roomId, msgs] of Object.entries(allMessages)) {
    const filtered = msgs.filter(m => m.createdAt > now - CLEANUP_INTERVAL_MS);
    messagesDeleted += msgs.length - filtered.length;
    if (redis) {
      const all = await getHash('messages');
      all[roomId] = filtered;
      await saveHash('messages', all);
    }
  }

  if (redis) {
    await redis.set('nextCleanup', now + CLEANUP_INTERVAL_MS);
  }

  return { cleaned: true, roomsDeleted, messagesDeleted };
}

// === Room Operations ===

export async function getRoom(roomId: string): Promise<any | null> {
  if (redis) {
    const rooms = await getHash('rooms');
    return rooms[roomId] || null;
  }
  return memRooms.get(roomId) || null;
}

export async function setRoom(roomId: string, room: any): Promise<void> {
  if (redis) {
    const rooms = await getHash('rooms');
    rooms[roomId] = room;
    await saveHash('rooms', rooms);
  } else {
    memRooms.set(roomId, room);
  }
}

export async function findRoomByCode(code: string): Promise<any | null> {
  if (redis) {
    const rooms = await getHash('rooms');
    for (const [, room] of Object.entries(rooms)) {
      if ((room as any).code === code) return room;
    }
    return null;
  }
  for (const [, room] of memRooms) {
    if (room.code === code) return room;
  }
  return null;
}

export async function findPermanentRoomByCode(code: string): Promise<any | null> {
  if (redis) {
    const rooms = await getHash('rooms');
    for (const [, room] of Object.entries(rooms)) {
      if ((room as any).code === code && (room as any).isPermanent) return room;
    }
    return null;
  }
  for (const [, room] of memRooms) {
    if (room.code === code && room.isPermanent) return room;
  }
  return null;
}

export async function deleteRoom(roomId: string): Promise<void> {
  if (redis) {
    const rooms = await getHash('rooms');
    delete rooms[roomId];
    await saveHash('rooms', rooms);
  } else {
    memRooms.delete(roomId);
  }
}

// === User Operations ===

export async function addUser(userId: string, user: any): Promise<void> {
  if (redis) {
    const users = await getHash('users');
    users[userId] = user;
    await saveHash('users', users);
  } else {
    memUsers.set(userId, user);
  }
}

export async function getUser(userId: string): Promise<any | null> {
  if (redis) {
    const users = await getHash('users');
    return users[userId] || null;
  }
  return memUsers.get(userId) || null;
}

// === Message Operations ===

export async function getRoomMessages(roomId: string): Promise<any[]> {
  if (redis) {
    const all = await getHash('messages');
    return all[roomId] || [];
  }
  return memMessages.get(roomId) || [];
}

export async function addRoomMessage(roomId: string, message: any): Promise<void> {
  if (redis) {
    const all = await getHash('messages');
    if (!all[roomId]) all[roomId] = [];
    all[roomId].push(message);
    await saveHash('messages', all);
  } else {
    if (!memMessages.has(roomId)) memMessages.set(roomId, []);
    memMessages.get(roomId)!.push(message);
  }
}

export async function getAllRooms(): Promise<any[]> {
  if (redis) {
    const rooms = await getHash('rooms');
    return Object.values(rooms);
  }
  return Array.from(memRooms.values());
}

export async function getAllUsers(): Promise<any[]> {
  if (redis) {
    const users = await getHash('users');
    return Object.values(users);
  }
  return Array.from(memUsers.values());
}

export async function getAllMessages(): Promise<Record<string, any[]>> {
  if (redis) {
    const all = await getHash('messages');
    return all as Record<string, any[]>;
  }
  const result: Record<string, any[]> = {};
  for (const [k, v] of memMessages) {
    result[k] = v;
  }
  return result;
}

// === User Preferences ===

export async function getUserPreferences(userId: string): Promise<{ themeId?: string; chatBg?: string; comboHistory?: Array<{ themeId: string; changedAt: number }> }> {
  if (redis) {
    const data = await getHash('userPreferences');
    return data[userId] || {};
  }
  return {};
}

export async function setUserPreferences(userId: string, prefs: { themeId?: string; chatBg?: string; comboHistory?: Array<{ themeId: string; changedAt: number }> }): Promise<void> {
  if (redis) {
    const all = await getHash('userPreferences');
    all[userId] = prefs;
    await saveHash('userPreferences', all);
  }
}

export async function appendComboHistory(userId: string, themeId: string): Promise<void> {
  const prefs = await getUserPreferences(userId);
  const history = prefs.comboHistory || [];
  history.push({ themeId, changedAt: Date.now() });
  if (history.length > 50) history.splice(0, history.length - 50);
  prefs.comboHistory = history;
  prefs.themeId = themeId;
  await setUserPreferences(userId, prefs);
}

export async function getAllUserPreferences(): Promise<Record<string, any>> {
  if (redis) {
    return await getHash('userPreferences');
  }
  return {};
}

export const hasKV = hasStorage;
