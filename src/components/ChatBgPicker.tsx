'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface BgImage {
  url: string;
  thumb: string;
  source: string;
}

const CATEGORIES = [
  { id: 'anime', label: 'Anime', emoji: '🌸' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'space', label: 'Space', emoji: '🌌' },
  { id: 'abstract', label: 'Abstract', emoji: '🎨' },
  { id: 'cute', label: 'Cute', emoji: '🐰' },
  { id: 'dark', label: 'Dark', emoji: '🌑' },
  { id: 'clear', label: 'No BG', emoji: '✨' },
];

async function fetchImages(category: string): Promise<BgImage[]> {
  try {
    if (category === 'clear') return [];

    if (category === 'anime') {
      const res = await fetch('https://api.waifu.pics/sfw/waifu');
      const data = await res.json();
      return [{ url: data.url, thumb: data.url, source: 'waifu.pics' }];
    }

    const res = await fetch(`https://api.unsplash.com/search/photos?query=${category}+wallpaper&per_page=12&orientation=landscape`, {
      headers: { 'Authorization': 'Client-ID PX6Hk4WY5U2bSjX8w3k5iG3j0o1qL5z7m9r2t4u6w8y' },
    });

    if (res.ok) {
      const data = await res.json();
      return (data.results || []).slice(0, 12).map((img: any) => ({
        url: img.urls.regular,
        thumb: img.urls.thumb,
        source: 'unsplash',
      }));
    }
  } catch {}
  return [];
}

export default function ChatBgPicker() {
  const { chatBg, setChatBg, showChatBgPicker, setShowChatBgPicker } = useTheme();
  const [category, setCategory] = useState('anime');
  const [images, setImages] = useState<BgImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!showChatBgPicker) return;
    setLoading(true);
    fetchImages(category).then(imgs => { setImages(imgs); setLoading(false); });
  }, [category, showChatBgPicker]);

  if (!showChatBgPicker) return null;

  const loadMore = async () => {
    setLoadingMore(true);
    const more = await fetchImages(category);
    setImages(prev => [...prev, ...more]);
    setLoadingMore(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', backdropFilter: 'blur(8px)' }} onClick={() => setShowChatBgPicker(false)}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '85dvh', background: 'var(--color-bg-alt, #1E293B)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: "'Nunito', sans-serif", color: 'var(--color-foreground)' }}>Chat Background</h3>
            <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.35)', marginTop: '2px' }}>Choose a background image for your chat</p>
          </div>
          <button onClick={() => setShowChatBgPicker(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(248,250,252,0.5)', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1.5px solid ${category === cat.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                background: category === cat.id ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.04)',
                color: category === cat.id ? 'var(--color-primary)' : 'rgba(248,250,252,0.5)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          {category === 'clear' ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '14px', marginBottom: '16px' }}>
                {chatBg ? 'Remove the current background image?' : 'No background image set — using Three.js animated background.'}
              </p>
              {chatBg && (
                <button className="btn-primary" onClick={() => { setChatBg(null); setShowChatBgPicker(false); }} style={{ fontSize: '14px', padding: '12px' }}>
                  Remove Background
                </button>
              )}
            </div>
          ) : loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '16/10', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(248,250,252,0.3)' }}>
              <p>No images found. Try another category.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setChatBg(img.url); setShowChatBgPicker(false); }}
                    style={{
                      aspectRatio: '16/10',
                      borderRadius: '12px',
                      border: chatBg === img.url ? '3px solid var(--color-primary)' : '2px solid rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'none',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    <img src={img.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    {chatBg === img.url && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary"
                style={{ marginTop: '12px', fontSize: '13px', padding: '10px' }}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
