import React, { useState } from 'react';
import { Route, Layers, Award, CheckCircle2, AlertTriangle, Terminal, Radio } from 'lucide-react';
import {
  DEFAULT_VLANS,
  build8021qTag,
  processFrameForwarding,
  VLAN_DRILL_QUESTIONS
} from '../../utils/vlanTrunkingEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function VlanTrunkingLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('frame'); // 'frame' | 'switch' | 'roas' | 'drill'
  const [xpClaimed, setXpClaimed] = useState(false);

  // 1. Tag Generator State
  const [tagVid, setTagVid] = useState(10);
  const [tagPcp, setTagPcp] = useState(0);
  const tagDei = 0;

  // 2. Switch Forwarding State
  const [ingressVlan, setIngressVlan] = useState(10);
  const [egressMode, setEgressMode] = useState('access'); // 'access' | 'trunk'
  const [egressAccessVlan, setEgressAccessVlan] = useState(10);
  const [forwardResult, setForwardResult] = useState(null);

  const tagCalc = build8021qTag(tagVid, tagPcp, tagDei);

  const handleSimulateForwarding = () => {
    const ingressPort = { id: 'Fa0/1', mode: 'access', accessVlan: ingressVlan };
    const egressPort = {
      id: egressMode === 'access' ? 'Fa0/2' : 'Gi0/1',
      mode: egressMode,
      accessVlan: egressAccessVlan,
      allowedVlans: [1, 10, 20, 30],
      nativeVlan: 1
    };
    const testFrame = {
      srcMac: '00:1A:2B:3C:4D:01',
      dstMac: '00:1A:2B:3C:4D:02',
      vlanTag: null,
      ethertype: '0x0800',
      payload: 'Ping ICMP'
    };

    const res = processFrameForwarding(testFrame, ingressPort, egressPort);
    setForwardResult(res);
    triggerHaptic('LIGHT');
  };

  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(55, 'vlan_trunking_master');
      } else if (awardXP) {
        awardXP(55, 'vlan_trunking_master');
      }
      triggerHaptic('SUCCESS');
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
                <Route size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>
                IEEE 802.1Q VLAN & Trunking Protocol Studio
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', maxWidth: '800px' }}>
              Verstehe den 4-Byte 802.1Q Frame-Header (TPID 0x8100, PCP QoS, DEI, 12-Bit VID), simuliere Access- vs. Trunk-Ports und konfiguriere Router-on-a-Stick Inter-VLAN Routing.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
              IEEE 802.1Q
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('frame')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'frame' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'frame' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> 802.1Q Frame-Analyse
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'switch' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'switch' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Radio size={16} /> Switch Port Simulator
          </button>
          <button
            onClick={() => setActiveTab('roas')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'roas' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'roas' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Terminal size={16} /> Router-on-a-Stick (CLI)
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

      {/* TAB 1: 802.1Q FRAME HEADER */}
      {activeTab === 'frame' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            IEEE 802.1Q 4-Byte VLAN-Tag Aufbau
          </h2>

          {/* Visuelle Bit-Aufteilung */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366f1' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#818cf8' }}>16 Bit (2 Byte)</div>
              <div style={{ fontWeight: '800', fontSize: '1rem', marginTop: '4px' }}>TPID</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>0x8100</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fbbf24' }}>3 Bit</div>
              <div style={{ fontWeight: '800', fontSize: '1rem', marginTop: '4px' }}>PCP (QoS)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Priorität 0–7</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f87171' }}>1 Bit</div>
              <div style={{ fontWeight: '800', fontSize: '1rem', marginTop: '4px' }}>DEI</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Drop Eligible</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399' }}>12 Bit</div>
              <div style={{ fontWeight: '800', fontSize: '1rem', marginTop: '4px' }}>VID</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>1 bis 4.094</div>
            </div>
          </div>

          {/* Regler zur Interaktiven Berechnung */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                VLAN-ID (VID: 1 - 4094):
              </label>
              <input
                type="number"
                min="1"
                max="4094"
                value={tagVid}
                onChange={(e) => setTagVid(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                PCP Priorität (0 = Standard, 5 = Voice, 7 = Network Control):
              </label>
              <select
                value={tagPcp}
                onChange={(e) => setTagPcp(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
              >
                <option value={0}>0 (Best Effort - Daten)</option>
                <option value={1}>1 (Background)</option>
                <option value={3}>3 (Critical Business Data)</option>
                <option value={5}>5 (Voice / VoIP - RTP)</option>
                <option value={7}>7 (Network Control / STP/OSPF)</option>
              </select>
            </div>
          </div>

          {/* Ergebnis Hex-Tag */}
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Berechneter 4-Byte Ethernet-Tag (Hex):</div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>
                0x{tagCalc.tagHex}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              TPID: 0x8100 | PCP: {tagCalc.pcp} | VID: {tagCalc.vid} (0x{tagCalc.vid.toString(16).toUpperCase()})
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SWITCH PORT SIMULATOR */}
      {activeTab === 'switch' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            Switch Weiterleitung: Access- vs. Trunk-Port Verhalten
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Eingang */}
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ fontWeight: '700', color: '#38bdf8', marginBottom: '10px' }}>
                1. Eingang (Ingress Port Fa0/1):
              </div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>
                Access VLAN des sendenden PCs:
              </label>
              <select
                value={ingressVlan}
                onChange={(e) => setIngressVlan(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
              >
                {DEFAULT_VLANS.map(v => (
                  <option key={v.id} value={v.id}>VLAN {v.id}: {v.name}</option>
                ))}
              </select>
            </div>

            {/* Ausgang */}
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ fontWeight: '700', color: '#c084fc', marginBottom: '10px' }}>
                2. Ziel-Port (Egress Port):
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setEgressMode('access')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: egressMode === 'access' ? '2px solid #8b5cf6' : '1px solid #334155',
                    background: egressMode === 'access' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    color: 'inherit',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Access-Port
                </button>
                <button
                  onClick={() => setEgressMode('trunk')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: egressMode === 'trunk' ? '2px solid #8b5cf6' : '1px solid #334155',
                    background: egressMode === 'trunk' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    color: 'inherit',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Trunk-Port (802.1Q)
                </button>
              </div>

              {egressMode === 'access' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Access-VLAN des Ziel-Ports (Fa0/2):
                  </label>
                  <select
                    value={egressAccessVlan}
                    onChange={(e) => setEgressAccessVlan(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
                  >
                    {DEFAULT_VLANS.map(v => (
                      <option key={v.id} value={v.id}>VLAN {v.id}: {v.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              onClick={handleSimulateForwarding}
              style={{
                padding: '10px 24px',
                borderRadius: '20px',
                border: 'none',
                background: '#8b5cf6',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Frame-Weiterleitung testen
            </button>
          </div>

          {forwardResult && (
            <div style={{ padding: '16px', borderRadius: '8px', border: forwardResult.forwarded ? '1px solid #10b981' : '1px solid #ef4444', background: forwardResult.forwarded ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: forwardResult.forwarded ? '#34d399' : '#f87171', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {forwardResult.forwarded ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                Ergebnis: {forwardResult.forwarded ? 'Erfolgreich weitergeleitet' : 'Frame verworfen'}
              </div>
              <div style={{ fontSize: '0.88rem' }}>{forwardResult.explanation}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ROUTER ON A STICK */}
      {activeTab === 'roas' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            Cisco CLI Konfiguration: Router-on-a-Stick (Inter-VLAN Routing)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Verbindet einen Layer-2 Switch mit einem Router über einen einzigen 802.1Q Trunk-Link. Der Router nutzt Subinterfaces als Standard-Gateways für die jeweiligen VLANs.
          </p>

          <div style={{ padding: '16px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.6' }}>
            <div style={{ color: '#94a3b8' }}># 1. Switch Trunk-Port einrichten:</div>
            <div>Switch(config)# interface GigabitEthernet0/1</div>
            <div>Switch(config-if)# switchport mode trunk</div>
            <div>Switch(config-if)# switchport trunk allowed vlan 10,20,30</div>
            <div>Switch(config-if)# no shutdown</div>
            <div style={{ marginTop: '14px', color: '#94a3b8' }}># 2. Router-on-a-Stick Subinterfaces konfigurieren:</div>
            <div>Router(config)# interface GigabitEthernet0/0</div>
            <div>Router(config-if)# no shutdown</div>
            <div style={{ color: '#38bdf8' }}>Router(config)# interface GigabitEthernet0/0.10</div>
            <div style={{ color: '#38bdf8' }}>Router(config-subif)# encapsulation dot1Q 10</div>
            <div style={{ color: '#38bdf8' }}>Router(config-subif)# ip address 192.168.10.1 255.255.255.0</div>
            <div style={{ marginTop: '8px', color: '#34d399' }}>Router(config)# interface GigabitEthernet0/0.20</div>
            <div style={{ color: '#34d399' }}>Router(config-subif)# encapsulation dot1Q 20</div>
            <div style={{ color: '#34d399' }}>Router(config-subif)# ip address 192.168.20.1 255.255.255.0</div>
          </div>
        </div>
      )}

      {/* TAB 4: IHK DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: IEEE 802.1Q & VLANs"
          questions={VLAN_DRILL_QUESTIONS}
          accentColor="#8b5cf6"
          selectedBg="rgba(139, 92, 246, 0.2)"
          selectedBorderColor="#8b5cf6"
          xpClaimed={xpClaimed}
          onEvaluate={handleEvaluateDrill}
        />
      )}
    </div>
  );
}
