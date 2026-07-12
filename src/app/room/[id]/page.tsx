'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { animate } from 'animejs';

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

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'voice'>('voice');
  const [callActive, setCallActive] = useState(false);
  const [callRemoteStream, setCallRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  useEffect(() => {
    const storedRoom = localStorage.getItem('pyl84y_room');
    const storedUser = localStorage.getItem('pyl84y_user');
    if (!storedRoom || !storedUser) {
      router.push('/');
      return;
    }
    const parsedRoom = JSON.parse(storedRoom);
    const parsedUser = JSON.parse(storedUser);
    if (parsedRoom.id !== id) {
      router.push('/');
      return;
    }
    setRoom(parsedRoom);
    setUser(parsedUser);
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

  const sendMessage = async () => {
    if (!inputText.trim() || !room || !user) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          senderId: user.id,
          senderName: user.name,
          content: inputText.trim(),
          type: 'text',
        }),
      });
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
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          senderId: user.id,
          senderName: user.name,
          content: 'Image',
          type: 'image',
          imageUrl: url,
        }),
      });
    } catch (e) {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadChat = () => {
    const chatText = messages.map(m => {
      const time = new Date(m.createdAt).toLocaleString();
      if (m.type === 'image') return `[${time}] ${m.senderName}: [Image] ${m.imageUrl}`;
      return `[${time}] ${m.senderName}: ${m.content}`;
    }).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PYL84Y-chat-${room?.code}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveImage = (imageUrl: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `PYL84Y-${Date.now()}.jpg`;
    a.click();
  };

  const startCall = async (type: 'video' | 'voice') => {
    setCallType(type);
    setShowCall(true);
    try {
      const constraints: MediaStreamConstraints = {
        video: type === 'video',
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.ontrack = (event) => {
        setCallRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      pc.onicecandidate = () => {};
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setCallActive(true);
    } catch (e) {
      console.error('Failed to start call:', e);
      setShowCall(false);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setLocalStream(null);
    setCallRemoteStream(null);
    setShowCall(false);
    setCallActive(false);
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
        <div className="animate-pulse" style={{ color: 'rgba(248,250,252,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: '14px' }}>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container" style={{ background: 'var(--color-background)' }}>
      <ChatBackground />

      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'rgba(15,23,42,0.92)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={leaveRoom} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(248,250,252,0.5)', cursor: 'pointer', fontSize: '18px', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(248,250,252,0.5)'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'Nunito', sans-serif" }}>PYL84Y</h2>
            <p style={{ fontSize: '11px', color: 'rgba(248,250,252,0.35)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              {room.isPermanent ? 'Permanent' : 'Temporary'} · {room.code}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => startCall('voice')} style={{ background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', color: '#059669', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(5,150,105,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(5,150,105,0.15)'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Voice
          </button>
          <button onClick={() => startCall('video')} style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#2563EB', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(37,99,235,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(37,99,235,0.15)'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            Video
          </button>
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(248,250,252,0.6)', cursor: 'pointer', padding: '8px 10px', borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div style={{ position: 'absolute', top: '60px', right: '16px', background: 'var(--color-muted)', border: '1px solid var(--color-card-border)', borderRadius: '14px', padding: '6px', zIndex: 30, minWidth: '200px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} className="animate-scale">
          <button onClick={() => { setShowCode(true); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--color-foreground)', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseOut={e => (e.currentTarget.style.background = 'none')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Show Room Code
          </button>
          <button onClick={() => { downloadChat(); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--color-foreground)', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseOut={e => (e.currentTarget.style.background = 'none')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Chat
          </button>
          <div style={{ height: '1px', background: 'var(--color-card-border)', margin: '4px 8px' }} />
          <button onClick={() => { setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'none')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Leave Room
          </button>
        </div>
      )}

      {/* Room Code Modal */}
      {showCode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(8px)' }} onClick={() => setShowCode(false)}>
          <div className="card animate-glow" style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', fontFamily: "'Nunito', sans-serif" }}>Room Code</h3>
            <p style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '8px', fontFamily: "'Nunito', sans-serif", marginBottom: '8px' }} className="text-gradient">{room.code}</p>
            <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.35)', marginBottom: '20px' }}>
              {room.isPermanent ? 'Permanent · Valid 7 days' : 'Temporary · Valid 24 hours'}
            </p>
            <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(room.code); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Code
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-area" ref={messagesRef}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '14px', color: 'rgba(248,250,252,0.25)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p style={{ fontSize: '14px' }}>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.senderId === user.id ? 'message-own' : msg.type === 'system' ? 'message-system' : 'message-other'}`}>
            {msg.senderId !== user.id && msg.type !== 'system' && (
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', marginBottom: '3px', fontFamily: "'Nunito', sans-serif" }}>{msg.senderName}</p>
            )}
            {msg.type === 'image' && msg.imageUrl ? (
              <div>
                <img src={msg.imageUrl} alt="Shared" style={{ maxWidth: '100%', borderRadius: '12px', cursor: 'pointer' }} onClick={() => saveImage(msg.imageUrl!)} />
                <button onClick={() => saveImage(msg.imageUrl!)} style={{ marginTop: '6px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Save
                </button>
                <p style={{ fontSize: '10px', color: 'rgba(248,250,252,0.25)', marginTop: '3px' }}>Stored on server · Admin keeps 3 days</p>
              </div>
            ) : (
              <p>{msg.content}</p>
            )}
            <p style={{ fontSize: '10px', color: 'rgba(248,250,252,0.25)', marginTop: '3px', textAlign: 'right' }}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-card-border)', color: 'rgba(248,250,252,0.6)', cursor: 'pointer', padding: '10px', borderRadius: '12px', fontSize: '16px', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--color-card-border)'; }}
        >
          {uploading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          )}
        </button>
        <input
          className="input-field"
          placeholder="Type a message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ borderRadius: '24px', padding: '12px 18px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim()}
          style={{ background: inputText.trim() ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(255,255,255,0.08)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px 14px', borderRadius: '12px', fontSize: '16px', flexShrink: 0, transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: inputText.trim() ? '0 4px 16px rgba(37,99,235,0.3)' : 'none' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>

      {/* Call Overlay */}
      {showCall && (
        <div className="call-overlay">
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <p style={{ fontSize: '20px', fontWeight: '800', fontFamily: "'Nunito', sans-serif" }} className="text-gradient">{callType === 'video' ? 'Video Call' : 'Voice Call'}</p>
            <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: callActive ? '#22c55e' : '#fbbf24', animation: 'pulse 1.5s ease infinite' }} />
              {callActive ? 'Connected' : 'Connecting...'}
            </p>

            {callType === 'video' && (
              <>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '350px', borderRadius: '18px', background: 'var(--color-muted)', border: '1px solid var(--color-card-border)' }} />
                <video ref={localVideoRef} autoPlay playsInline muted style={{ position: 'absolute', bottom: '100px', right: '16px', width: '100px', borderRadius: '14px', border: '2px solid var(--color-primary)', boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }} />
              </>
            )}

            {callType === 'voice' && (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(37,99,235,0.3)' }} className="animate-pulse">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
            )}

            <button onClick={endCall} className="btn-danger" style={{ borderRadius: '50%', width: '64px', height: '64px', padding: 0, fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(220,38,38,0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Expiry Timer */}
      {room.expiresAt && (
        <div style={{ position: 'fixed', bottom: '84px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-muted)', border: '1px solid var(--color-card-border)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', color: 'rgba(248,250,252,0.35)', zIndex: 10, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
          Expires {new Date(room.expiresAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
