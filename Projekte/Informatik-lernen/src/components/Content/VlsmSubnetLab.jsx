import React, { useState, useMemo } from 'react';
import { 
  Network, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Copy, Layers 
} from 'lucide-react';
import { calculateVlsm, DEFAULT_VLSM_SUBNETS } from '../../utils/vlsmEngine';
import { useStore } from '../../store/useStore';

export default function VlsmSubnetLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [baseIp, setBaseIp] = useState('192.168.10.0');
  const [basePrefix, setBasePrefix] = useState(24);
  const [subnets, setSubnets] = useState(DEFAULT_VLSM_SUBNETS);
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const result = useMemo(() => {
    return calculateVlsm({ baseIp, basePrefix, subnets });
  }, [baseIp, basePrefix, subnets]);

  const handleAddSubnet = () => {
    const newId = `sub_${Date.now()}`;
    setSubnets(prev => [...prev, { id: newId, name: 'Neues Subnetz / Filiale', requiredHosts: 10 }]);
  };

  const handleRemoveSubnet = (id) => {
    setSubnets(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateHosts = (id, val) => {
    const hosts = Math.max(1, Number(val) || 1);
    setSubnets(prev => prev.map(s => s.id === id ? { ...s, requiredHosts: hosts } : s));
  };

  const handleUpdateName = (id, name) => {
    setSubnets(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleCopyTable = () => {
    if (!result.isValid) return;
    let text = `VLSM Subnetzplan für ${result.baseNetwork}/${result.basePrefix}\n\n`;
    text += `Abteilung | Benötigt | Zugewiesen | CIDR | Subnetzmaske | Netz-ID | Erste Host-IP | Letzte Host-IP | Broadcast\n`;
    text += `---|---|---|---|---|---|---|---|---\n`;
    result.subnets.forEach(s => {
      text += `${s.name} | ${s.requiredHosts} | ${s.allocatedHosts} | ${s.prefix} | ${s.subnetMask} | ${s.networkAddress} | ${s.firstUsableHost} | ${s.lastUsableHost} | ${s.broadcastAddress}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (!xpClaimed) {
      if (onRewardXP) onRewardXP(50);
      else awardXP(50, 'vlsm_master');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Network size={14} /> IHK FISI &amp; CCNA Standard
              </span>
              <span className="badge badge-teal">Variable Length Subnet Masking</span>
              {result.isOverflow ? (
                <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} /> Adressraum Überlauf!
                </span>
              ) : (
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Adressraum Gültig
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              VLSM Subnet Splitter &amp; IP-Planer
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '720px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Teile ein Basis-Netzwerk hierarchisch in bedarfsgerechte Subnetze auf. Automatische Sortierung nach Host-Bedarf, präzise Boundary-Berechnung und Export für IHK-Prüfungen.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCopyTable}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Copy size={18} />
            {copied ? 'Tabelle kopiert!' : 'Subnetzplan exportieren (+50 XP)'}
          </button>
        </div>
      </div>

      {/* Base Network Configuration */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Basis-Netzwerk IP:
          </label>
          <input
            type="text"
            value={baseIp}
            onChange={(e) => setBaseIp(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', fontWeight: 700 }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Basis-Präfix (CIDR):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              min="8"
              max="30"
              value={basePrefix}
              onChange={(e) => setBasePrefix(Number(e.target.value))}
              style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', fontWeight: 700 }}
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              ({result.baseTotalIps || 0} Adressen gesamt)
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600 }}>Auslastung des Basisnetzes:</span>
            <span style={{ fontWeight: 800, color: result.isOverflow ? 'var(--accent-rose)' : 'var(--accent-teal)' }}>
              {result.overallUtilizationPercent || 0}%
            </span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, result.overallUtilizationPercent || 0)}%`,
                height: '100%',
                background: result.isOverflow ? 'var(--accent-rose)' : 'var(--gradient-cyber)',
                transition: 'width 0.3s'
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Freie IPs verbleibend: <strong>{result.freeIpsRemaining || 0}</strong>
          </div>
        </div>
      </div>

      {/* Subnet Requirement Inputs & Table */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-primary)" />
            Subnetz-Bedarf definieren
          </h2>

          <button className="btn btn-secondary btn-sm" onClick={handleAddSubnet} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Subnetz hinzufügen
          </button>
        </div>

        {/* Dynamic Subnet Cards / Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 8px' }}>Abteilung / Verwendungszweck</th>
                <th style={{ padding: '10px 8px' }}>Hosts (Bedarf)</th>
                <th style={{ padding: '10px 8px' }}>Zugewiesen</th>
                <th style={{ padding: '10px 8px' }}>CIDR</th>
                <th style={{ padding: '10px 8px' }}>Subnetzmaske</th>
                <th style={{ padding: '10px 8px' }}>Netzwerk-ID</th>
                <th style={{ padding: '10px 8px' }}>Nutzbarer Host-Bereich</th>
                <th style={{ padding: '10px 8px' }}>Broadcast</th>
                <th style={{ padding: '10px 8px' }}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {result.subnets?.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', background: s.isOverflow ? 'rgba(225, 29, 72, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => handleUpdateName(s.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', width: '100%', minWidth: '150px' }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      value={s.requiredHosts}
                      onChange={(e) => handleUpdateHosts(s.id, e.target.value)}
                      style={{ width: '65px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', fontWeight: 700 }}
                    />
                  </td>
                  <td style={{ padding: '8px', fontWeight: 700, color: 'var(--accent-teal)' }}>
                    {s.allocatedHosts} Hosts
                  </td>
                  <td style={{ padding: '8px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {s.prefix}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-code)', fontSize: '0.8rem' }}>
                    {s.subnetMask}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-code)', fontSize: '0.82rem', fontWeight: 700 }}>
                    {s.networkAddress}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {s.firstUsableHost} – {s.lastUsableHost}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-code)', fontSize: '0.82rem', color: 'var(--accent-amber)' }}>
                    {s.broadcastAddress}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button
                      onClick={() => handleRemoveSubnet(s.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      title="Entfernen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
