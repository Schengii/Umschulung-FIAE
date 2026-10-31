import React, { useState } from 'react';
import {
  evaluateHttpCache
} from '../../utils/httpCachingEngine';
import {
  Server,
  Zap,
  RefreshCw,
  Award,
  Database,
  Cpu
} from 'lucide-react';

export default function HttpCachingLab({ onRewardXP }) {
  const [maxAge, setMaxAge] = useState(30);
  const [noCache, setNoCache] = useState(false);
  const [noStore, setNoStore] = useState(false);
  const [etag, setEtag] = useState('"v1-hash-abc"');
  const [simulatedTimeOffset, setSimulatedTimeOffset] = useState(10); // Sekunden seit Cache
  const [sendIfNoneMatch, setSendIfNoneMatch] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const cachedResource = {
    url: 'https://api.ihk-lernen.de/v1/profile',
    etag,
    cachedAt: 1000000,
    directives: {
      maxAge,
      noCache,
      noStore
    },
    body: JSON.stringify({ userId: 42, role: 'FIAE_DEV', tier: 'PRO' }, null, 2)
  };

  const clientHeaders = sendIfNoneMatch ? { ifNoneMatch: etag } : {};
  const currentSimTime = 1000000 + simulatedTimeOffset * 1000;

  const result = evaluateHttpCache(cachedResource, currentSimTime, clientHeaders);

  const handleFinish = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      if (onRewardXP) onRewardXP(60);
    }
  };

  return (
    <div className="lab-container animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={14} /> RFC 9111 HTTP Caching Studio
            </span>
            <span className="badge badge-amber">ETag & 304 Not Modified</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            HTTP Caching, Cache-Control & Conditional Requests
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Untersuche Browser- und Gateway-Caching-Strategien, Freshness-Lebenszyklen und 304 Revalidierungen.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isCompleted}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={18} />
          {isCompleted ? 'Abgeschlossen (+60 XP)' : 'Labor abschließen (+60 XP)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Controls */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="var(--accent-teal)" /> Server Cache-Control Konfiguration
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              `max-age` (Sekunden Gültigkeit): <strong>{maxAge}s</strong>
            </label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Verstrichene Zeit seit Cache-Speicherung: <strong>{simulatedTimeOffset}s</strong>
            </label>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={simulatedTimeOffset}
              onChange={(e) => setSimulatedTimeOffset(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={noCache}
                onChange={(e) => setNoCache(e.target.checked)}
              />
              <span><code>no-cache</code> (Erzwingt Revalidierung vor Nutzung)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={noStore}
                onChange={(e) => setNoStore(e.target.checked)}
              />
              <span><code>no-store</code> (Untersagt jegliche Speicherung)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={sendIfNoneMatch}
                onChange={(e) => setSendIfNoneMatch(e.target.checked)}
              />
              <span>Client sendet <code>If-None-Match: {etag}</code></span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setEtag(`"v${Math.floor(Math.random() * 900 + 100)}-hash"`)}
              style={{ fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} /> Neuen Server-ETag generieren
            </button>
          </div>
        </div>

        {/* Live HTTP Inspection */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-amber)" /> Request & Response Evaluierung
          </h3>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <span
              className={`badge ${
                result.status === 200 && result.source === 'memory-cache'
                  ? 'badge-teal'
                  : result.status === 304
                  ? 'badge-indigo'
                  : 'badge-amber'
              }`}
              style={{ fontSize: '1.1rem', padding: '6px 12px' }}
            >
              HTTP {result.status} {result.statusText}
            </span>
            <span className="badge badge-teal">Quelle: {result.source}</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.6' }}>
            <div style={{ color: 'var(--accent-teal)' }}># Response Headers:</div>
            {Object.entries(result.headers).map(([k, v]) => (
              <div key={k}>
                <strong>{k}:</strong> {v}
              </div>
            ))}
            <div style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              # Restliche Cache-TTL: {result.ttlRemainingSeconds}s | Alter: {result.ageSeconds}s
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Empfangener Response Body ({result.body.length} Bytes übertragen):
            </label>
            <pre style={{ margin: 0, padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', fontSize: '0.8rem', color: result.body ? '#f8fafc' : 'var(--text-muted)' }}>
              {result.body || '(Leer bei 304 Not Modified – 0 Bytes Payload-Transfer!)'}
            </pre>
          </div>
        </div>
      </div>

      {/* IHK Wissen */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--accent-teal)" /> IHK AP2 Kernwissen: HTTP Caching
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>`no-cache` vs. `no-store`:</strong>
            <p style={{ margin: '4px 0 0' }}>`no-cache` erlaubt Caching, verlangt aber vor jedem Zugriff eine Revalidierung (ETag) beim Server. `no-store` verbietet jegliches Speichern (z.B. für Bankdaten/DSGVO).</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Conditional Requests (ETag / If-None-Match):</strong>
            <p style={{ margin: '4px 0 0' }}>Hat sich der Inhalt nicht geändert, sendet der Server <code>HTTP 304 Not Modified</code> ohne Body. Das spart Bandbreite und Server-CPU.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Cache-Hierarchie:</strong>
            <p style={{ margin: '4px 0 0' }}>Browser Memory Cache (0ms) $\to$ Service Worker Cache $\to$ Disk Cache $\to$ CDN / Reverse Proxy $\to$ Origin Server.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
