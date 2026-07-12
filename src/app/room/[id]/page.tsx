'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';

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
          content: '📷 Image',
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
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>
        <div className="animate-pulse" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="chat-container" style={{ background: '#0f0f0f' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'rgba(15,15,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={leaveRoom} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '20px' }}>←</button>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>PYL84Y</h2>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {room.isPermanent ? '🔒 Permanent' : '⚡ Temporary'} • {room.code}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => startCall('voice')} style={{ background: 'rgba(34,197,94,0.2)', border: 'none', color: '#22c55e', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}>📞</button>
          <button onClick={() => startCall('video')} style={{ background: 'rgba(59,130,246,0.2)', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}>📹</button>
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}>☰</button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div style={{ position: 'absolute', top: '56px', right: '16px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px', zIndex: 30, minWidth: '200px' }} className="animate-in">
          <button onClick={() => { setShowCode(true); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', fontSize: '14px' }} onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => (e.target as HTMLElement).style.background = 'none'}>
            📋 Show Room Code
          </button>
          <button onClick={() => { downloadChat(); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', fontSize: '14px' }} onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => (e.target as HTMLElement).style.background = 'none'}>
            💾 Download Chat
          </button>
          <button onClick={() => { setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', fontSize: '14px' }} onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(239,68,68,0.1)'} onMouseOut={e => (e.target as HTMLElement).style.background = 'none'}>
            🚪 Leave Room
          </button>
        </div>
      )}

      {/* Room Code Modal */}
      {showCode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowCode(false)}>
          <div className="card" style={{ width: '100%', maxWidth: '340px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Room Code</h3>
            <p style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '6px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>{room.code}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
              {room.isPermanent ? 'Permanent • Valid 7 days' : 'Temporary • Valid 24 hours'}
            </p>
            <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(room.code); }}>
              Copy Code
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '40px' }}>💬</p>
            <p style={{ fontSize: '14px' }}>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.senderId === user.id ? 'message-own' : msg.type === 'system' ? 'message-system' : 'message-other'}`}>
            {msg.senderId !== user.id && msg.type !== 'system' && (
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#a78bfa', marginBottom: '2px' }}>{msg.senderName}</p>
            )}
            {msg.type === 'image' && msg.imageUrl ? (
              <div>
                <img src={msg.imageUrl} alt="Shared" style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} onClick={() => saveImage(msg.imageUrl!)} />
                <button onClick={() => saveImage(msg.imageUrl!)} style={{ marginTop: '4px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>💾 Save Image</button>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Saved to server • Admin keeps 3 days</p>
              </div>
            ) : (
              <p>{msg.content}</p>
            )}
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', textAlign: 'right' }}>
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
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '10px', fontSize: '18px', flexShrink: 0 }}
        >
          {uploading ? '⏳' : '📷'}
        </button>
        <input
          className="input-field"
          placeholder="Type a message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ borderRadius: '24px', padding: '12px 16px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim()}
          style={{ background: inputText.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', fontSize: '18px', flexShrink: 0 }}
        >
          ➤
        </button>
      </div>

      {/* Call Overlay */}
      {showCall && (
        <div className="call-overlay">
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>{callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{callActive ? 'Connected' : 'Connecting...'}</p>
            
            {callType === 'video' && (
              <>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '350px', borderRadius: '16px', background: '#1a1a2e' }} />
                <video ref={localVideoRef} autoPlay playsInline muted style={{ position: 'absolute', bottom: '100px', right: '16px', width: '100px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)' }} />
              </>
            )}

            {callType === 'voice' && (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }} className="animate-pulse">
                📞
              </div>
            )}

            <button onClick={endCall} className="btn-danger" style={{ borderRadius: '50%', width: '64px', height: '64px', padding: 0, fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📵
            </button>
          </div>
        </div>
      )}

      {/* Expiry Timer */}
      {room.expiresAt && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>
          Expires {new Date(room.expiresAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
