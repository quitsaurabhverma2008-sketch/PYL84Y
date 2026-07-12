'use client';

import { COLOR_COMBOS } from '@/lib/themes';
import { useTheme } from './ThemeProvider';

export default function ThemePicker() {
  const { combo, setCombo, showThemePicker, setShowThemePicker, isPermanent } = useTheme();

  if (!showThemePicker) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', backdropFilter: 'blur(8px)' }} onClick={() => setShowThemePicker(false)}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '85dvh', background: 'var(--color-bg-alt)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease' }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: "var(--font-heading)", color: 'var(--color-foreground)' }}>Color Themes</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {isPermanent ? `${COLOR_COMBOS.length} combos — tap to apply` : 'Permanent users only'}
            </p>
          </div>
          <button onClick={() => setShowThemePicker(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--color-text-muted)', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Current theme */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Active:</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[combo.primary, combo.secondary, combo.accent].map((c, i) => (
              <div key={i} style={{ width: '18px', height: '18px', borderRadius: '5px', background: c, border: '2px solid rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-foreground)' }}>{combo.name}</span>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          {!isPermanent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.3 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Locked</p>
              <p style={{ fontSize: '13px' }}>Create a permanent room to unlock all {COLOR_COMBOS.length} color combos.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {COLOR_COMBOS.map(c => {
                const isActive = c.id === combo.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setCombo(c); setShowThemePicker(false); }}
                    style={{
                      background: isActive ? `${c.primary}22` : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isActive ? c.primary : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '12px',
                      padding: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                      {[c.primary, c.secondary, c.accent, c.bg].map((color, i) => (
                        <div key={i} style={{ width: '16px', height: '16px', borderRadius: '4px', background: color, border: '1px solid rgba(255,255,255,0.12)' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: isActive ? '700' : '500', color: isActive ? c.primary : 'var(--color-foreground)', lineHeight: '1.3' }}>{c.name}</p>
                    {isActive && (
                      <div style={{ marginTop: '4px', fontSize: '9px', color: c.primary, fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>ACTIVE</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
