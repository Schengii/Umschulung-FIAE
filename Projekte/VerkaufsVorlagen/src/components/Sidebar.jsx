import React, { useState } from 'react';
import { Sparkles, BookOpen, TrendingUp, Settings, Trash2, Clock } from 'lucide-react';

function getDaysSince(dateStr) {
  if (!dateStr) return null;
  // Try ISO format first (createdAt), then German locale format (date)
  let d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Try German format DD.MM.YYYY
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      d = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
    }
  }
  if (isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function StaleBadge({ days, onSnooze, onAdjustPrice }) {
  const [open, setOpen] = useState(false);
  const isOrange = days >= 7 && days < 14;
  const isRed = days >= 14;
  if (!isOrange && !isRed) return null;

  const suggestedDrop = isRed ? 15 : 5;
  const color = isRed ? '#f87171' : '#ffb61e';
  const label = isRed ? '🔴 Preis senken?' : '⏳ Bald senken?';

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          padding: '1px 6px',
          fontSize: '0.62rem',
          fontWeight: 700,
          borderRadius: '4px',
          border: `1px solid ${color}`,
          background: `${color}15`,
          color,
          cursor: 'pointer',
          lineHeight: 1.5,
        }}
      >
        {label}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 100,
            minWidth: '200px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            marginTop: '4px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
            Dieser Artikel ist seit <strong style={{ color }}>{days} Tagen</strong> nicht verkauft. Empfehlung: Preis um <strong style={{ color: '#00bc7e' }}>{suggestedDrop}%</strong> senken.
          </div>
          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '0.75rem', padding: '5px 8px', justifyContent: 'center' }}
              onClick={() => { onAdjustPrice(suggestedDrop); setOpen(false); }}
            >
              Preis um {suggestedDrop}% senken
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 8px', justifyContent: 'center' }}
              onClick={() => { onSnooze(); setOpen(false); }}
            >
              ⏰ Erinnerung in 7 Tagen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  history,
  currentItem,
  phase,
  activeSidebarTab,
  onSelectTab,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onOpenSettings,
  onSnoozeItem,
  onReducePrice,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Sparkles className="logo-icon" size={24} />
          <span className="logo-text">ListerAI</span>
        </div>
      </div>

      <div style={{ display: 'flex', padding: '0 16px', gap: '8px', marginBottom: '16px' }}>
        <button 
          type="button"
          className={`btn ${activeSidebarTab === 'listings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', gap: '6px', justifyContent: 'center' }}
          onClick={() => onSelectTab('listings')}
        >
          <BookOpen size={14} />
          Vorlagen
        </button>
        <button 
          type="button"
          className={`btn ${activeSidebarTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', gap: '6px', justifyContent: 'center' }}
          onClick={() => onSelectTab('dashboard')}
        >
          <TrendingUp size={14} style={{ color: activeSidebarTab === 'dashboard' ? '#fff' : 'var(--accent-emerald)' }} />
          Statistiken
        </button>
      </div>

      <div className="history-list" style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', padding: '0 16px', textAlign: 'left' }}>
          Deine Vorlagen ({history.length})
        </h3>
        
        {history.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Noch keine Vorlagen erstellt. Lade ein Bild hoch!
          </div>
        ) : (
          history.map((item) => {
            const isActive = currentItem && currentItem.name === item.name && phase === 'editor';
            const days = getDaysSince(item.createdAt || item.date);
            const isSold = item.saleDetails?.isSold;
            return (
              <div 
                key={item.id} 
                className={`history-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectHistoryItem(item)}
                style={{ cursor: 'pointer' }}
              >
                <img src={item.image} alt={item.name} className="history-thumb" />
                <div className="history-info">
                  <div className="history-title">{item.name}</div>
                  <div className="history-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} />
                      {item.date} • {item.suggestedPrice} €
                    </span>
                    {isSold && (
                      <span className="badge" style={{ position: 'static', padding: '1px 6px', fontSize: '0.65rem', backgroundColor: 'var(--accent-emerald-bg)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        Verkauft
                      </span>
                    )}
                    {!isSold && days !== null && (
                      <StaleBadge
                        days={days}
                        onSnooze={() => onSnoozeItem && onSnoozeItem(item.id)}
                        onAdjustPrice={(pct) => onReducePrice && onReducePrice(item.id, pct)}
                      />
                    )}
                  </div>
                </div>
                <button 
                  type="button"
                  className="close-btn" 
                  style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={(e) => onDeleteHistoryItem(item.id, e)}
                  title="Vorlage löschen"
                >
                  <Trash2 size={14} className="text-rose-400" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <button type="button" className="btn btn-secondary" style={{ flex: 1, width: '100%', justifyContent: 'center' }} onClick={onOpenSettings}>
          <Settings size={18} />
          Gemini Setup
        </button>
      </div>
    </aside>
  );
}
