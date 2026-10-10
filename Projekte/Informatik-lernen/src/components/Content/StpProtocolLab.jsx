import React, { useState, useId } from 'react';
import {
  Network,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  Terminal,
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react';
import {
  computeSpanningTree,
  getConvergenceMetrics,
  generateCiscoStpConfig,
  STP_PATH_COSTS
} from '../../utils/stpProtocolEngine';

const INITIAL_SWITCHES = [
  { id: 'sw1', name: 'Core-SW-1 (RZ)', priority: 4096, mac: '00:1A:2B:3C:4D:01' },
  { id: 'sw2', name: 'Dist-SW-2 (Geb. A)', priority: 32768, mac: '00:1A:2B:3C:4D:02' },
  { id: 'sw3', name: 'Dist-SW-3 (Geb. B)', priority: 32768, mac: '00:1A:2B:3C:4D:03' },
  { id: 'sw4', name: 'Access-SW-4 (Etage 1)', priority: 32768, mac: '00:1A:2B:3C:4D:04' }
];

const INITIAL_LINKS = [
  { id: 'l1', switchA: 'sw1', portA: 'Gi0/1', switchB: 'sw2', portB: 'Gi0/1', speed: '1G' },
  { id: 'l2', switchA: 'sw1', portA: 'Gi0/2', switchB: 'sw3', portB: 'Gi0/1', speed: '1G' },
  { id: 'l3', switchA: 'sw2', portA: 'Gi0/2', switchB: 'sw3', portB: 'Gi0/2', speed: '1G' },
  { id: 'l4', switchA: 'sw2', portA: 'Gi0/3', switchB: 'sw4', portB: 'Gi0/1', speed: '100M' },
  { id: 'l5', switchA: 'sw3', portA: 'Gi0/3', switchB: 'sw4', portB: 'Gi0/2', speed: '100M' }
];

const IHK_DRILL_QUESTIONS = [
  {
    id: 1,
    question: 'Welches Kriterium entscheidet primär darüber, welcher Switch zur Root Bridge gewählt wird?',
    options: [
      'Die höchste IP-Adresse des Management-VLANs',
      'Die niedrigste Bridge-ID (Priorität + MAC-Adresse)',
      'Die Anzahl der angeschlossenen Gigabit-Ports',
      'Der Switch mit der geringsten CPU-Auslastung'
    ],
    correctIndex: 1,
    explanation: 'Nach IEEE 802.1D / 802.1w gewinnt der Switch mit der numerisch kleinsten Bridge-ID (Default-Priorität 32768, konfigurierbar in 4096er Schritten; bei Gleichstand die kleinste MAC-Adresse).'
  },
  {
    id: 2,
    question: 'Welche Port-Rolle nimmt ein Port an, der weder Root Port noch Designated Port ist?',
    options: [
      'Master Port',
      'Forwarding Port',
      'Alternate Port (Blockierend)',
      'Trunking Port'
    ],
    correctIndex: 2,
    explanation: 'Ports, die redundante Loops schließen und weder bester Weg zur Root Bridge (Root Port) noch bester Weg im Segment sind, werden in RSTP zum Alternate Port (Discarding / Blocking).'
  },
  {
    id: 3,
    question: 'Welche Portkosten (Path Cost) sieht IEEE 802.1D standardmäßig für einen GigabitEthernet-Link (1 Gbit/s) vor?',
    options: ['100', '19', '4', '2'],
    correctIndex: 2,
    explanation: 'Nach IEEE-Standard: 10 Mbit/s = 100, 100 Mbit/s (FastEthernet) = 19, 1 Gbit/s = 4, 10 Gbit/s = 2.'
  }
];

export default function StpProtocolLab({ onRewardXP = () => {} }) {
  const [switches, setSwitches] = useState(INITIAL_SWITCHES);
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [mode, setMode] = useState('rstp');
  const [activeTab, setActiveTab] = useState('topology');
  const [selectedSwitchId, setSelectedSwitchId] = useState('sw1');
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);
  const [claimedXP, setClaimedXP] = useState(false);
  const [copiedSwitchId, setCopiedSwitchId] = useState(null);

  const prioSelectId = useId();

  // Compute Spanning Tree
  const stpResult = computeSpanningTree(switches, links, mode);
  const convergence = getConvergenceMetrics(mode);
  const ciscoConfigs = generateCiscoStpConfig(switches, mode === 'rstp' ? 'rapid-pvst' : 'pvst');

  const handlePriorityChange = (switchId, newPriority) => {
    setSwitches((prev) =>
      prev.map((s) => (s.id === switchId ? { ...s, priority: parseInt(newPriority, 10) } : s))
    );
  };

  const handleToggleLinkFail = (linkId) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, isFailed: !l.isFailed } : l))
    );
  };

  const handleSpeedChange = (linkId, newSpeed) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, speed: newSpeed } : l))
    );
  };

  const handleReset = () => {
    setSwitches(INITIAL_SWITCHES);
    setLinks(INITIAL_LINKS);
    setMode('rstp');
  };

  const handleCopyConfig = (swId) => {
    if (ciscoConfigs[swId]) {
      navigator.clipboard.writeText(ciscoConfigs[swId]);
      setCopiedSwitchId(swId);
      setTimeout(() => setCopiedSwitchId(null), 2000);
    }
  };

  const handleDrillSubmit = () => {
    setDrillSubmitted(true);
    let correctCount = 0;
    IHK_DRILL_QUESTIONS.forEach((q) => {
      if (drillAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount === IHK_DRILL_QUESTIONS.length && !claimedXP) {
      onRewardXP(55, 'stp_rstp_master');
      setClaimedXP(true);
    }
  };

  return (
    <div className="stp-lab-container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.15) 0%, rgba(15, 118, 110, 0.15) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Network size={28} style={{ color: 'var(--accent-primary)' }} />
              <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                IEEE 802.1D / 802.1w Spanning Tree Protocol (STP & RSTP) Studio
              </h1>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
              Offizielles IHK-Prüfungsmodul (AP1 & AP2 FISI/IT-SE): Root-Bridge-Wahl, Pfadkosten, Port-Rollen & Konvergenzzeiten
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setMode('rstp')}
              aria-label="Wechsle zu RSTP 802.1w"
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: mode === 'rstp' ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: mode === 'rstp' ? '#ffffff' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Zap size={16} /> RSTP (802.1w)
            </button>
            <button
              type="button"
              onClick={() => setMode('stp')}
              aria-label="Wechsle zu klassischem STP 802.1D"
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: mode === 'stp' ? 'var(--accent-amber)' : 'var(--bg-card)',
                color: mode === 'stp' ? '#ffffff' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Layers size={16} /> Klassisch STP (802.1D)
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Topologie auf Werkseinstellungen zurücksetzen"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-dim)',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          {[
            { id: 'topology', label: 'Topologie & Loop-Schutz', icon: Activity },
            { id: 'convergence', label: 'Konvergenz & Ausfalltest', icon: AlertTriangle },
            { id: 'cisco', label: 'Cisco IOS CLI-Konfiguration', icon: Terminal },
            { id: 'drill', label: 'IHK-Prüfungsdrill (+55 XP)', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-dim)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'topology' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Switch Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} /> Switch-Bridge-Status
            </h2>

            {switches.map((sw) => {
              const isRoot = sw.id === stpResult.rootBridge.id;
              const costToRoot = stpResult.switchRootCosts[sw.id] ?? 0;

              return (
                <div
                  key={sw.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: isRoot ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{sw.name}</span>
                        {isRoot && (
                          <span
                            style={{
                              background: 'rgba(4, 120, 87, 0.15)',
                              color: 'var(--accent-emerald)',
                              border: '1px solid var(--accent-emerald)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            ROOT BRIDGE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        MAC: {sw.mac} | Root-Pfadkosten: <strong>{costToRoot}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <label htmlFor={`${prioSelectId}-${sw.id}`} style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Prio:
                      </label>
                      <select
                        id={`${prioSelectId}-${sw.id}`}
                        aria-label={`Priorität für ${sw.name}`}
                        value={sw.priority}
                        onChange={(e) => handlePriorityChange(sw.id, e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="0">0 (Höchste Prio)</option>
                        <option value="4096">4096</option>
                        <option value="8192">8192</option>
                        <option value="16384">16384</option>
                        <option value="32768">32768 (Default)</option>
                        <option value="61440">61440 (Niedrigste)</option>
                      </select>
                    </div>
                  </div>

                  {/* Ports for this Switch */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Object.entries(stpResult.portAssignments)
                      .filter(([key]) => key.startsWith(`${sw.id}:`))
                      .map(([key, port]) => {
                        const isRootPort = port.role === 'ROOT';
                        const isAltPort = port.role === 'ALTERNATE';

                        let badgeBg = 'rgba(15, 118, 110, 0.15)';
                        let badgeBorder = 'var(--accent-teal)';
                        let badgeColor = 'var(--accent-teal)';
                        if (isRootPort) {
                          badgeBg = 'rgba(4, 120, 87, 0.15)';
                          badgeBorder = 'var(--accent-emerald)';
                          badgeColor = 'var(--accent-emerald)';
                        } else if (isAltPort) {
                          badgeBg = 'rgba(190, 18, 60, 0.15)';
                          badgeBorder = 'var(--accent-rose)';
                          badgeColor = 'var(--accent-rose)';
                        }

                        return (
                          <div
                            key={key}
                            style={{
                              background: badgeBg,
                              border: `1px solid ${badgeBorder}`,
                              color: badgeColor,
                              padding: '0.3rem 0.6rem',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <strong>{port.portId}</strong>: {port.role} ({port.state})
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Links & Loops Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={18} /> Netzwerkverbindungen & Loop-Auflösung
            </h2>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  Aktiv weiterleitend: {stpResult.activeLinks.length} Links
                </span>
                <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                  Loop-Schutz (Blockiert): {stpResult.blockedLinks.length} Links
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {links.map((link) => {
                  const swA = switches.find((s) => s.id === link.switchA);
                  const swB = switches.find((s) => s.id === link.switchB);
                  const isBlocked = stpResult.blockedLinks.includes(link.id);
                  const isDown = link.isFailed;

                  return (
                    <div
                      key={link.id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isDown
                          ? '1px dashed var(--border-color)'
                          : isBlocked
                          ? '1px solid var(--accent-rose)'
                          : '1px solid var(--accent-emerald)',
                        background: isDown
                          ? 'rgba(0,0,0,0.02)'
                          : isBlocked
                          ? 'rgba(190, 18, 60, 0.05)'
                          : 'rgba(4, 120, 87, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        opacity: isDown ? 0.6 : 1
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {swA?.name.split(' ')[0]} ({link.portA}) &harr; {swB?.name.split(' ')[0]} ({link.portB})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                          Geschwindigkeit: {link.speed} (Kosten: {STP_PATH_COSTS[link.speed]})
                          {isBlocked && ' • LOOP GEBLOCKT'}
                          {isDown && ' • LINK DOWN'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <select
                          aria-label={`Geschwindigkeit für Link ${link.id}`}
                          value={link.speed}
                          onChange={(e) => handleSpeedChange(link.id, e.target.value)}
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.25rem 0.4rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-main)'
                          }}
                        >
                          <option value="10M">10M (Cost 100)</option>
                          <option value="100M">100M (Cost 19)</option>
                          <option value="1G">1G (Cost 4)</option>
                          <option value="10G">10G (Cost 2)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleToggleLinkFail(link.id)}
                          aria-label={isDown ? `Link ${link.id} reparieren` : `Link ${link.id} trennen`}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.8rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-color)',
                            background: isDown ? 'var(--accent-emerald)' : 'var(--bg-primary)',
                            color: isDown ? '#ffffff' : 'var(--accent-rose)',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          {isDown ? 'Reparieren' : 'Trennen'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convergence Tab */}
      {activeTab === 'convergence' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} style={{ color: 'var(--accent-amber)' }} />
            Konvergenzzeitvergleich: STP (802.1D) vs. RSTP (802.1w)
          </h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>{convergence.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {convergence.phases.map((phase, idx) => (
              <div
                key={phase.name}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    SCHRITT {idx + 1}
                  </span>
                  <span
                    style={{
                      background: 'rgba(67, 56, 202, 0.1)',
                      color: 'var(--accent-primary)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {phase.duration}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{phase.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{phase.state}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: mode === 'rstp' ? 'rgba(4, 120, 87, 0.1)' : 'rgba(180, 83, 9, 0.1)',
              border: `1px solid ${mode === 'rstp' ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            {mode === 'rstp' ? (
              <CheckCircle2 size={24} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={24} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontWeight: 700 }}>
                {mode === 'rstp' ? 'Industriestandard RSTP: Minimale Unterbrechung' : 'Warnung vor klassischem STP'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {mode === 'rstp'
                  ? 'Durch Point-to-Point Links und Edge Ports (PortFast) konvergiert das Netz sofort ohne Forward-Delay-Timer.'
                  : '30 bis 50 Sekunden Blackout bei Link-Wechsel führen zu TCP-Timeouts und Verbindungsabbrüchen.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cisco CLI Tab */}
      {activeTab === 'cisco' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={20} />
            Cisco IOS Switch-Konfigurationsgenerator
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {switches.map((sw) => (
              <button
                key={sw.id}
                type="button"
                onClick={() => setSelectedSwitchId(sw.id)}
                aria-label={`Konfiguration für ${sw.name} anzeigen`}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-xs)',
                  border: selectedSwitchId === sw.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: selectedSwitchId === sw.id ? 'var(--accent-primary)' : 'var(--bg-primary)',
                  color: selectedSwitchId === sw.id ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {sw.name}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <pre
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                overflowX: 'auto',
                fontFamily: 'var(--font-code)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              {ciscoConfigs[selectedSwitchId] || '! Keine Konfiguration verfügbar'}
            </pre>
            <button
              type="button"
              onClick={() => handleCopyConfig(selectedSwitchId)}
              aria-label="Cisco-Konfiguration in die Zwischenablage kopieren"
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {copiedSwitchId === selectedSwitchId ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>
        </div>
      )}

      {/* Exam Drill Tab */}
      {activeTab === 'drill' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} style={{ color: 'var(--accent-amber)' }} />
                IHK-Prüfungsdrill: STP & RSTP Meisterschaft
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Beantworte alle 3 Prüfungsfragen korrekt, um +55 XP zu verdienen.
              </p>
            </div>
            {claimedXP && (
              <span
                style={{
                  background: 'rgba(4, 120, 87, 0.15)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid var(--accent-emerald)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                +55 XP Freigeschaltet!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {IHK_DRILL_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  {idx + 1}. {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = drillAnswers[q.id] === optIdx;
                    const isCorrect = q.correctIndex === optIdx;
                    let borderCol = 'var(--border-color)';
                    let bgCol = 'var(--bg-card)';

                    if (drillSubmitted) {
                      if (isCorrect) {
                        borderCol = 'var(--accent-emerald)';
                        bgCol = 'rgba(4, 120, 87, 0.1)';
                      } else if (isSelected) {
                        borderCol = 'var(--accent-rose)';
                        bgCol = 'rgba(190, 18, 60, 0.1)';
                      }
                    } else if (isSelected) {
                      borderCol = 'var(--accent-primary)';
                      bgCol = 'rgba(67, 56, 202, 0.08)';
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => !drillSubmitted && setDrillAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        aria-label={`Antwort ${optIdx + 1}: ${opt}`}
                        style={{
                          textAlign: 'left',
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-xs)',
                          border: `1px solid ${borderCol}`,
                          background: bgCol,
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          cursor: drillSubmitted ? 'default' : 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {drillSubmitted && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', marginRight: '0.3rem', color: 'var(--accent-primary)' }} />
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            {drillSubmitted ? (
              <button
                type="button"
                onClick={() => {
                  setDrillSubmitted(false);
                  setDrillAnswers({});
                }}
                aria-label="Prüfungsdrill wiederholen"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Nochmals versuchen
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDrillSubmit}
                aria-label="Antworten prüfen und XP sichern"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Antworten auswerten
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
