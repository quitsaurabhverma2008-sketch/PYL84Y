'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'home' | 'nonperm-create' | 'nonperm-join' | 'perm-create' | 'perm-create-form' | 'perm-join' | 'perm-warning'>('home');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleNonPermCreate = async () => {
    if (!name.trim()) return setError('Enter your name');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: name.trim(), isPermanent: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('pyl84y_user', JSON.stringify(data.user));
      localStorage.setItem('pyl84y_room', JSON.stringify(data.room));
      router.push(`/room/${data.room.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleNonPermJoin = async () => {
    if (!name.trim()) return setError('Enter your name');
    if (!code.trim() || code.trim().length !== 4) return setError('Enter a valid 4-digit code');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), userName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('pyl84y_user', JSON.stringify(data.user));
      localStorage.setItem('pyl84y_room', JSON.stringify(data.room));
      router.push(`/room/${data.room.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handlePermCreate = async () => {
    if (!name.trim()) return setError('Enter your name');
    if (!email.trim()) return setError('Enter your email');
    if (!phone.trim()) return setError('Enter your phone number');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms/permanent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('pyl84y_user', JSON.stringify(data.user));
      localStorage.setItem('pyl84y_room', JSON.stringify(data.room));
      setRoomCode(data.permanentCode);
      setMode('perm-create');
    } catch (e: any) {
      setError(e.message || 'Failed to create permanent room');
    } finally {
      setLoading(false);
    }
  };

  const handlePermJoin = async () => {
    if (!name.trim()) return setError('Enter your name');
    if (!code.trim()) return setError('Enter a permanent room code');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms/join-permanent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), userName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('pyl84y_user', JSON.stringify(data.user));
      localStorage.setItem('pyl84y_room', JSON.stringify(data.room));
      router.push(`/room/${data.room.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to join permanent room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1025 100%)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}>PYL84Y</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '8px' }}>Chat • Voice • Video</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#fca5a5', fontSize: '14px' }} className="animate-in">
            {error}
          </div>
        )}

        {/* HOME */}
        {mode === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
            <button onClick={() => setMode('nonperm-create')} className="btn-primary" style={{ fontSize: '18px', padding: '18px' }}>
              ⚡ Non-Permanent Room
            </button>
            <button onClick={() => setMode('perm-warning')} className="btn-secondary" style={{ fontSize: '18px', padding: '18px' }}>
              🔒 Permanent Room
            </button>
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
              <p><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Non-Permanent:</strong> Quick rooms, 4-digit code, chats saved 24hrs</p>
              <p style={{ marginTop: '8px' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Permanent:</strong> 7-day ID, searchable code, full profile</p>
            </div>
          </div>
        )}

        {/* NON-PERMANENT CREATE */}
        {mode === 'nonperm-create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
            <button onClick={() => { setMode('home'); setError(''); setName(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0 }}>← Back</button>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Quick Room</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Create a temporary room. Share the 4-digit code with friends.</p>
            <input className="input-field" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNonPermCreate()} />
            <button className="btn-primary" onClick={handleNonPermCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        )}

        {/* NON-PERMANENT JOIN */}
        {mode === 'nonperm-join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
            <button onClick={() => { setMode('home'); setError(''); setName(''); setCode(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0 }}>← Back</button>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Join Room</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Enter the 4-digit code shared with you</p>
            <input className="input-field" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input-field" placeholder="4-Digit Code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))} onKeyDown={e => e.key === 'Enter' && handleNonPermJoin()} style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700' }} />
            <button className="btn-primary" onClick={handleNonPermJoin} disabled={loading}>
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        )}

        {/* PERMANENT WARNING */}
        {mode === 'perm-warning' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
            <button onClick={() => { setMode('home'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0 }}>← Back</button>
            <div className="card" style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.05)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fbbf24', marginBottom: '12px' }}>⚠️ Permanent Room Info</h2>
              <ul style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '2', listStyle: 'none', padding: 0 }}>
                <li>• Your ID is valid for <strong style={{ color: '#fbbf24' }}>7 days only</strong></li>
                <li>• After 7 days, your ID <strong style={{ color: '#ef4444' }}>auto-deletes</strong></li>
                <li>• You need to provide Gmail, Phone & Name</li>
                <li>• Others can search your code to chat</li>
                <li>• Chats saved for 24 hours</li>
              </ul>
            </div>
            <button className="btn-primary" onClick={() => setMode('perm-create-form')}>
              I Understand, Continue
            </button>
          </div>
        )}

        {/* PERMANENT CREATE FORM */}
        {mode === 'perm-create-form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
            <button onClick={() => { setMode('perm-warning'); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0 }}>← Back</button>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Create Permanent ID</h2>
            <input className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input-field" placeholder="Gmail Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input-field" placeholder="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            <button className="btn-primary" onClick={handlePermCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Permanent ID'}
            </button>
          </div>
        )}

        {/* PERMANENT CREATED - SHOW CODE */}
        {mode === 'perm-create' && roomCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in">
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '8px' }}>Your Permanent Code</p>
              <p style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '6px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{roomCode}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '8px' }}>Valid for 7 days. Share this code with others.</p>
            </div>
            <button className="btn-primary" onClick={() => {
              const room = JSON.parse(localStorage.getItem('pyl84y_room') || '{}');
              if (room.id) router.push(`/room/${room.id}`);
            }}>
              Enter Chat Room
            </button>
            <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(roomCode); }}>
              Copy Code
            </button>
          </div>
        )}

        {/* JOIN SECTION (from home) - Not shown on home, shown via nonperm-join and perm-join */}
      </div>

      {/* Bottom buttons for join - shown on home */}
      {mode === 'home' && (
        <div style={{ width: '100%', maxWidth: '400px', marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '8px' }}>Have a code?</div>
          <button onClick={() => setMode('nonperm-join')} className="btn-secondary" style={{ fontSize: '15px' }}>
            Join with 4-Digit Code
          </button>
          <button onClick={() => setMode('perm-join')} className="btn-secondary" style={{ fontSize: '15px' }}>
            Join with Permanent Code
          </button>
        </div>
      )}

      {/* PERMANENT JOIN */}
      {mode === 'perm-join' && (
        <div style={{ position: 'fixed', inset: 0, background: '#0f0f0f', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="animate-in">
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={() => { setMode('home'); setError(''); setName(''); setCode(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0 }}>← Back</button>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Join Permanent Room</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Search and join a permanent room by code</p>
            <input className="input-field" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input-field" placeholder="Permanent Room Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase', letterSpacing: '4px', fontWeight: '700' }} />
            <button className="btn-primary" onClick={handlePermJoin} disabled={loading}>
              {loading ? 'Searching...' : 'Join Room'}
            </button>
          </div>
        </div>
      )}
      {/* Admin Link */}
      <div style={{ position: 'fixed', bottom: '12px', right: '12px' }}>
        <a href="/admin" style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', textDecoration: 'none' }}>⚙️</a>
      </div>
    </div>
  );
}
