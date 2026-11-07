import React from 'react';

export default function NavMobileDrawer({ onNavigate }) {
  return (
    <div
      className="mobile-only animate-fade-in"
      style={{
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        padding: '16px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
          Navigation
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('dashboard')} style={{ justifyContent: 'flex-start' }}>🏠 Dashboard</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('campaign')} style={{ justifyContent: 'flex-start' }}>🗺️ Story Kampagne</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('labs')} style={{ justifyContent: 'flex-start' }}>🧪 Alle Labs &amp; Simulatoren</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('wiso_kalkulation')} style={{ justifyContent: 'flex-start' }}>📊 WISO &amp; Kalkulation</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('ieee754_lab')} style={{ justifyContent: 'flex-start' }}>🔬 IEEE-754 Zahlen-Lab</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('ipv6_routing_lab')} style={{ justifyContent: 'flex-start' }}>🌐 IPv6 &amp; Routing</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('owasp_exploit_lab')} style={{ justifyContent: 'flex-start' }}>🔒 OWASP Top 10</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('neural_net_lab')} style={{ justifyContent: 'flex-start' }}>🧠 Neural Network &amp; BPE</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('cheat_sheets')} style={{ justifyContent: 'flex-start' }}>📄 IHK Spickzettel (PDF)</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('exam')} style={{ justifyContent: 'flex-start' }}>🎓 IHK Abschlussprüfung</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('oral_exam')} style={{ justifyContent: 'flex-start' }}>🎙️ Mündliches Fachgespräch</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('anfaenger_guide')} style={{ justifyContent: 'flex-start' }}>🌱 Einsteiger Kurs</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('languages')} style={{ justifyContent: 'flex-start' }}>🐍 Sprachen Academy</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('games')} style={{ justifyContent: 'flex-start' }}>🎮 Mini-Games</button>
      </div>
    </div>
  );
}

