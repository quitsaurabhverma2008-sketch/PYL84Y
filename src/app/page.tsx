'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { animate } from 'animejs';
import { applyTheme, getComboById } from '@/lib/themes';
import ThemePicker from '@/components/ThemePicker';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'home' | 'nonperm-create' | 'nonperm-join' | 'perm-create-form' | 'perm-join' | 'perm-warning' | 'perm-login'>('home');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { setShowThemePicker } = useTheme();

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
    if (containerRef.current) {
      const els = containerRef.current.querySelectorAll('[data-animate]');
      animate(els, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: (_el, i) => (i ?? 0) * 80,
        duration: 500,
        ease: 'outExpo',
      });
    }
  }, [mode]);

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
    if (!email.trim()) return setError('Enter your Gmail address');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid Gmail address');
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
      router.push('/social');
    } catch (e: any) {
      setError(e.message || 'Failed to create permanent room');
    } finally {
      setLoading(false);
    }
  };

  const handlePermLogin = async () => {
    if (!email.trim()) return setError('Enter your Gmail address');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid Gmail address');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmail: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('pyl84y_user', JSON.stringify(data.user));
      localStorage.setItem('pyl84y_room', JSON.stringify(data.room));
      router.push('/social');
    } catch (e: any) {
      setError(e.message || 'Login failed');
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
      router.push('/social');
    } catch (e: any) {
      setError(e.message || 'Failed to join permanent room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Colorful gradient blobs */}
      <div className="gradient-blob gradient-blob-1" />
      <div className="gradient-blob gradient-blob-2" />
      <div className="gradient-blob gradient-blob-3" />

      <div ref={containerRef} style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }} data-animate>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '88px', height: '88px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))', backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite', marginBottom: '24px', boxShadow: '0 8px 40px var(--color-glow-strong), 0 0 80px var(--color-glow)' }} className="animate-glow">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 'clamp(44px, 9vw, 64px)', fontWeight: '900', letterSpacing: '-3px', lineHeight: 1, background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent), var(--color-primary))', backgroundSize: '300% 300%', animation: 'gradientShift 6s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>PYL84Y</h1>
          <div className="accent-line" style={{ margin: '14px auto 0' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '14px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase' }}>Chat · Voice · Video</p>
        </div>

        {error && (
          <div style={{ background: 'var(--color-danger-10)', border: '1px solid var(--color-danger-25)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', color: '#fca5a5', fontSize: '14px', backdropFilter: 'blur(10px)' }} className="animate-scale">
            {error}
          </div>
        )}

        {/* HOME */}
        {mode === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button data-animate onClick={() => setMode('nonperm-create')} className="btn-primary" style={{ fontSize: '17px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Non-Permanent Room
            </button>
            <button data-animate onClick={() => setMode('perm-warning')} className="btn-secondary" style={{ fontSize: '17px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Permanent Room
            </button>
            <div data-animate style={{ marginTop: '20px', padding: '18px', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.7', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))' }} />
              <p style={{ marginTop: '8px' }}><strong style={{ color: 'var(--color-primary)' }}>⚡ Non-Permanent:</strong> Quick rooms, 4-digit code, chats saved 24hrs</p>
              <p style={{ marginTop: '6px' }}><strong style={{ color: 'var(--color-accent)' }}>🔒 Permanent:</strong> 7-day ID, searchable code, full profile</p>
            </div>
          </div>
        )}

        {/* NON-PERMANENT CREATE */}
        {mode === 'nonperm-create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button data-animate onClick={() => { setMode('home'); setError(''); setName(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <h2 data-animate style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Quick Room</h2>
            <p data-animate style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Create a temporary room. Share the 4-digit code with friends.</p>
            <input data-animate className="input-field" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNonPermCreate()} />
            <button data-animate className="btn-primary" onClick={handleNonPermCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        )}

        {/* NON-PERMANENT JOIN */}
        {mode === 'nonperm-join' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button data-animate onClick={() => { setMode('home'); setError(''); setName(''); setCode(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <h2 data-animate style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Join Room</h2>
            <p data-animate style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Enter the 4-digit code shared with you</p>
            <input data-animate className="input-field" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
            <input data-animate className="input-field" placeholder="4-Digit Code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))} onKeyDown={e => e.key === 'Enter' && handleNonPermJoin()} style={{ textAlign: 'center', fontSize: '28px', letterSpacing: '10px', fontWeight: '800', fontFamily: "var(--font-heading)" }} />
            <button data-animate className="btn-primary" onClick={handleNonPermJoin} disabled={loading}>
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        )}

        {/* PERMANENT WARNING */}
        {mode === 'perm-warning' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button data-animate onClick={() => { setMode('home'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <div data-animate className="card" style={{ borderColor: 'rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.04)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Permanent Room Info
              </h2>
              <ul style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '2', listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#fbbf24' }}>•</span> Your ID is valid for <strong style={{ color: '#fbbf24' }}>7 days only</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--color-danger)' }}>•</span> After 7 days, your ID <strong style={{ color: 'var(--color-danger)' }}>auto-deletes</strong></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--color-text-muted)' }}>•</span> One Gmail = One account only</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--color-text-muted)' }}>•</span> After 7 days, reuse the same Gmail</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--color-text-muted)' }}>•</span> Chats saved for 24 hours</li>
              </ul>
            </div>
            <button data-animate className="btn-primary" onClick={() => setMode('perm-create-form')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Create New Account
            </button>
            <button data-animate className="btn-secondary" onClick={() => { setMode('perm-login'); setEmail(''); setError(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Login to Account
            </button>
          </div>
        )}

        {/* PERMANENT CREATE FORM */}
        {mode === 'perm-create-form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button data-animate onClick={() => { setMode('perm-warning'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <h2 data-animate style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Create Permanent ID</h2>
            <input data-animate className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input data-animate className="input-field" placeholder="Gmail Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input data-animate className="input-field" placeholder="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            <button data-animate className="btn-primary" onClick={handlePermCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Permanent ID'}
            </button>
          </div>
        )}

        {/* PERMANENT LOGIN */}
        {mode === 'perm-login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button data-animate onClick={() => { setMode('perm-warning'); setError(''); setEmail(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <h2 data-animate style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Login Account</h2>
            <p data-animate style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Enter the Gmail used during signup</p>
            <input data-animate className="input-field" placeholder="Your Gmail Address" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePermLogin()} />
            <button data-animate className="btn-primary" onClick={handlePermLogin} disabled={loading}>
              {loading ? 'Checking...' : 'Login'}
            </button>
          </div>
        )}

        {/* Bottom buttons for join - shown on home */}
        {mode === 'home' && (
          <div style={{ width: '100%', marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div data-animate style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Have a code?</div>
            <button data-animate onClick={() => setMode('nonperm-join')} className="btn-secondary" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
              Join with 4-Digit Code
            </button>
            <button data-animate onClick={() => setShowThemePicker(true)} className="btn-secondary" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--color-primary-10), transparent, var(--color-accent-10))', border: '1px solid var(--color-primary-25)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="8" cy="18" r="2.5"/><circle cx="16" cy="18" r="2.5"/></svg>
              Color Theme
            </button>
          </div>
        )}

        {/* PERMANENT JOIN */}
        {mode === 'perm-join' && (
          <div style={{ position: 'fixed', inset: 0, background: 'var(--color-background)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="animate-in">
            <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button data-animate onClick={() => { setMode('home'); setError(''); setName(''); setCode(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <h2 data-animate style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Join Permanent Room</h2>
              <p data-animate style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Search and join a permanent room by code</p>
              <input data-animate className="input-field" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
              <input data-animate className="input-field" placeholder="Permanent Room Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase', letterSpacing: '4px', fontWeight: '700', fontFamily: "var(--font-heading)" }} />
              <button data-animate className="btn-primary" onClick={handlePermJoin} disabled={loading}>
                {loading ? 'Searching...' : 'Join Room'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Link */}
      <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 10 }}>
        <a href="/admin" style={{ color: 'var(--color-text-muted)', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s', opacity: 0.3 }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseOut={e => (e.currentTarget.style.opacity = '0.3')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Admin
        </a>
      </div>

      <ThemePicker />
    </div>
  );
}
