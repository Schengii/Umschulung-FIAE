import React, { useState, useMemo } from 'react';
import { Video, Award, Server } from 'lucide-react';
import { WebRtcMediaTopologySimulator } from '../../utils/webrtcSfuEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WebrtcSfuLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [participants, setParticipants] = useState(6);
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => new WebRtcMediaTopologySimulator(), []);
  const topologyData = useMemo(() => sim.evaluateTopologies(participants), [sim, participants]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'webrtc_sfu_master');
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
              <Video size={14} /> Real-Time Communications (RTC)
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} /> Mesh vs. MCU vs. SFU Simulcast
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📡 WebRTC Media Server Architecture Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Vergleiche die 3 großen WebRTC-Architekturen: Full Mesh P2P ($O(N^2)$ Bandbreite), MCU Transcoding (Server-CPU Limit) und modernen SFU Simulcast (Selective Forwarding Unit).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> SFU-Architektur Bestätigen (+45 XP)
        </button>
      </div>

      {/* Participant Slider */}
      <div style={{ background: 'var(--bg-secondary)', padding: '18px 22px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Teilnehmer in der Videokonferenz (N):</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '2px' }}>
            {participants} Personen
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={participants}
            onChange={(e) => { setParticipants(parseInt(e.target.value, 10)); triggerHaptic('SELECTION'); }}
            style={{ width: '200px' }}
          />
        </div>
      </div>

      {/* Architecture 3-Column Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {/* Full Mesh */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: `2px solid ${topologyData.mesh.isViable ? 'var(--border-color)' : '#ef4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>1. Full Mesh (P2P)</h3>
            <span className={`badge ${topologyData.mesh.isViable ? 'badge-emerald' : 'badge-amber'}`}>
              {topologyData.mesh.isViable ? 'OK' : 'Überlastet'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <div>Client Upload: <strong>{topologyData.mesh.uploadStreams} Streams</strong></div>
            <div>Client Download: <strong>{topologyData.mesh.downloadStreams} Streams</strong></div>
            <div>Verbindungen im Mesh: <strong>{topologyData.mesh.totalConnections} Peer-to-Peer</strong></div>
            <div>Client Bandbreite: <strong style={{ color: topologyData.mesh.isViable ? 'var(--text-main)' : '#ef4444' }}>{(topologyData.mesh.clientBandwidthKbps / 1000).toFixed(1)} Mbit/s</strong></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>{topologyData.mesh.recommendation}</div>
          </div>
        </div>

        {/* MCU */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>2. MCU (Mixed Stream)</h3>
            <span className="badge badge-indigo">Transcoding</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <div>Client Upload: <strong>1 Stream</strong></div>
            <div>Client Download: <strong>1 Composite Stream</strong></div>
            <div>Server CPU-Last: <strong style={{ color: topologyData.mcu.serverCpuPercent > 80 ? '#ef4444' : 'var(--accent-primary)' }}>{topologyData.mcu.serverCpuPercent}%</strong></div>
            <div>Client Bandbreite: <strong>{(topologyData.mcu.clientBandwidthKbps / 1000).toFixed(1)} Mbit/s</strong></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>{topologyData.mcu.recommendation}</div>
          </div>
        </div>

        {/* SFU Simulcast */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '2px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>3. SFU (Simulcast)</h3>
            <span className="badge badge-emerald">Best Practice</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <div>Client Upload: <strong>3 Simulcast Layers (720p/360p/180p)</strong></div>
            <div>Client Download: <strong>{topologyData.sfu.downloadStreams} Adaptive Streams</strong></div>
            <div>Server CPU-Last: <strong style={{ color: '#10b981' }}>{topologyData.sfu.serverCpuPercent}% (RTP Forwarding)</strong></div>
            <div>Client Bandbreite: <strong>{(topologyData.sfu.clientBandwidthKbps / 1000).toFixed(1)} Mbit/s</strong></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>{topologyData.sfu.recommendation}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
