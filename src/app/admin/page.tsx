'use client';

import { useState, useEffect } from 'react';

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
}

interface DashboardData {
  kvConnected: boolean;
  totalRooms: number;
  totalUsers: number;
  totalMessages: number;
  rooms: RoomData[];
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
    if (!authenticated) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [authenticated]);

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
        if (room.expiresAt) {
          roomInfo.push(`Expires At:    ${new Date(room.expiresAt).toLocaleString()}`);
        }
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
            if (msg.type === 'image') {
              chatLines.push(`[${time}] ${msg.senderName}: [IMAGE] ${msg.imageUrl || 'no url'}`);
            } else {
              chatLines.push(`[${time}] ${msg.senderName}: ${msg.content}`);
            }
          }
          folder.file('chat.txt', chatLines.join('\n'));
        }

        if (room.messages.length > 0) {
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
      if (room.expiresAt) {
        roomInfo.push(`Expires At:    ${new Date(room.expiresAt).toLocaleString()}`);
      }
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
          if (msg.type === 'image') {
            chatLines.push(`[${time}] ${msg.senderName}: [IMAGE] ${msg.imageUrl || 'no url'}`);
          } else {
            chatLines.push(`[${time}] ${msg.senderName}: ${msg.content}`);
          }
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
      <div style={{ minHeight: '100dvh', background: '#0a0a0f', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>PYL84Y</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '32px' }}>Admin Dashboard — Enter Password</p>

          {passwordError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#fca5a5', fontSize: '14px' }}>
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
          <button
            className="btn-primary"
            onClick={handlePasswordSubmit}
            disabled={!passwordInput.trim()}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0f', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PYL84Y</h1>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Admin Dashboard</span>
          </div>
          <button
            onClick={downloadAllAsZip}
            disabled={downloading || !data || data.totalRooms === 0}
            style={{
              background: downloading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600', cursor: downloading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {downloading ? '⏳ Packing...' : '📦 Download All Data (ZIP)'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {loading && !data ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }} className="animate-pulse">⏳</div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* KV Status */}
            <div style={{ marginBottom: '20px', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: data?.kvConnected ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${data?.kvConnected ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: data?.kvConnected ? '#22c55e' : '#fbbf24' }} />
              {data?.kvConnected ? 'KV Connected — Data is persistent' : 'In-Memory Mode — Data resets on restart'}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Rooms', value: data?.totalRooms || 0, icon: '🏠', color: '#667eea' },
                { label: 'Total Users', value: data?.totalUsers || 0, icon: '👥', color: '#764ba2' },
                { label: 'Total Messages', value: data?.totalMessages || 0, icon: '💬', color: '#f093fb' },
                { label: 'Permanent Rooms', value: data?.rooms.filter(r => r.isPermanent).length || 0, icon: '🔒', color: '#22c55e' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</span>
                  </div>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px' }}>
              <input
                className="input-field"
                placeholder="🔍 Search by room code, name, email, phone, or message..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ maxWidth: '500px', borderRadius: '12px' }}
              />
            </div>

            {/* Room List */}
            {filteredRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                <p>No rooms found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredRooms.map(room => (
                  <div key={room.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                    {/* Room Header */}
                    <div
                      style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', flexWrap: 'wrap', gap: '8px' }}
                      onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                          background: room.isPermanent ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
                          color: room.isPermanent ? '#22c55e' : '#fbbf24',
                        }}>
                          {room.isPermanent ? '🔒 PERMANENT' : '⚡ TEMP'}
                        </span>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '15px' }}>
                            {room.userDetails[0]?.name || 'Unknown'}
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', marginLeft: '10px', fontSize: '13px' }}>
                              Code: <span style={{ color: '#667eea', fontWeight: '600', letterSpacing: '2px' }}>{room.code}</span>
                            </span>
                          </p>
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                            Created: {new Date(room.createdAt).toLocaleString()} • {room.userDetails.length} user{room.userDetails.length !== 1 ? 's' : ''} • {room.messageCount} message{room.messageCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadSingleRoom(room); }}
                          disabled={downloadingRoom === room.id}
                          style={{
                            background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.3)',
                            color: '#667eea', padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                            fontWeight: '600', cursor: 'pointer',
                          }}
                        >
                          {downloadingRoom === room.id ? '⏳' : '📥 Folder'}
                        </button>
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>
                          {expandedRoom === room.id ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {expandedRoom === room.id && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="animate-in">
                        {/* Users */}
                        <div style={{ marginTop: '16px' }}>
                          <h4 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: '600' }}>USERS IN THIS ROOM</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {room.userDetails.map(u => (
                              <div key={u.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                  <p style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</p>
                                  {u.email && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>📧 {u.email}</p>}
                                  {u.phone && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>📱 {u.phone}</p>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Joined: {new Date(u.createdAt).toLocaleTimeString()}</p>
                                  {u.permanentCode && <p style={{ fontSize: '11px', color: '#667eea' }}>Code: {u.permanentCode}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Messages */}
                        {room.messages.length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <h4 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: '600' }}>CHAT HISTORY ({room.messages.length})</h4>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px' }}>
                              {room.messages.map(msg => (
                                <div key={msg.id} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <p style={{ fontSize: '12px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>[{new Date(msg.createdAt).toLocaleTimeString()}]</span>
                                    {' '}
                                    <span style={{ color: '#a78bfa', fontWeight: '600' }}>{msg.senderName}:</span>
                                    {' '}
                                    {msg.type === 'image' ? (
                                      <span style={{ color: '#fbbf24' }}>📷 Image {msg.imageUrl && <a href={msg.imageUrl} target="_blank" rel="noopener" style={{ color: '#667eea', textDecoration: 'underline' }}>view</a>}</span>
                                    ) : (
                                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>{msg.content}</span>
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
      <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        PYL84Y Admin Dashboard • Data refreshes every 5 seconds
      </div>
    </div>
  );
}
