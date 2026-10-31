import React, { useState, useMemo } from 'react';

import { Network, Filter, Layers, Terminal, Sparkles, Cpu } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { SAMPLE_PACKETS, formatHexDump, evaluatePacketFilter } from '../../utils/packetSnifferEngine';

export default function PacketSnifferLab() {
  const { awardXP } = useStore();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedPacketId, setSelectedPacketId] = useState(1);
  const [highlightedByteRange, setHighlightedByteRange] = useState(null); // [start, end]
  const [xpClaimed, setXpClaimed] = useState(false);

  // Filtered Packets
  const filteredPackets = useMemo(() => {
    return SAMPLE_PACKETS.filter(p => evaluatePacketFilter(p, filterQuery));
  }, [filterQuery]);

  const selectedPacket = useMemo(() => {
    return SAMPLE_PACKETS.find(p => p.id === selectedPacketId) || SAMPLE_PACKETS[0];
  }, [selectedPacketId]);

  // Hex Dump rows
  const hexDumpRows = useMemo(() => {
    return formatHexDump(selectedPacket?.rawHex);
  }, [selectedPacket]);

  const handleSelectLayerField = (byteRange) => {
    setHighlightedByteRange(byteRange);
    if (!xpClaimed) {
      setXpClaimed(true);
      awardXP(10, 'packet_inspected');
    }
  };

  const isByteHighlighted = (byteIndex) => {
    if (!highlightedByteRange || highlightedByteRange.length !== 2) return false;
    return byteIndex >= highlightedByteRange[0] && byteIndex <= highlightedByteRange[1];
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Network size={14} /> Netzwerktechnik &amp; IHK LF 7</span>
              <span className="badge badge-teal"><Sparkles size={14} /> Web-Wireshark Protocol Analyzer</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Web-Wireshark Packet Sniffer &amp; Frame Analyzer
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Analysiere echte Netzwerk-Frames (Ethernet II, IPv4/IPv6, TCP/UDP, DNS, HTTP) mit Schichten-Dekodierung, Hex-Dump Byte-Synchronisation und Wireshark-Display-Filtern.
            </p>
          </div>
        </div>
      </div>

      {/* Wireshark Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px', background: 'var(--bg-secondary)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Filter size={18} color="var(--accent-teal)" />
            <input
              type="text"
              placeholder="Display Filter eingeben (z. B. 'tcp', 'http', 'ip.src == 192.168.1.45', 'tcp.port == 443')..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.92rem', fontFamily: 'monospace' }}
            />
            {filterQuery && (
              <button onClick={() => setFilterQuery('')} className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: '0.8rem' }}>
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['tcp', 'http', 'dns', 'tcp.port == 443'].map(preset => (
              <button
                key={preset}
                onClick={() => setFilterQuery(preset)}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem', fontFamily: 'monospace' }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pane 1: Packet List Table */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="var(--accent-primary)" /> Erfasste Pakete ({filteredPackets.length} von {SAMPLE_PACKETS.length})
        </h2>

        <div style={{ overflowX: 'auto', maxHeight: '240px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 2 }}>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px' }}>No.</th>
                <th style={{ padding: '8px' }}>Zeit</th>
                <th style={{ padding: '8px' }}>Source IP</th>
                <th style={{ padding: '8px' }}>Destination IP</th>
                <th style={{ padding: '8px' }}>Protokoll</th>
                <th style={{ padding: '8px' }}>Länge</th>
                <th style={{ padding: '8px' }}>Info / Zusammenfassung</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackets.map(p => (
                <tr
                  key={p.id}
                  onClick={() => {
                    setSelectedPacketId(p.id);
                    setHighlightedByteRange(null);
                  }}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    background: selectedPacketId === p.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: selectedPacketId === p.id ? 'var(--accent-teal)' : 'var(--text-main)',
                    fontWeight: selectedPacketId === p.id ? '700' : 'normal'
                  }}
                >
                  <td style={{ padding: '8px' }}>{p.id}</td>
                  <td style={{ padding: '8px' }}>{p.timestamp}</td>
                  <td style={{ padding: '8px' }}>{p.layers.ip?.srcIp || '-'}</td>
                  <td style={{ padding: '8px' }}>{p.layers.ip?.dstIp || '-'}</td>
                  <td style={{ padding: '8px' }}>
                    <span className="badge badge-indigo" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                      {p.protocol}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>{p.length} Bytes</td>
                  <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{p.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pane 2 & 3: Protocol Tree Dissection + Synced Hex Dump */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Layer Dissection Tree */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-teal)" /> Protokollschichten (OSI Schicht 2 - 7)
          </h2>

          <div className="space-y-3" style={{ fontSize: '0.88rem' }}>
            {/* Ethernet Layer */}
            {selectedPacket?.layers.ethernet && (
              <div
                onClick={() => handleSelectLayerField(selectedPacket.layers.ethernet.byteRange)}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: isByteHighlighted(0) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                  ▶ Frame &amp; Ethernet II (Schicht 2)
                </div>
                <div style={{ paddingLeft: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  <div>Source MAC: {selectedPacket.layers.ethernet.srcMac}</div>
                  <div>Destination MAC: {selectedPacket.layers.ethernet.dstMac}</div>
                  <div>EtherType: {selectedPacket.layers.ethernet.type}</div>
                </div>
              </div>
            )}

            {/* IP Layer */}
            {selectedPacket?.layers.ip && (
              <div
                onClick={() => handleSelectLayerField(selectedPacket.layers.ip.byteRange)}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: isByteHighlighted(14) ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--accent-teal)', marginBottom: '4px' }}>
                  ▶ Internet Protocol Version {selectedPacket.layers.ip.version} (Schicht 3)
                </div>
                <div style={{ paddingLeft: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  <div>Source IP: {selectedPacket.layers.ip.srcIp}</div>
                  <div>Destination IP: {selectedPacket.layers.ip.dstIp}</div>
                  <div>Time to Live (TTL): {selectedPacket.layers.ip.ttl}</div>
                  <div>Header Checksumme: {selectedPacket.layers.ip.checksum}</div>
                </div>
              </div>
            )}

            {/* Transport Layer (TCP/UDP) */}
            {selectedPacket?.layers.tcp && (
              <div
                onClick={() => handleSelectLayerField(selectedPacket.layers.tcp.byteRange)}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: isByteHighlighted(34) ? '1px solid var(--accent-indigo)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--accent-indigo)', marginBottom: '4px' }}>
                  ▶ Transmission Control Protocol (TCP, Schicht 4)
                </div>
                <div style={{ paddingLeft: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  <div>Source Port: {selectedPacket.layers.tcp.srcPort} | Dest Port: {selectedPacket.layers.tcp.dstPort}</div>
                  <div>Sequence Number: {selectedPacket.layers.tcp.seq} | Acknowledgment: {selectedPacket.layers.tcp.ack}</div>
                  <div>Window Size: {selectedPacket.layers.tcp.windowSize}</div>
                  <div>Flags: {Object.entries(selectedPacket.layers.tcp.flags).filter(([, v]) => v).map(([k]) => k).join(', ')}</div>
                </div>
              </div>
            )}

            {/* Application / Payload */}
            {selectedPacket?.layers.payload && selectedPacket.layers.payload.data && (
              <div
                onClick={() => handleSelectLayerField(selectedPacket.layers.payload.byteRange)}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: isByteHighlighted(54) ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  ▶ Application Data ({selectedPacket.layers.payload.name})
                </div>
                <div style={{ paddingLeft: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.82rem', wordBreak: 'break-all' }}>
                  {selectedPacket.layers.payload.data}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Synced Hex Dump & ASCII View */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-indigo)" /> Paket Hex-Dump &amp; ASCII-Ansicht
          </h2>

          <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.82rem', overflowX: 'auto', maxHeight: '380px', overflowY: 'auto', border: '1px solid #1e293b' }}>
            {hexDumpRows.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>{row.offsetHex}</span>

                {/* Hex Bytes */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {row.bytes.map((byte, bIdx) => {
                    const byteGlobalIdx = row.offsetStart + bIdx;
                    const highlighted = isByteHighlighted(byteGlobalIdx);
                    return (
                      <span
                        key={bIdx}
                        style={{
                          color: highlighted ? '#38bdf8' : '#e2e8f0',
                          background: highlighted ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                          fontWeight: highlighted ? 'bold' : 'normal',
                          padding: '0 2px',
                          borderRadius: '2px'
                        }}
                      >
                        {byte}
                      </span>
                    );
                  })}
                </div>

                {/* ASCII */}
                <span style={{ color: '#94a3b8', borderLeft: '1px solid #334155', paddingLeft: '10px' }}>
                  {row.ascii}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
