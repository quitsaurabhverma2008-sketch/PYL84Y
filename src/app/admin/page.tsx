'use client';

import { useState, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { applyTheme, getComboById } from '@/lib/themes';

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isPermanent: boolean;
  permanentCode?: string;
  permanentExpiry?: number;
  createdAt: number;
}

interface MessageData {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  imageUrl?: string;
  createdAt: number;
  expiresAt?: number;
}

interface RoomData {
  id: string;
  code: string;
  isPermanent: boolean;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  participants: string[];
  userDetails: UserData[];
  messageCount: number;
  messages: MessageData[];
  themeHistory: Array<{
    userId: string;
    name: string;
    themeId: string | null;
    chatBg: string | null;
    comboHistory: Array<{ themeId: string; changedAt: number }>;
  }>;
}

interface DashboardData {
  kvConnected: boolean;
  nextCleanup: number;
  cleanupIntervalMs: number;
  totalRooms: number;
  totalUsers: number;
  totalMessages: number;
  rooms: RoomData[];
}

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevVal = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const from = prevVal.current;
    const to = value;
    prevVal.current = to;
    if (from === to) return;

    const obj = { val: from };
    animate(obj, {
      val: to,
      duration: 600,
      ease: 'outExpo',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toString();
      },
    });
  }, [value]);

  return <span ref={ref} style={{ fontSize: '32px', fontWeight: '900', color, fontFamily: "var(--font-heading)" }}>{value}</span>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadingRoom, setDownloadingRoom] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/all-data');
      const json = await res.json();
      setData(json);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('pyl84y_admin_auth');
    if (saved === 'subh@2008') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('pyl84y_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.prefs?.themeId) {
          applyTheme(getComboById(user.prefs.themeId));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !contentRef.current) return;
    const els = contentRef.current.querySelectorAll('[data-admin-animate]');
    animate(els, {
      opacity: [0, 1],
      translateY: [16, 0],
      delay: (_el, i) => (i ?? 0) * 60,
      duration: 450,
      ease: 'outExpo',
    });
  }, [authenticated, data]);

  useEffect(() => {
    if (!data?.nextCleanup) return;
    const tick = () => {
      const diff = data.nextCleanup - Date.now();
      if (diff <= 0) {
        setCountdown('Cleaning up now...');
        fetchData();
        return;
      }
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const secs = Math.floor((diff % (60 * 1000)) / 1000);
      setCountdown(`${days}d ${hours}h ${mins}m ${secs}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [data?.nextCleanup]);

  const handlePasswordSubmit = () => {
    if (passwordInput === 'subh@2008') {
      sessionStorage.setItem('pyl84y_admin_auth', 'subh@2008');
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Wrong password!');
      setPasswordInput('');
    }
  };

  const downloadAllAsZip = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (const room of data.rooms) {
        const folderName = room.isPermanent
          ? `Permanent_${room.code}_${room.userDetails[0]?.name || 'unknown'}`
          : `Temp_${room.code}_${room.userDetails[0]?.name || 'unknown'}`;
        const folder = zip.folder(folderName)!;

        const roomInfo: string[] = [];
        roomInfo.push(`ROOM INFO`);
        roomInfo.push(`${'='.repeat(40)}`);
        roomInfo.push(`Room Code:     ${room.code}`);
        roomInfo.push(`Type:          ${room.isPermanent ? 'Permanent (7 days)' : 'Non-Permanent (24 hrs)'}`);
        roomInfo.push(`Room ID:       ${room.id}`);
        roomInfo.push(`Created At:    ${new Date(room.createdAt).toLocaleString()}`);
        if (room.expiresAt) roomInfo.push(`Expires At:    ${new Date(room.expiresAt).toLocaleString()}`);
        roomInfo.push(`Total Users:   ${room.userDetails.length}`);
        roomInfo.push(`Total Messages: ${room.messages.length}`);
        roomInfo.push('');
        roomInfo.push('USERS');
        roomInfo.push(`${'='.repeat(40)}`);
        for (const u of room.userDetails) {
          roomInfo.push(`  Name:        ${u.name}`);
          roomInfo.push(`  ID:          ${u.id}`);
          if (u.email) roomInfo.push(`  Email:       ${u.email}`);
          if (u.phone) roomInfo.push(`  Phone:       ${u.phone}`);
          if (u.permanentCode) roomInfo.push(`  Perm Code:   ${u.permanentCode}`);
          roomInfo.push(`  Joined At:   ${new Date(u.createdAt).toLocaleString()}`);
          roomInfo.push('');
        }
        folder.file('room-info.txt', roomInfo.join('\n'));

        if (room.messages.length > 0) {
          const chatLines: string[] = [];
          chatLines.push(`CHAT LOG - Room ${room.code}`);
          chatLines.push(`${'='.repeat(40)}`);
          chatLines.push('');
          for (const msg of room.messages) {
            const time = new Date(msg.createdAt).toLocaleString();
            chatLines.push(msg.type === 'image' ? `[${time}] ${msg.senderName}: [IMAGE] ${msg.imageUrl || 'no url'}` : `[${time}] ${msg.senderName}: ${msg.content}`);
          }
          folder.file('chat.txt', chatLines.join('\n'));
          const jsonFolder = zip.folder(`${folderName}/json`)!;
          jsonFolder.file('room.json', JSON.stringify(room, null, 2));
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PYL84Y_ALL_DATA_${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP error:', e);
    }
    setDownloading(false);
  };

  const downloadSingleRoom = async (room: RoomData) => {
    setDownloadingRoom(room.id);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folderName = room.isPermanent
        ? `Permanent_${room.code}_${room.userDetails[0]?.name || 'unknown'}`
        : `Temp_${room.code}_${room.userDetails[0]?.name || 'unknown'}`;
      const folder = zip.folder(folderName)!;

      const roomInfo: string[] = [];
      roomInfo.push(`ROOM INFO`);
      roomInfo.push(`${'='.repeat(40)}`);
      roomInfo.push(`Room Code:     ${room.code}`);
      roomInfo.push(`Type:          ${room.isPermanent ? 'Permanent (7 days)' : 'Non-Permanent (24 hrs)'}`);
      roomInfo.push(`Room ID:       ${room.id}`);
      roomInfo.push(`Created At:    ${new Date(room.createdAt).toLocaleString()}`);
      if (room.expiresAt) roomInfo.push(`Expires At:    ${new Date(room.expiresAt).toLocaleString()}`);
      roomInfo.push(`Total Users:   ${room.userDetails.length}`);
      roomInfo.push(`Total Messages: ${room.messages.length}`);
      roomInfo.push('');
      roomInfo.push('USERS');
      roomInfo.push(`${'='.repeat(40)}`);
      for (const u of room.userDetails) {
        roomInfo.push(`  Name:        ${u.name}`);
        roomInfo.push(`  ID:          ${u.id}`);
        if (u.email) roomInfo.push(`  Email:       ${u.email}`);
        if (u.phone) roomInfo.push(`  Phone:       ${u.phone}`);
        if (u.permanentCode) roomInfo.push(`  Perm Code:   ${u.permanentCode}`);
        roomInfo.push(`  Joined At:   ${new Date(u.createdAt).toLocaleString()}`);
        roomInfo.push('');
      }
      folder.file('room-info.txt', roomInfo.join('\n'));
      folder.file('room.json', JSON.stringify(room, null, 2));

      if (room.messages.length > 0) {
        const chatLines: string[] = [];
        chatLines.push(`CHAT LOG - Room ${room.code}`);
        chatLines.push(`${'='.repeat(40)}`);
        chatLines.push('');
        for (const msg of room.messages) {
          const time = new Date(msg.createdAt).toLocaleString();
          chatLines.push(msg.type === 'image' ? `[${time}] ${msg.senderName}: [IMAGE] ${msg.imageUrl || 'no url'}` : `[${time}] ${msg.senderName}: ${msg.content}`);
        }
        folder.file('chat.txt', chatLines.join('\n'));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PYL84Y_${folderName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP error:', e);
    }
    setDownloadingRoom(null);
  };

  const filteredRooms = data?.rooms.filter(room => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      room.code.toLowerCase().includes(q) ||
      room.userDetails.some(u => u.name.toLowerCase().includes(q)) ||
      room.userDetails.some(u => u.email?.toLowerCase().includes(q)) ||
      room.userDetails.some(u => u.phone?.includes(q)) ||
      room.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }) || [];

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--color-background)', color: 'var(--color-foreground)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', backdropFilter: 'blur(10px)' }} className="animate-glow">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#lock-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs><linearGradient id="lock-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--color-primary)"/><stop offset="100%" stopColor="var(--color-secondary)"/></linearGradient></defs>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '8px' }} className="text-gradient">PYL84Y</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '36px' }}>Admin Dashboard — Enter Password</p>

          {passwordError && (
            <div style={{ background: 'var(--color-danger-10)', border: '1px solid var(--color-danger-25)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', color: '#fca5a5', fontSize: '14px' }} className="animate-scale">
              {passwordError}
            </div>
          )}

          <input
            type="password"
            className="input-field"
            placeholder="Enter password..."
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
            autoFocus
            style={{ marginBottom: '16px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
          />
          <button className="btn-primary" onClick={handlePasswordSubmit} disabled={!passwordInput.trim()}>
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-background)', color: 'var(--color-foreground)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', background: 'var(--color-overlay)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(24px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }} className="text-gradient">PYL84Y</h1>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Admin Dashboard</span>
          </div>
          <button
            onClick={downloadAllAsZip}
            disabled={downloading || !data || data.totalRooms === 0}
            style={{
              background: downloading ? 'var(--color-muted)' : 'linear-gradient(135deg, var(--color-accent), #047857)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px',
              fontSize: '14px', fontWeight: '700', cursor: downloading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.25s',
              boxShadow: !downloading && data && data.totalRooms > 0 ? '0 4px 16px var(--color-glow-strong)' : 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {downloading ? 'Packing...' : 'Download All (ZIP)'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }} ref={contentRef}>
        {loading && !data ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Status Bar */}
            <div data-admin-animate style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: data?.kvConnected ? 'rgba(5,150,105,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${data?.kvConnected ? 'rgba(5,150,105,0.25)' : 'rgba(251,191,36,0.25)'}`, backdropFilter: 'blur(10px)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: data?.kvConnected ? 'var(--color-success)' : '#fbbf24', boxShadow: `0 0 8px ${data?.kvConnected ? 'rgba(34,197,94,0.5)' : 'rgba(251,191,36,0.5)'}` }} />
                {data?.kvConnected ? 'Upstash Connected' : 'In-Memory Mode'}
              </div>
              <div style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--color-danger-10)', border: '1px solid var(--color-danger-20)', backdropFilter: 'blur(10px)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Next cleanup: <strong style={{ color: '#fca5a5', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-heading)' }}>{countdown}</strong></span>
              </div>
              {countdown && data?.nextCleanup && (
                <div style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Download before auto-cleanup!
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '32px' }}>
              {[
                { label: 'Total Rooms', value: data?.totalRooms || 0, color: 'var(--color-primary)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                { label: 'Total Users', value: data?.totalUsers || 0, color: 'var(--color-secondary)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { label: 'Total Messages', value: data?.totalMessages || 0, color: '#a78bfa', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                { label: 'Permanent Rooms', value: data?.rooms.filter(r => r.isPermanent).length || 0, color: 'var(--color-success)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
              ].map((stat, i) => (
                <div data-admin-animate key={i} style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', padding: '22px', backdropFilter: 'blur(10px)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}22`; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ color: stat.color, opacity: 0.7 }}>{stat.icon}</div>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.label}</span>
                  </div>
                  <AnimatedNumber value={stat.value} color={stat.color} />
                </div>
              ))}
            </div>

            {/* Search */}
            <div data-admin-animate style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative', maxWidth: '500px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="input-field"
                  placeholder="Search by room code, name, email, phone, or message..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '14px', paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Room List */}
            {filteredRooms.length === 0 ? (
              <div data-admin-animate style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <p>No rooms found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredRooms.map(room => (
                  <div data-admin-animate key={room.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: 'border-color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary-30)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-card-border)'}>
                    {/* Room Header */}
                    <div
                      style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: '8px' }}
                      onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-heading)',
                          background: room.isPermanent ? 'rgba(5,150,105,0.12)' : 'rgba(251,191,36,0.12)',
                          color: room.isPermanent ? 'var(--color-success)' : '#fbbf24',
                          border: `1px solid ${room.isPermanent ? 'rgba(5,150,105,0.25)' : 'rgba(251,191,36,0.25)'}`,
                        }}>
                          {room.isPermanent ? 'PERMANENT' : 'TEMP'}
                        </span>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {room.userDetails[0]?.name || 'Unknown'}
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: '400', fontSize: '13px' }}>
                              Code: <span style={{ color: 'var(--color-primary)', fontWeight: '600', letterSpacing: '2px', fontFamily: 'var(--font-heading)' }}>{room.code}</span>
                            </span>
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {new Date(room.createdAt).toLocaleString()} · {room.userDetails.length} user{room.userDetails.length !== 1 ? 's' : ''} · {room.messageCount} msg{room.messageCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadSingleRoom(room); }}
                          disabled={downloadingRoom === room.id}
                          style={{
                            background: 'var(--color-primary-10)', border: '1px solid var(--color-primary-25)',
                            color: 'var(--color-primary)', padding: '6px 14px', borderRadius: '10px', fontSize: '12px',
                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          {downloadingRoom === room.id ? '...' : 'ZIP'}
                        </button>
                        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', transition: 'transform 0.2s', display: 'inline-block', transform: expandedRoom === room.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </span>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {expandedRoom === room.id && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--color-card-border)' }} className="animate-in">
                        <div style={{ marginTop: '16px' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Users</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {room.userDetails.map(u => (
                              <div key={u.id} style={{ background: 'var(--color-surface)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', border: '1px solid var(--color-card-border)' }}>
                                <div>
                                  <p style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</p>
                                  {u.email && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{u.email}</p>}
                                  {u.phone && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{u.phone}</p>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Joined: {new Date(u.createdAt).toLocaleTimeString()}</p>
                                  {u.permanentCode && <p style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '600' }}>Code: {u.permanentCode}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {room.themeHistory.length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Theme History</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {room.themeHistory.map(th => (
                                <div key={th.userId} style={{ background: 'var(--color-surface)', borderRadius: '12px', padding: '14px 18px', border: '1px solid var(--color-card-border)' }}>
                                  <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{th.name}</p>
                                  {th.themeId && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Current: <span style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>{th.themeId}</span></p>}
                                  {th.chatBg && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Chat BG: <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>Custom</span></p>}
                                  {th.comboHistory.length > 0 && (
                                    <div style={{ marginTop: '6px' }}>
                                      {th.comboHistory.slice(-5).reverse().map((h, i) => (
                                        <p key={i} style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                          {new Date(h.changedAt).toLocaleString()} — <span style={{ color: 'var(--color-foreground)', opacity: 0.5 }}>{h.themeId}</span>
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {room.messages.length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Chat History ({room.messages.length})</h4>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '14px', border: '1px solid var(--color-card-border)' }}>
                              {room.messages.map(msg => (
                                <div key={msg.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--color-card-border)' }}>
                                  <p style={{ fontSize: '12px' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>[{new Date(msg.createdAt).toLocaleTimeString()}]</span>
                                    {' '}
                                    <span style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>{msg.senderName}:</span>
                                    {' '}
                                    {msg.type === 'image' ? (
                                      <span style={{ color: '#fbbf24' }}>Image {msg.imageUrl && <a href={msg.imageUrl} target="_blank" rel="noopener" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>view</a>}</span>
                                    ) : (
                                      <span style={{ color: 'var(--color-foreground)', opacity: 0.7 }}>{msg.content}</span>
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '12px', borderTop: '1px solid var(--color-card-border)', opacity: 0.4 }}>
        PYL84Y Admin Dashboard · Data refreshes every 5 seconds
      </div>
    </div>
  );
}
