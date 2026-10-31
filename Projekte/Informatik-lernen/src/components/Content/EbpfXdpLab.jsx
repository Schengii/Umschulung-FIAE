import React, { useState, useMemo } from 'react';
import { ShieldAlert, Award, Play, Terminal } from 'lucide-react';
import { EbpfXdpSimulator } from '../../utils/ebpfXdpEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

const SAMPLE_EBPF_C = `SEC("xdp")
int filter_ddos(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    
    struct ethhdr *eth = data;
    if (data + sizeof(struct ethhdr) > data_end)
        return XDP_DROP;
        
    // High-Speed In-Kernel Packet Drop
    return XDP_PASS;
}`;

export default function EbpfXdpLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [cCode, setCCode] = useState(SAMPLE_EBPF_C);
  const [ipInput, setIpInput] = useState('198.51.100.44');
  const [packetResult, setPacketResult] = useState(null);
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => new EbpfXdpSimulator(), []);

  const verifierResult = useMemo(() => {
    return sim.verifyEbpfCode(cCode);
  }, [sim, cCode]);

  const handleTestPacket = () => {
    const res = sim.processPacket({ ipSrc: ipInput, portDst: 80, protocol: 'TCP' });
    setPacketResult(res);
    triggerHaptic(res.action === 'XDP_DROP' ? 'WARNING' : 'SUCCESS');
    handleClaim();
  };

  const handleClaim = () => {
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'ebpf_xdp_master');
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
              <Terminal size={14} /> Linux Kernel Programming
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} /> eBPF Verifier &amp; XDP Packet Filtering
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            ⚡ Linux eBPF &amp; XDP High-Speed Packet Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Schreibe eBPF C-Code, durchlaufe den In-Kernel Verifier (Bounds-Checking &amp; Loop-Safety) und filtere DDoS-Pakete auf NIC-Treiberebene (`XDP_DROP`) in unter 50 Nanosekunden.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> eBPF-Code Verifizieren (+45 XP)
        </button>
      </div>

      {/* Performance Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Durchsatz (Driver Level):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            ~14.8 Mpps (100 Gbit/s)
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latenz pro Paket:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {sim.stats.avgLatencyNs} ns (Sub-Microsecond)
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gedroppte Pakete:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>
            {sim.stats.droppedPackets.toLocaleString('de-DE')} Dropped
          </div>
        </div>
      </div>

      {/* C-Code Editor & Verifier Result */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            eBPF C-Quellcode (`filter_ddos.bpf.c`):
          </span>
          <textarea
            value={cCode}
            onChange={(e) => setCCode(e.target.value)}
            rows={10}
            style={{ width: '100%', padding: '12px', background: '#090d16', color: '#38bdf8', border: '1px solid var(--border-color)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.4', resize: 'vertical' }}
          />
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            Linux In-Kernel Verifier &amp; JIT Status:
          </span>

          <div style={{ background: verifierResult.verified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: `1px solid ${verifierResult.verified ? '#10b981' : '#ef4444'}`, borderRadius: '8px', padding: '14px', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 'bold', color: verifierResult.verified ? '#10b981' : '#ef4444' }}>
              {verifierResult.verified ? '✅ Verifier Status: PASSED' : '❌ Verifier Status: REJECTED'}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {verifierResult.verified ? verifierResult.message : verifierResult.error}
            </p>
            {verifierResult.verified && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                Bytecode: {verifierResult.programSizeBpfInsn} Insns | Native JIT: {verifierResult.jittedSizeBytes} Bytes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Packet Test Bar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Test-Paket Quell-IP:</label>
        <input
          type="text"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          style={{ width: '160px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
        />
        <button
          onClick={handleTestPacket}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem' }}
        >
          <Play size={14} /> Paket verarbeiten (XDP Hook)
        </button>

        {packetResult && (
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: packetResult.action === 'XDP_DROP' ? '#ef4444' : '#10b981', marginLeft: 'auto' }}>
            Ergebnis: {packetResult.action} ({packetResult.latencyNs} ns) - {packetResult.reason}
          </span>
        )}
      </div>
    </div>
  );
}
