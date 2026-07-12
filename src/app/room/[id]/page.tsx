'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { animate } from 'animejs';
import { applyTheme, getComboById } from '@/lib/themes';
import ThemePicker from '@/components/ThemePicker';
import ChatBgPicker from '@/components/ChatBgPicker';
import { useTheme } from '@/components/ThemeProvider';

const ChatBackground = dynamic(() => import('@/components/ChatBackground'), { ssr: false });

interface Message {
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

interface Room {
  id: string;
  code: string;
  isPermanent: boolean;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  participants: string[];
}

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  permanentCode?: string;
  permanentExpiry?: number;
  isPermanent: boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  const [callState, setCallState] = useState<'idle' | 'outgoing' | 'incoming' | 'active' | 'ended'>('idle');
  const [callType, setCallType] = useState<'video' | 'voice'>('voice');
  const [incomingCallData, setIncomingCallData] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const callStateRef = useRef<string>('idle');

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => { callStateRef.current = callState; }, [callState]);

  const [chatBg, setChatBg] = useState<string | null>(null);
  const { setCombo, setShowThemePicker, setShowChatBgPicker, isPermanent, combo: themeCombo } = useTheme();
  const [showRoomSettings, setShowRoomSettings] = useState(false);

  useEffect(() => {
    const storedRoom = localStorage.getItem('pyl84y_room');
    const storedUser = localStorage.getItem('pyl84y_user');
    if (!storedRoom || !storedUser) { router.push('/'); return; }
    const parsedRoom = JSON.parse(storedRoom);
    const parsedUser = JSON.parse(storedUser);
    if (parsedRoom.id !== id) { router.push('/'); return; }
    setRoom(parsedRoom);
    setUser(parsedUser);
    if (parsedUser.prefs?.themeId) applyTheme(getComboById(parsedUser.prefs.themeId));
    if (parsedUser.prefs?.chatBg) setChatBg(parsedUser.prefs.chatBg);
  }, [id, router]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!room) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?roomId=${room.id}`);
        const data = await res.json();
        setMessages(data);
      } catch (e) {}
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [room]);

  useEffect(() => {
    if (messages.length > prevMsgCount.current && messagesRef.current) {
      const newMsgs = messagesRef.current.querySelectorAll('.message-bubble:not(.animated)');
      if (newMsgs.length > 0) {
        animate(newMsgs, {
          opacity: [0, 1],
          translateY: [15, 0],
          scale: [0.95, 1],
          duration: 350,
          ease: 'outBack',
        });
        newMsgs.forEach(el => el.classList.add('animated'));
      }
    }
    prevMsgCount.current = messages.length;
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteStreamRef.current = null;
    if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
    setCallDuration(0);
    setIncomingCallData(null);
  }, []);

  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!room || !user) return;
    const poll = async () => {
      const cs = callStateRef.current;
      if (cs === 'active') return;
      try {
        const res = await fetch(`/api/calls?roomId=${room.id}&userId=${user.id}`);
        const data = await res.json();
        if (data.status === 'ringing' && data.callerId !== user.id && cs !== 'incoming') {
          setIncomingCallData(data);
          setCallType(data.callType);
          setCallState('incoming');
        }
        if (data.status === 'answered' && cs === 'outgoing' && data.answer) {
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            setCallState('active');
            startCallTimer();
          }
        }
        if (data.status === 'declined' && cs === 'outgoing') {
          cleanupCall();
          setCallState('idle');
        }
        if (data.status === 'ended' && (cs === 'active' || cs === 'outgoing')) {
          cleanupCall();
          setCallState('idle');
        }
      } catch (e) {}
    };
    pollRef.current = setInterval(poll, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [room, user, cleanupCall, startCallTimer]);

  useEffect(() => () => { cleanupCall(); }, [cleanupCall]);

  const initiateCall = async (type: 'video' | 'voice') => {
    if (!room || !user) return;
    const receiverId = room.participants.find(p => p !== user.id);
    if (!receiverId) { alert('No other user in the room to call!'); return; }
    setCallType(type);
    setCallState('outgoing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current && type === 'video') localVideoRef.current.srcObject = stream;
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        remoteStreamRef.current = e.streams[0];
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
      };
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'ice', roomId: room.id, candidate: e.candidate ? { candidate: e.candidate.candidate, sdpMid: e.candidate.sdpMid, sdpMLineIndex: e.candidate.sdpMLineIndex, usernameFragment: e.candidate.usernameFragment } : null, senderId: user.id }) });
        }
      };
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') endCall();
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initiate', roomId: room.id, callerId: user.id, callerName: user.name, receiverId, callType: type, offer: { type: offer.type, sdp: offer.sdp } }) });
    } catch (e) {
      console.error('Failed to initiate call:', e);
      cleanupCall();
      setCallState('idle');
    }
  };

  const acceptCall = async () => {
    if (!room || !user || !incomingCallData) return;
    setCallState('active');
    try {
      const type = incomingCallData.callType;
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current && type === 'video') localVideoRef.current.srcObject = stream;
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        remoteStreamRef.current = e.streams[0];
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
      };
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'ice', roomId: room.id, candidate: e.candidate ? { candidate: e.candidate.candidate, sdpMid: e.candidate.sdpMid, sdpMLineIndex: e.candidate.sdpMLineIndex, usernameFragment: e.candidate.usernameFragment } : null, senderId: user.id }) });
        }
      };
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') endCall();
      };
      if (incomingCallData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));
      }
      if (incomingCallData.iceCandidates) {
        for (const ice of incomingCallData.iceCandidates) {
          if (ice.senderId !== user.id) {
            try { await pc.addIceCandidate(new RTCIceCandidate(ice.candidate)); } catch (e) {}
          }
        }
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', roomId: room.id, answer: { type: answer.type, sdp: answer.sdp }, receiverId: user.id }) });
      startCallTimer();
    } catch (e) {
      console.error('Failed to accept call:', e);
      declineCall();
    }
  };

  const declineCall = async () => {
    if (!room) return;
    await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decline', roomId: room.id }) });
    cleanupCall();
    setCallState('idle');
  };

  const endCall = async () => {
    if (room) {
      await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', roomId: room.id }) });
    }
    cleanupCall();
    setCallState('idle');
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !room || !user) return;
    try {
      await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, senderId: user.id, senderName: user.name, content: inputText.trim(), type: 'text' }) });
      setInputText('');
    } catch (e) {}
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !room || !user) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const { url } = await uploadRes.json();
      await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, senderId: user.id, senderName: user.name, content: 'Image', type: 'image', imageUrl: url }) });
    } catch (e) {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadChat = () => {
    const chatText = messages.map(m => {
      const time = new Date(m.createdAt).toLocaleString();
      return m.type === 'image' ? `[${time}] ${m.senderName}: [Image] ${m.imageUrl}` : `[${time}] ${m.senderName}: ${m.content}`;
    }).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PYL84Y-chat-${room?.code}-${new Date().toISOString().slice(0, 10)}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const saveImage = (imageUrl: string) => {
    const a = document.createElement('a');
    a.href = imageUrl; a.download = `PYL84Y-${Date.now()}.jpg`; a.click();
  };

  const leaveRoom = () => {
    endCall();
    localStorage.removeItem('pyl84y_room');
    localStorage.removeItem('pyl84y_user');
    router.push('/');
  };

  if (!room || !user) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
        <div className="animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
      </div>
    );
  }

  const isInCall = callState === 'outgoing' || callState === 'incoming' || callState === 'active';

  return (
    <div className="chat-container" style={{ background: 'var(--color-background)' }}>
      <ChatBackground />
      <audio ref={remoteAudioRef} autoPlay />

      {/* INCOMING CALL OVERLAY */}
      {callState === 'incoming' && incomingCallData && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--color-overlay)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', backdropFilter: 'blur(20px)' }} className="animate-in">
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px var(--color-glow-strong)' }} className="animate-pulse">
            {callType === 'video' ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)' }} className="text-gradient">{incomingCallData.callerName}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '6px' }}>{callType === 'video' ? 'Incoming Video Call' : 'Incoming Voice Call'}</p>
          </div>
          <div style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
            <button onClick={declineCall} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-danger), #b91c1c)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px var(--color-danger)4d', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
            </button>
            <button onClick={acceptCall} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-success), #16a34a)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(34,197,94,0.3)', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              {callType === 'video' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              )}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '12px' }}>Tap to {callType === 'video' ? 'accept video' : 'answer'}</p>
        </div>
      )}

      {/* OUTGOING CALL OVERLAY */}
      {callState === 'outgoing' && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--color-overlay)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', backdropFilter: 'blur(20px)' }} className="animate-in">
          {callType === 'video' && (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, opacity: 0.3 }} />
              <video ref={localVideoRef} autoPlay playsInline muted style={{ position: 'absolute', bottom: '140px', right: '20px', width: '120px', height: '160px', borderRadius: '14px', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover', zIndex: 2 }} />
            </>
          )}
          {callType === 'voice' && (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px var(--color-glow-strong)' }} className="animate-pulse">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
          )}
          <div style={{ textAlign: 'center', zIndex: 2 }}>
            <p style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Calling...</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>Waiting for answer</p>
          </div>
          <button onClick={endCall} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-danger), #b91c1c)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px var(--color-danger)4d', zIndex: 2, transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
          </button>
        </div>
      )}

      {/* ACTIVE CALL OVERLAY */}
      {callState === 'active' && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 200 }}>
          {callType === 'video' ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: '20px', backdropFilter: 'blur(10px)', fontSize: '14px', fontWeight: '600', color: 'white', fontVariantNumeric: 'tabular-nums' }}>{formatDuration(callDuration)}</div>
              </div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
                <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '110px', height: '150px', borderRadius: '14px', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', zIndex: 2 }}>
                <button onClick={endCall} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-danger)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px var(--color-danger)66' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: 'linear-gradient(180deg, var(--color-background) 0%, var(--color-bg-alt) 100%)' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px var(--color-glow-strong)' }} className="animate-pulse">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{formatDuration(callDuration)}</p>
              <button onClick={endCall} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-danger)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px var(--color-danger)4d' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* HEADER */}
      <div style={{ padding: '12px 16px', background: 'var(--color-overlay)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={leaveRoom} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>PYL84Y</h2>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', marginRight: '4px' }} />
              {room.isPermanent ? 'Permanent' : 'Temporary'} · {room.code} · {room.participants.length} online
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isInCall && (
            <>
              <button onClick={() => initiateCall('voice')} style={{ background: 'var(--color-accent)26', border: '1px solid var(--color-accent)4d', color: 'var(--color-accent)', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Voice
              </button>
              <button onClick={() => initiateCall('video')} style={{ background: 'var(--color-primary)26', border: '1px solid var(--color-primary)4d', color: 'var(--color-primary)', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Video
              </button>
            </>
          )}
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '8px 10px', borderRadius: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      {/* MENU */}
      {showMenu && (
        <div style={{ position: 'absolute', top: '60px', right: '16px', background: 'var(--color-muted)', border: '1px solid var(--color-card-border)', borderRadius: '14px', padding: '6px', zIndex: 30, minWidth: '200px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} className="animate-scale">
          <button onClick={() => { setShowCode(true); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--color-foreground)', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Show Room Code
          </button>
          <button onClick={() => { downloadChat(); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--color-foreground)', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Chat
          </button>
          {room.isPermanent && (
            <>
              <div style={{ height: '1px', background: 'var(--color-card-border)', margin: '4px 8px' }} />
              <button onClick={() => { setShowThemePicker(true); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--color-foreground)', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="12" r="2.5" /><circle cx="8" cy="18" r="2.5" /><circle cx="16" cy="18" r="2.5" /></svg>
                Color Theme
                <div style={{ display: 'flex', gap: '3px', marginLeft: 'auto' }}>
                  {[themeCombo.primary, themeCombo.secondary].map((c, i) => (
                    <div key={i} style={{ width: '12px', height: '12px', borderRadius: '4px', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
                  ))}
                </div>
              </button>
              <button onClick={() => { setShowChatBgPicker(true); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--color-foreground)', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Chat Background
                {chatBg ? <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>ON</span> : <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-text-muted)' }}>OFF</span>}
              </button>
            </>
          )}
          <div style={{ height: '1px', background: 'var(--color-card-border)', margin: '4px 8px' }} />
          <button onClick={() => { setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Leave Room
          </button>
        </div>
      )}

      {/* ROOM CODE MODAL */}
      {showCode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(8px)' }} onClick={() => setShowCode(false)}>
          <div className="card animate-glow" style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Room Code</h3>
            <p style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '8px', fontFamily: 'var(--font-heading)', marginBottom: '8px' }} className="text-gradient">{room.code}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>{room.isPermanent ? 'Permanent · Valid 7 days' : 'Temporary · Valid 24 hours'}</p>
            <button className="btn-primary" onClick={() => navigator.clipboard.writeText(room.code)}>Copy Code</button>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="messages-area" ref={messagesRef} style={chatBg ? { backgroundImage: `url(${chatBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'multiply', backgroundColor: 'rgba(15,23,42,0.85)' } : undefined}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '14px', color: 'var(--color-text-muted)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p style={{ fontSize: '14px' }}>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.senderId === user.id ? 'message-own' : msg.type === 'system' ? 'message-system' : 'message-other'}`}>
            {msg.senderId !== user.id && msg.type !== 'system' && (
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-secondary)', marginBottom: '3px' }}>{msg.senderName}</p>
            )}
            {msg.type === 'image' && msg.imageUrl ? (
              <div>
                <img src={msg.imageUrl} alt="Shared" style={{ maxWidth: '100%', borderRadius: '12px', cursor: 'pointer' }} onClick={() => saveImage(msg.imageUrl!)} />
                <button onClick={() => saveImage(msg.imageUrl!)} style={{ marginTop: '6px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Save
                </button>
              </div>
            ) : (
              <p>{msg.content}</p>
            )}
            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '3px', textAlign: 'right' }}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      {!isInCall && (
        <div className="input-area">
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-card-border)', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '10px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {uploading ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
          </button>
          <input className="input-field" placeholder="Type a message..." value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ borderRadius: '24px', padding: '12px 18px' }} />
          <button onClick={sendMessage} disabled={!inputText.trim()}
            style={{ background: inputText.trim() ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255,255,255,0.08)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px 14px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: inputText.trim() ? '0 4px 16px var(--color-glow-strong)' : 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      )}

      {/* EXPIRY */}
      {room.expiresAt && (
        <div style={{ position: 'fixed', bottom: isInCall ? '16px' : '84px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-muted)', border: '1px solid var(--color-card-border)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', color: 'var(--color-text-muted)', zIndex: 10, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
          Expires {new Date(room.expiresAt).toLocaleString()}
        </div>
      )}

      {/* THEME PICKERS */}
      <ThemePicker />
      <ChatBgPicker />
    </div>
  );
}
