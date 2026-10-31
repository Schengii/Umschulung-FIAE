import React, { useState, useMemo } from 'react';
import { Network, Zap, Layers } from 'lucide-react';
import { 
  simulateServiceMeshHop, 
  generateCiliumEbpfSnippet, 
  MESH_MODES 
} from '../../utils/ebpfCiliumEngine';
import { useStore } from '../../store/useStore';

export default function EbpfCiliumLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('topology'); // 'topology' | 'benchmark' | 'code'
  const [podCount, setPodCount] = useState(25);
  const [payloadSize, setPayloadSize] = useState(2048);
  const [enableL7, setEnableL7] = useState(true);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const ciliumMetrics = useMemo(() => {
    return simulateServiceMeshHop({
      mode: MESH_MODES.EBPF_CILIUM,
      payloadSizeBytes: payloadSize,
      podCount,
      enableL7Tracing: enableL7
    });
  }, [payloadSize, podCount, enableL7]);

  const envoyMetrics = useMemo(() => {
    return simulateServiceMeshHop({
      mode: MESH_MODES.SIDECAR_ENVOY,
      payloadSizeBytes: payloadSize,
      podCount,
      enableL7Tracing: enableL7
    });
  }, [payloadSize, podCount, enableL7]);

  const handleTestComparison = () => {
    if (!rewardClaimed) {
      awardXP(55, 'eBPF Cilium Sidecarless Service Mesh Explorer');
      setRewardClaimed(true);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Network size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>
                eBPF Cilium Service Mesh & L7 Tracing Sandbox
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                Sidecarless Cloud-Native Architektur: Linux Kernel Socket-Bypass (sock_ops / sk_msg) vs. Envoy Sidecars
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('topology')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'topology' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'topology' ? 'var(--text-on-accent)' : 'var(--text-main)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Netzwerkpfad & Topologie
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'benchmark' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'benchmark' ? 'var(--text-on-accent)' : 'var(--text-main)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Latenz- & RAM-Vergleich
          </button>
          <button
            onClick={() => setActiveTab('code')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'code' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'code' ? 'var(--text-on-accent)' : 'var(--text-main)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            eBPF C-Code
          </button>
        </div>
      </div>

      {/* Configuration Controls */}
      <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
              Anzahl Microservice Pods im Cluster: <strong>{podCount} Pods</strong>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={podCount}
              onChange={(e) => setPodCount(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
              Payload-Größe: <strong>{payloadSize} Bytes</strong>
            </label>
            <input
              type="range"
              min="512"
              max="16384"
              step="512"
              value={payloadSize}
              onChange={(e) => setPayloadSize(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              L7 Tracing (HTTP Path / Latency):
            </span>
            <button
              onClick={() => setEnableL7(!enableL7)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: enableL7 ? 'var(--accent-emerald)' : 'var(--bg-card-hover)',
                color: enableL7 ? 'var(--text-on-accent)' : 'var(--text-main)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {enableL7 ? 'Aktiv (HTTP Metriken)' : 'Deaktiviert'}
            </button>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handleTestComparison}
              style={{
                padding: '10px 18px',
                background: 'var(--accent-cyan)',
                color: 'var(--text-on-accent)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Zap size={16} /> Benchmark ausführen (+55 XP)
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Netzwerkpfad & Topologie */}
      {activeTab === 'topology' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '20px' }}>
          {/* Cilium eBPF Path */}
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--accent-cyan)', color: 'var(--text-on-accent)' }}>
                <Zap size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--accent-cyan)' }}>
                Cilium eBPF (Sidecarless)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: '0 0 16px 0' }}>
              Verbindet Sockets direkt im Linux-Kernel via eBPF Sockmap. Null Sidecars, Umgehung von TCP/IP und iptables.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ciliumMetrics.hops.map((hop, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: hop.type === 'ebpf_bypass' ? 'rgba(6, 182, 212, 0.25)' : 'var(--bg-tertiary)',
                    border: hop.type === 'ebpf_bypass' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 'bold', color: hop.type === 'ebpf_bypass' ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
                      {hop.name}
                    </span>
                    {hop.desc && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                        ⚡ {hop.desc}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hop {idx + 1}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              <strong>Ergebnis:</strong> Nur {ciliumMetrics.hopCount} Hops! Latenz: <strong>{ciliumMetrics.latencyP50} ms</strong> (P50). Kein Speicherverbrauch für Proxies.
            </div>
          </div>

          {/* Envoy Sidecar Path */}
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--accent-rose)', color: 'var(--text-on-accent)' }}>
                <Layers size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--accent-rose)' }}>
                Klassischer Envoy Sidecar Proxy
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: '0 0 16px 0' }}>
              Jeder Pod injiziert einen Envoy-Container. Daten durchlaufen 4 User-Kernel Kontextwechsel & iptables.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {envoyMetrics.hops.map((hop, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: hop.type === 'proxy' ? 'rgba(239, 68, 68, 0.25)' : 'var(--bg-tertiary)',
                    border: hop.type === 'proxy' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 'bold', color: hop.type === 'proxy' ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                      {hop.name}
                    </span>
                    {hop.desc && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-rose)', marginTop: '2px' }}>
                        ⚠️ {hop.desc}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hop {idx + 1}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', fontSize: '0.85rem', color: 'var(--accent-rose)' }}>
              <strong>Ergebnis:</strong> {envoyMetrics.hopCount} Hops! Latenz: <strong>{envoyMetrics.latencyP50} ms</strong> (P50). Speicher-Overhead: <strong>{envoyMetrics.totalMemoryOverheadMb} MB</strong>.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Latenz- & RAM-Vergleich */}
      {activeTab === 'benchmark' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--accent-cyan)' }}>
            Direkte Gegenüberstellung der Architekturen ({podCount} Pods)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>Latenz-Speedup (P50)</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                ~{ciliumMetrics.speedupFactor}x schneller
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {ciliumMetrics.latencyP50} ms (eBPF) vs. {envoyMetrics.latencyP50} ms (Envoy)
              </div>
            </div>

            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>Eingesparter Arbeitsspeicher (RAM)</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                -{envoyMetrics.totalMemoryOverheadMb} MB
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Keine 65MB Sidecar-Proxies pro Pod erforderlich
              </div>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)' }}>CPU-Overhead Entlastung</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                ~{envoyMetrics.cpuOverheadPct - ciliumMetrics.cpuOverheadPct}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Wegfall von doppeltem TCP-Parsing und User/Kernel Kontextwechseln
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Kriterium</th>
                <th style={{ padding: '10px', color: 'var(--accent-cyan)' }}>Cilium eBPF (Sidecarless)</th>
                <th style={{ padding: '10px', color: 'var(--accent-rose)' }}>Envoy Sidecar Proxy</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px' }}>Latenz P50</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{ciliumMetrics.latencyP50} ms</td>
                <td style={{ padding: '10px', color: 'var(--accent-rose)' }}>{envoyMetrics.latencyP50} ms</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px' }}>Latenz P99</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{ciliumMetrics.latencyP99} ms</td>
                <td style={{ padding: '10px', color: 'var(--accent-rose)' }}>{envoyMetrics.latencyP99} ms</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px' }}>RAM-Verbrauch ({podCount} Pods)</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>0 MB (Kernel-native)</td>
                <td style={{ padding: '10px', color: 'var(--accent-rose)' }}>{envoyMetrics.totalMemoryOverheadMb} MB</td>
              </tr>
              <tr>
                <td style={{ padding: '10px' }}>L7 Observability (HTTP/gRPC)</td>
                <td style={{ padding: '10px', color: 'var(--accent-cyan)' }}>Via eBPF Kernel Tracing (Zero Proxy)</td>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Via Envoy HTTP Connection Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: eBPF C-Code */}
      {activeTab === 'code' && (
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 14px 0', color: 'var(--accent-cyan)' }}>
            Linux Kernel eBPF Sockmap Redirection C-Programm
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: '0 0 16px 0' }}>
            Dieser C-Code wird vom Cilium Daemon in den Linux Kernel geladen und mittels JIT-Compiler zu nativen CPU-Befehlen assembliert.
          </p>
          <pre style={{
            background: 'var(--bg-tertiary)',
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            color: 'var(--accent-cyan)',
            lineHeight: '1.5',
            border: '1px solid var(--border-color)'
          }}>
            {generateCiliumEbpfSnippet()}
          </pre>
        </div>
      )}
    </div>
  );
}
