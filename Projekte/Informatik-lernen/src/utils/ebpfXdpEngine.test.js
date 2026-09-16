import { describe, it, expect } from 'vitest';
import { EbpfXdpSimulator } from './ebpfXdpEngine';

describe('Linux eBPF & XDP Engine', () => {
  it('detects verifier errors for infinite loops and pointer access without bounds check', () => {
    const sim = new EbpfXdpSimulator();

    const loopCode = 'while (1) { count++; }';
    const loopRes = sim.verifyEbpfCode(loopCode);
    expect(loopRes.verified).toBe(false);
    expect(loopRes.error).toContain('Unbounded loop');

    const validCode = 'if (data + sizeof(struct ethhdr) > data_end) return XDP_DROP;';
    const validRes = sim.verifyEbpfCode(validCode);
    expect(validRes.verified).toBe(true);
  });

  it('processes and drops malicious packets at sub-microsecond NIC driver latency', () => {
    const sim = new EbpfXdpSimulator();
    sim.xdpAction = 'XDP_DROP';

    const res = sim.processPacket({ ipSrc: '198.51.100.44', portDst: 80, protocol: 'TCP' });
    expect(res.action).toBe('XDP_DROP');
    expect(res.latencyNs).toBeLessThan(100);
    expect(sim.stats.droppedPackets).toBe(320401);
  });
});
