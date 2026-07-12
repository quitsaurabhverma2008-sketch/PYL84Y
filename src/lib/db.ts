import { kv } from '@vercel/kv';

const hasKV = !!process.env.KV_REST_API_URL;

async function getMap(key: string): Promise<Map<string, any>> {
  if (!hasKV) return new Map();
  const data = await kv.get<Record<string, any>>(key);
  return new Map(Object.entries(data || {}));
}

async function saveMap(key: string, map: Map<string, any>): Promise<void> {
  if (!hasKV) return;
  const obj: Record<string, any> = {};
  for (const [k, v] of map) {
    obj[k] = v;
  }
  await kv.set(key, obj);
}

export async function getRooms(): Promise<Map<string, any>> {
  return getMap('rooms');
}

export async function saveRooms(map: Map<string, any>): Promise<void> {
  await saveMap('rooms', map);
}

export async function getUsers(): Promise<Map<string, any>> {
  return getMap('users');
}

export async function saveUsers(map: Map<string, any>): Promise<void> {
  await saveMap('users', map);
}

export async function getMessages(): Promise<Map<string, any[]>> {
  if (!hasKV) return new Map();
  const data = await kv.get<Record<string, any[]>>('messages');
  return new Map(Object.entries(data || {}));
}

export async function saveMessages(map: Map<string, any[]>): Promise<void> {
  if (!hasKV) return;
  const obj: Record<string, any[]> = {};
  for (const [k, v] of map) {
    obj[k] = v;
  }
  await kv.set('messages', obj);
}

// In-memory fallback for local dev without KV
const memRooms = new Map<string, any>();
const memUsers = new Map<string, any>();
const memMessages = new Map<string, any[]>();

export async function getRoom(roomId: string): Promise<any | null> {
  const rooms = hasKV ? await getRooms() : memRooms;
  return rooms.get(roomId) || null;
}

export async function setRoom(roomId: string, room: any): Promise<void> {
  if (hasKV) {
    const rooms = await getRooms();
    rooms.set(roomId, room);
    await saveRooms(rooms);
  } else {
    memRooms.set(roomId, room);
  }
}

export async function findRoomByCode(code: string): Promise<any | null> {
  const rooms = hasKV ? await getRooms() : memRooms;
  for (const [, room] of rooms) {
    if (room.code === code) return room;
  }
  return null;
}

export async function findPermanentRoomByCode(code: string): Promise<any | null> {
  const rooms = hasKV ? await getRooms() : memRooms;
  for (const [, room] of rooms) {
    if (room.code === code && room.isPermanent) return room;
  }
  return null;
}

export async function deleteRoom(roomId: string): Promise<void> {
  if (hasKV) {
    const rooms = await getRooms();
    rooms.delete(roomId);
    await saveRooms(rooms);
  } else {
    memRooms.delete(roomId);
  }
}

export async function addUser(userId: string, user: any): Promise<void> {
  if (hasKV) {
    const users = await getUsers();
    users.set(userId, user);
    await saveUsers(users);
  } else {
    memUsers.set(userId, user);
  }
}

export async function getUser(userId: string): Promise<any | null> {
  const users = hasKV ? await getUsers() : memUsers;
  return users.get(userId) || null;
}

export async function getRoomMessages(roomId: string): Promise<any[]> {
  const all = hasKV ? await getMessages() : memMessages;
  return all.get(roomId) || [];
}

export async function addRoomMessage(roomId: string, message: any): Promise<void> {
  if (hasKV) {
    const all = await getMessages();
    if (!all.has(roomId)) all.set(roomId, []);
    all.get(roomId)!.push(message);
    await saveMessages(all);
  } else {
    if (!memMessages.has(roomId)) memMessages.set(roomId, []);
    memMessages.get(roomId)!.push(message);
  }
}

export async function getAllRooms(): Promise<any[]> {
  const rooms = hasKV ? await getRooms() : memRooms;
  return Array.from(rooms.values());
}

export async function getAllUsers(): Promise<any[]> {
  const users = hasKV ? await getUsers() : memUsers;
  return Array.from(users.values());
}

export async function getAllMessages(): Promise<Record<string, any[]>> {
  const msgs = hasKV ? await getMessages() : memMessages;
  const result: Record<string, any[]> = {};
  for (const [k, v] of msgs) {
    result[k] = v;
  }
  return result;
}

export { hasKV };
