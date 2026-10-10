import React, { useState } from 'react';
import { Network, ShieldCheck, Award, RefreshCw, Send, CheckCircle2, AlertCircle, Laptop, Server, Globe } from 'lucide-react';
import {
  RFC_1918_RANGES,
  isPrivateIp,
  translateOutboundPacket,
  translateInboundPacket,
  DEFAULT_NAT_SCENARIO,
  NAT_PAT_DRILL_QUESTIONS
} from '../../utils/natPatEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function NatPatSimulatorLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation' | 'table' | 'rfc1918' | 'drill'
  const [selectedHostId, setSelectedHostId] = useState('pc1');
  const [selectedTargetId, setSelectedTargetId] = useState('web1');
  const [natTable, setNatTable] = useState(DEFAULT_NAT_SCENARIO.initialTable);
  const [lastPacketLog, setLastPacketLog] = useState(null);
  const [testIpInput, setTestIpInput] = useState('172.20.5.1');
  const [xpClaimed, setXpClaimed] = useState(false);

  const currentHost = DEFAULT_NAT_SCENARIO.lanHosts.find(h => h.id === selectedHostId) || DEFAULT_NAT_SCENARIO.lanHosts[0];
  const currentTarget = DEFAULT_NAT_SCENARIO.wanTargets.find(t => t.id === selectedTargetId) || DEFAULT_NAT_SCENARIO.wanTargets[0];

  const handleSendPacket = () => {
    // 1. Ausgehendes Paket vom LAN-Host erzeugen
    const srcPort = currentHost.defaultPort + Math.floor(Math.random() * 200);
    const outboundPacket = {
      srcIp: currentHost.ip,
      srcPort,
      dstIp: currentTarget.ip,
      dstPort: currentTarget.port,
      protocol: 'TCP',
      payload: `HTTP GET ${currentTarget.label}`
    };

    // 2. Router übersetzt Paket (PAT / Overload)
    const outResult = translateOutboundPacket(
      outboundPacket,
      DEFAULT_NAT_SCENARIO.routerPublicIp,
      natTable
    );

    // 3. Antwortpaket vom Webserver simulieren
    const responsePacket = {
      srcIp: currentTarget.ip,
      srcPort: currentTarget.port,
      dstIp: DEFAULT_NAT_SCENARIO.routerPublicIp,
      dstPort: outResult.allocatedPort,
      protocol: 'TCP',
      payload: 'HTTP 200 OK (Data)'
    };

    const inResult = translateInboundPacket(responsePacket, outResult.updatedTable);

    setNatTable(outResult.updatedTable);
    setLastPacketLog({
      timestamp: new Date().toLocaleTimeString(),
      originalOut: outboundPacket,
      translatedOut: outResult.translatedPacket,
      responseIn: responsePacket,
      translatedIn: inResult.translatedPacket,
      explanation: outResult.explanation,
      inExplanation: inResult.explanation
    });

    triggerHaptic('LIGHT');
  };

  const handleResetTable = () => {
    setNatTable([]);
    setLastPacketLog(null);
    triggerHaptic('MEDIUM');
  };

  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(55, 'nat_pat_master');
      } else if (awardXP) {
        awardXP(55, 'nat_pat_master');
      }
      triggerHaptic('SUCCESS');
    }
  };

  const isTestIpPrivate = isPrivateIp(testIpInput.trim());

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', border: '1px solid rgba(14, 165, 233, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                <Network size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>
                RFC 3022 / RFC 2663 NAT & PAT (Port Address Translation) Studio
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', maxWidth: '800px' }}>
              Simuliere die Übersetzung privater RFC-1918-Adressen in öffentliche Internet-IPs über PAT (Overload). Verfolge Header-Transformationen von Inside Local zu Inside Global und überprüfe die Live NAT-Translation-Table.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              IHK FISI & AP1
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('simulation')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'simulation' ? '#0ea5e9' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'simulation' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={16} /> Live Paket-Simulation
          </button>
          <button
            onClick={() => setActiveTab('table')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'table' ? '#0ea5e9' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'table' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} /> NAT Translation Table ({natTable.length})
          </button>
          <button
            onClick={() => setActiveTab('rfc1918')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'rfc1918' ? '#0ea5e9' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'rfc1918' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={16} /> RFC 1918 Adressbereiche
          </button>
          <button
            onClick={() => setActiveTab('drill')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'drill' ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'drill' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Award size={16} /> IHK-Drill (+55 XP)
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE SIMULATION */}
      {activeTab === 'simulation' && (
        <div>
          {/* Topologie & Konfiguration */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Absender (LAN) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#38bdf8' }}>
                  1. LAN Absender-Host (Inside Local):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {DEFAULT_NAT_SCENARIO.lanHosts.map(h => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHostId(h.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: selectedHostId === h.id ? '2px solid #0ea5e9' : '1px solid var(--border-color, #334155)',
                        background: selectedHostId === h.id ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'inherit',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{h.label}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.ip}</div>
                      </div>
                      <Laptop size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ziel (WAN) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#10b981' }}>
                  2. Internet-Ziel (Outside Global):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {DEFAULT_NAT_SCENARIO.wanTargets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTargetId(t.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: selectedTargetId === t.id ? '2px solid #10b981' : '1px solid var(--border-color, #334155)',
                        background: selectedTargetId === t.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'inherit',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong>{t.label}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.ip}:{t.port}</div>
                      </div>
                      <Server size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sende-Button */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSendPacket}
                style={{
                  padding: '12px 28px',
                  borderRadius: '30px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                }}
              >
                <Send size={18} /> Paket absenden (PAT Overload ausführen)
              </button>
            </div>
          </div>

          {/* PAKET-INSPEKTOR & PROTOKOLL */}
          {lastPacketLog && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: '700' }}>
                Paket-Inspektor: Header-Transformation (Takt {lastPacketLog.timestamp})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {/* Hinweg: LAN -> Router */}
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'rgba(14, 165, 233, 0.05)' }}>
                  <div style={{ fontWeight: '700', color: '#38bdf8', marginBottom: '8px' }}>
                    1. Im LAN (Vor NAT):
                  </div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
                    <div><strong>Quelle (Inside Local):</strong> {lastPacketLog.originalOut.srcIp}:{lastPacketLog.originalOut.srcPort}</div>
                    <div><strong>Ziel (Outside Global):</strong> {lastPacketLog.originalOut.dstIp}:{lastPacketLog.originalOut.dstPort}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Protokoll: {lastPacketLog.originalOut.protocol}</div>
                  </div>
                </div>

                {/* Nach NAT: Router -> WAN */}
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <div style={{ fontWeight: '700', color: '#34d399', marginBottom: '8px' }}>
                    2. Im Internet (Nach PAT Overload):
                  </div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
                    <div><strong>Übersetzte Quelle (Inside Global):</strong> {lastPacketLog.translatedOut.srcIp}:{lastPacketLog.translatedOut.srcPort}</div>
                    <div><strong>Ziel:</strong> {lastPacketLog.translatedOut.dstIp}:{lastPacketLog.translatedOut.dstPort}</div>
                    <div style={{ color: '#34d399', fontWeight: '700' }}>Port {lastPacketLog.translatedOut.srcPort} zugewiesen!</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', fontSize: '0.88rem' }}>
                <strong>Erklärung:</strong> {lastPacketLog.explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NAT TABLE */}
      {activeTab === 'table' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
              Live NAT Translation Table (Router Public: {DEFAULT_NAT_SCENARIO.routerPublicIp})
            </h2>
            <button
              onClick={handleResetTable}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #334155)',
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Tabelle leeren
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color, #334155)', color: 'var(--text-muted, #94a3b8)' }}>
                  <th style={{ padding: '8px 12px' }}>Proto</th>
                  <th style={{ padding: '8px 12px', color: '#38bdf8' }}>Inside Local (LAN Host)</th>
                  <th style={{ padding: '8px 12px', color: '#34d399' }}>Inside Global (Public Socket)</th>
                  <th style={{ padding: '8px 12px' }}>Outside Global (Server)</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {natTable.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Keine aktiven NAT-Sockets vorhanden. Sende ein Paket im ersten Tab ab!
                    </td>
                  </tr>
                ) : (
                  natTable.map(entry => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>{entry.protocol}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#38bdf8' }}>
                        {entry.insideLocalIp}:{entry.insideLocalPort}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#34d399', fontWeight: '700' }}>
                        {entry.insideGlobalIp}:{entry.insideGlobalPort}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>
                        {entry.outsideGlobalIp}:{entry.outsideGlobalPort}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                          {entry.state}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RFC 1918 */}
      {activeTab === 'rfc1918' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            RFC 1918 Private IPv4-Adressräume
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {RFC_1918_RANGES.map(r => (
              <div key={r.class} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #334155)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '1rem', marginBottom: '4px' }}>
                  {r.class}: {r.cidr}
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  Bereich: <code>{r.range}</code>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Kapazität: {r.totalIps.toLocaleString('de-DE')} IP-Adressen
                </div>
              </div>
            ))}
          </div>

          {/* Interaktiver IP-Checker */}
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color, #334155)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: '700' }}>
              Interaktiver Adressraum-Prüfer:
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={testIpInput}
                onChange={(e) => setTestIpInput(e.target.value)}
                placeholder="z.B. 192.168.1.1"
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, #334155)', background: 'var(--bg-card, #0f172a)', color: 'inherit', width: '180px', fontFamily: 'monospace' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.9rem', color: isTestIpPrivate ? '#34d399' : '#f87171' }}>
                {isTestIpPrivate ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {isTestIpPrivate ? 'Privat nach RFC 1918 (Nicht im Internet geroutet)' : 'Öffentliche / Globale Internet-IP (Oder ungültig)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IHK DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: NAT, PAT & Adressierung"
          questions={NAT_PAT_DRILL_QUESTIONS}
          accentColor="#0ea5e9"
          selectedBg="rgba(14, 165, 233, 0.2)"
          selectedBorderColor="#0ea5e9"
          xpClaimed={xpClaimed}
          onEvaluate={handleEvaluateDrill}
        />
      )}
    </div>
  );
}
