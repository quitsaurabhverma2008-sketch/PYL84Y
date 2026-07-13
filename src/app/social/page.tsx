'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { applyTheme, getComboById } from '@/lib/themes';

interface UserProfile {
  id: string;
  name: string;
  bio: string;
  permanentCode: string;
  isFollowing?: boolean;
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

interface SocialData {
  bio: string;
  followers: UserProfile[];
  following: UserProfile[];
  blocked: string[];
  rooms: Room[];
}

export default function SocialPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'following' | 'chat' | 'profile'>('search');
  const [socialData, setSocialData] = useState<SocialData>({ bio: '', followers: [], following: [], blocked: [], rooms: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pyl84y_user');
    if (!storedUser) { router.push('/'); return; }
    const parsed = JSON.parse(storedUser);
    setUser(parsed);
    if (parsed.prefs?.themeId) applyTheme(getComboById(parsed.prefs.themeId));
  }, [router]);

  const fetchSocialData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/social?userId=${user.id}`);
      const data = await res.json();
      setSocialData(data);
      setBioText(data.bio || '');
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) fetchSocialData(); }, [user, fetchSocialData]);

  const doSearch = useCallback(async () => {
    if (!user) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&userId=${user.id}`);
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch {}
    setSearching(false);
  }, [user, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(doSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  const socialAction = async (action: string, targetId?: string, bioVal?: string) => {
    if (!user) return;
    try {
      await fetch('/api/users/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: user.id, targetId, bio: bioVal }),
      });
      await fetchSocialData();
      if (searchQuery) doSearch();
    } catch {}
  };

  const enterRoom = (room: Room) => {
    const storedUser = localStorage.getItem('pyl84y_user');
    if (storedUser) {
      localStorage.setItem('pyl84y_room', JSON.stringify(room));
      router.push(`/room/${room.id}`);
    }
  };

  if (!user || loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'search' as const, label: 'Search', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { id: 'following' as const, label: 'Following', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'chat' as const, label: 'Chat', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: 'profile' as const, label: 'Profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)', overflow: 'hidden' }}>
      {/* Gradient blobs */}
      <div className="gradient-blob gradient-blob-1" style={{ opacity: 0.12, filter: 'blur(120px)' }} />
      <div className="gradient-blob gradient-blob-2" style={{ opacity: 0.1, filter: 'blur(120px)' }} />

      {/* Header */}
      <div style={{ padding: '16px 20px 12px', position: 'relative', zIndex: 10, borderBottom: '1px solid var(--color-card-border)', background: 'var(--color-overlay)', backdropFilter: 'blur(24px)', borderTop: '3px solid transparent', borderImage: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent)) 1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-heading)' }} className="text-gradient">PYL84Y</h1>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>Welcome, {user.name}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px 12px', borderRadius: '20px', background: 'var(--color-primary-15)', border: '1px solid var(--color-primary-25)', fontSize: '11px', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '1px', fontFamily: 'var(--font-heading)' }}>
              {user.permanentCode}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div style={{ padding: '16px 20px' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                className="input-field"
                placeholder="Search by name, code, or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingRight: '44px', borderRadius: '16px' }}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>

            {searching && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '20px' }}>Searching...</p>}

            {!searching && searchQuery && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.3 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p style={{ fontSize: '14px' }}>No users found</p>
              </div>
            )}

            {!searching && !searchQuery && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '20px' }}>Type to search users by name or code</p>
            )}

            {searchResults.map(u => (
              <div key={u.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', padding: '16px', marginBottom: '10px', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
                onClick={() => setViewingProfile(u)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '700' }}>{u.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>{u.permanentCode}</p>
                      </div>
                    </div>
                    {u.bio && <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', lineHeight: '1.4' }}>{u.bio}</p>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); socialAction(u.isFollowing ? 'unfollow' : 'follow', u.id); }}
                    style={{
                      background: u.isFollowing ? 'var(--color-danger-15)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      border: u.isFollowing ? '1px solid var(--color-danger-25)' : 'none',
                      color: u.isFollowing ? 'var(--color-danger)' : 'white',
                      padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                    }}>
                    {u.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOLLOWING TAB */}
        {activeTab === 'following' && (
          <div style={{ padding: '16px 20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>Following ({socialData.following.length})</h2>
            {socialData.following.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.3 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <p style={{ fontSize: '14px', marginBottom: '6px' }}>Not following anyone yet</p>
                <p style={{ fontSize: '12px' }}>Search and follow people to see them here</p>
              </div>
            )}
            {socialData.following.map(u => (
              <div key={u.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
                onClick={() => setViewingProfile(u)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: '700' }}>{u.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>{u.permanentCode}</p>
                    {u.bio && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '3px', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</p>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}

            {socialData.followers.length > 0 && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', marginTop: '24px', marginBottom: '16px' }}>Followers ({socialData.followers.length})</h2>
                {socialData.followers.map(u => (
                  <div key={u.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: '700' }}>{u.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)' }}>{u.permanentCode}</p>
                        </div>
                      </div>
                      {!socialData.following.some((f: any) => f.id === u.id) && (
                        <button onClick={() => socialAction('follow', u.id)}
                          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                          Follow Back
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ padding: '16px 20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>Your Rooms ({socialData.rooms.length})</h2>
            {socialData.rooms.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.3 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p style={{ fontSize: '14px', marginBottom: '6px' }}>No rooms yet</p>
                <p style={{ fontSize: '12px' }}>Create a permanent room to get started</p>
              </div>
            )}
            {socialData.rooms.map(room => (
              <div key={room.id} onClick={() => enterRoom(room)}
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', padding: '16px', marginBottom: '10px', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }} />
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Active Room</p>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '3px' }} className="text-gradient">{room.code}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''} · Expires {new Date(room.expiresAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ padding: '16px 20px' }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))', backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 40px var(--color-glow-strong)', fontSize: '32px', fontWeight: '900', color: 'white' }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{user.name}</h2>
              <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'var(--color-primary-15)', border: '1px solid var(--color-primary-25)', fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '3px', fontFamily: 'var(--font-heading)', marginTop: '8px' }}>
                {user.permanentCode}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Following', value: socialData.following.length },
                { label: 'Followers', value: socialData.followers.length },
                { label: 'Rooms', value: socialData.rooms.length },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '14px', padding: '14px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                  <p style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'var(--font-heading)' }} className="text-gradient">{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Bio */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', padding: '16px', marginBottom: '12px', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Bio</h3>
                <button onClick={() => {
                  if (editingBio) {
                    socialAction('updateBio', undefined, bioText);
                    setEditingBio(false);
                  } else {
                    setEditingBio(true);
                  }
                }} style={{ background: editingBio ? 'linear-gradient(135deg, var(--color-success), #16a34a)' : 'var(--color-primary-15)', border: 'none', color: editingBio ? 'white' : 'var(--color-primary)', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {editingBio ? 'Save' : 'Edit'}
                </button>
              </div>
              {editingBio ? (
                <textarea
                  className="input-field"
                  placeholder="Tell people about yourself..."
                  value={bioText}
                  onChange={e => setBioText(e.target.value)}
                  maxLength={200}
                  rows={3}
                  style={{ resize: 'none', fontSize: '14px' }}
                />
              ) : (
                <p style={{ fontSize: '14px', color: socialData.bio ? 'var(--color-foreground)' : 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  {socialData.bio || 'No bio yet. Tap Edit to add one.'}
                </p>
              )}
            </div>

            {/* Info */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '16px', padding: '16px', marginBottom: '12px', backdropFilter: 'blur(10px)' }}>
              {[
                { label: 'Email', value: user.email, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                { label: 'Phone', value: user.phone, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg> },
                { label: 'Expires', value: user.permanentExpiry ? new Date(user.permanentExpiry).toLocaleDateString() : 'N/A', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              ].map(info => (
                <div key={info.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--color-card-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>{info.icon}</div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{info.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => { router.push('/'); }}
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', color: 'var(--color-foreground)', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-overlay)', borderTop: '1px solid var(--color-card-border)', backdropFilter: 'blur(24px)', display: 'flex', justifyContent: 'space-around', padding: '10px 0 max(10px, env(safe-area-inset-bottom))', zIndex: 50 }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ background: 'none', border: 'none', color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 12px', borderRadius: '12px', transition: 'all 0.2s', position: 'relative' }}>
              {isActive && <div style={{ position: 'absolute', top: '-10px', width: '20px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }} />}
              {tab.icon}
              <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '500', letterSpacing: '0.5px' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW PROFILE MODAL */}
      {viewingProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(8px)' }} onClick={() => setViewingProfile(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: 'var(--color-bg-alt)', borderRadius: '24px', padding: '24px', maxHeight: '80dvh', overflowY: 'auto', animation: 'scaleIn 0.2s ease' }}>
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
              <button onClick={() => setViewingProfile(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--color-text-muted)', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))', backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px', fontWeight: '900', color: 'white', boxShadow: '0 8px 32px var(--color-glow)' }}>
                {viewingProfile.name?.charAt(0)?.toUpperCase()}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>{viewingProfile.name}</h3>
              <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '16px', background: 'var(--color-primary-15)', border: '1px solid var(--color-primary-25)', fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '2px', fontFamily: 'var(--font-heading)', marginTop: '6px' }}>
                {viewingProfile.permanentCode}
              </div>
            </div>

            {/* Bio */}
            {viewingProfile.bio && (
              <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: '14px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--color-foreground)', lineHeight: '1.5' }}>{viewingProfile.bio}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { socialAction(viewingProfile.isFollowing ? 'unfollow' : 'follow', viewingProfile.id); setViewingProfile({ ...viewingProfile, isFollowing: !viewingProfile.isFollowing }); }}
                style={{
                  flex: 1,
                  background: viewingProfile.isFollowing ? 'var(--color-danger-15)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  border: viewingProfile.isFollowing ? '1px solid var(--color-danger-25)' : 'none',
                  color: viewingProfile.isFollowing ? 'var(--color-danger)' : 'white',
                  padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {viewingProfile.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                onClick={() => { socialAction('block', viewingProfile.id); setViewingProfile(null); }}
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
