export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  permanentCode?: string;
  permanentExpiry?: number;
  isPermanent: boolean;
  createdAt: number;
}

export interface Room {
  id: string;
  code: string;
  isPermanent: boolean;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  participants: string[];
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
  createdAt: number;
  expiresAt?: number;
}

export interface CallState {
  isActive: boolean;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName: string;
  type: 'video' | 'voice';
  roomId: string;
}
