import React, { useState, useMemo } from 'react';
import { Network, Award, Layers } from 'lucide-react';
import { LinuxBridgeVxlanSimulator } from '../../utils/linuxBridgeVxlanEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function LinuxBridgeVxlanLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [vni, setVni] = useState(100);
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => {
    const s = new LinuxBridgeVxlanSimulator();
    s.vni = vni;
    return s;
  }, [vni]);

  const packetData = useMemo(() => sim.encapsulateVxlanPacket({}), [sim]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'linux_bridge_vxlan_master');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Network size={14} /> Linux Virtual Networking
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> Linux Bridge &amp; VXLAN Overlay Tunneling
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🌉 Linux Bridge &amp; VXLAN Overlay Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Erkunde `veth`-Paare, Linux Bridge Forwarding Databases (`br0` FDB) und L2-over-L3 VXLAN-Paketkapselung (UDP Port 4789, VNI &amp; MTU Overhead).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> VXLAN-Kapselung Bestätigen (+45 XP)
        </button>
      </div>

      {/* VNI Slider */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px', maxWidth: '400px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          VXLAN Network Identifier (VNI): {vni}
        </label>
        <input type="range" min="1" max="16777215" step="1" value={vni} onChange={(e) => setVni(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>VXLAN Network ID (VNI):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            VNI {packetData.vxlanHeader.vni} (24-Bit)
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Header Overhead:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ec4899', marginTop: '4px' }}>
            +{packetData.overheadBytes} Bytes (UDP 4789)
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Empfohlene Overlay MTU:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {packetData.mtuRecommendation} Bytes
          </div>
        </div>
      </div>

      {/* Encapsulation Packet Inspector */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
          VXLAN Paket-Struktur (Outer L3 UDP $\rightarrow$ VXLAN Header $\rightarrow$ Inner L2 Payload):
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Outer Header */}
          <div style={{ padding: '12px', background: '#090d16', border: '1px solid #6366f1', borderRadius: '6px', fontSize: '0.8rem', color: '#818cf8', fontFamily: 'monospace' }}>
            <strong>[Outer Header (Underlay Network)]</strong> IP {packetData.outerHeader.ip.src} $\rightarrow$ {packetData.outerHeader.ip.dst} | UDP DstPort: {packetData.outerHeader.udp.dstPort}
          </div>

          {/* VXLAN Header */}
          <div style={{ padding: '12px', background: '#090d16', border: '1px solid #ec4899', borderRadius: '6px', fontSize: '0.8rem', color: '#f472b6', fontFamily: 'monospace' }}>
            <strong>[VXLAN Header (8 Bytes)]</strong> Flags: {packetData.vxlanHeader.flags} | VNI: {packetData.vxlanHeader.vni}
          </div>

          {/* Inner Payload */}
          <div style={{ padding: '12px', background: '#090d16', border: '1px solid #10b981', borderRadius: '6px', fontSize: '0.8rem', color: '#34d399', fontFamily: 'monospace' }}>
            <strong>[Inner Payload (Container Virtual Network)]</strong> IP {packetData.innerPayload.ip.src} $\rightarrow$ {packetData.innerPayload.ip.dst} | MAC {packetData.innerPayload.ethernet.src} $\rightarrow$ {packetData.innerPayload.ethernet.dst}
          </div>
        </div>
      </div>
    </div>
  );
}
