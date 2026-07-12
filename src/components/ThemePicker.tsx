'use client';

import { useState } from 'react';
import { COLOR_COMBOS, applyTheme } from '@/lib/themes';
import { useTheme } from './ThemeProvider';

export default function ThemePicker() {
  const { combo, setCombo, showThemePicker, setShowThemePicker, isPermanent } = useTheme();
  const [selected, setSelected] = useState(combo.id);
  const [search, setSearch] = useState('');

  if (!showThemePicker) return null;

  const filtered = COLOR_COMBOS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', backdropFilter: 'blur(8px)' }} onClick={() => setShowThemePicker(false)}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '80dvh', background: 'var(--color-bg-alt, #1E293B)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: "'Nunito', sans-serif", color: 'var(--color-foreground)' }}>Color Theme</h3>
            <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.35)', marginTop: '2px' }}>
              {isPermanent ? 'Pick a color combo for your UI' : 'Permanent users only — join permanently to unlock'}
            </p>
          </div>
          <button onClick={() => setShowThemePicker(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(248,250,252,0.5)', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <input
            className="input-field"
            placeholder="Search themes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: '14px', padding: '10px 14px' }}
          />
        </div>

        {/* Current theme preview */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(248,250,252,0.35)' }}>Current:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[combo.primary, combo.secondary, combo.accent].map((c, i) => (
              <div key={i} style={{ width: '20px', height: '20px', borderRadius: '6px', background: c, border: '2px solid rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-foreground)' }}>{combo.name}</span>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          {!isPermanent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(248,250,252,0.3)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.3 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Locked</p>
              <p style={{ fontSize: '13px' }}>Only permanent users can change themes. Create a permanent room to unlock all 50+ color combos.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  onDoubleClick={() => { setCombo(c); setShowThemePicker(false); }}
                  style={{
                    background: selected === c.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${selected === c.id ? c.primary : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    padding: '12px',
                    cursor: isPermanent ? 'pointer' : 'not-allowed',
                    opacity: isPermanent ? 1 : 0.4,
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  {/* Color dots */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {[c.primary, c.secondary, c.accent, c.bg].map((color, i) => (
                      <div key={i} style={{ width: '18px', height: '18px', borderRadius: '5px', background: color, border: '1.5px solid rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                  {/* Name */}
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-foreground)', lineHeight: '1.3' }}>{c.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apply button */}
        {isPermanent && selected !== combo.id && (
          <div style={{ padding: '12px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              className="btn-primary"
              onClick={() => {
                const c = COLOR_COMBOS.find(x => x.id === selected);
                if (c) { setCombo(c); setShowThemePicker(false); }
              }}
              style={{ fontSize: '14px', padding: '14px' }}
            >
              Apply Theme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
