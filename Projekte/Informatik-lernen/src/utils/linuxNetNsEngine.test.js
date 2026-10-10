import { describe, it, expect } from 'vitest';
import { simulateNamespacePing, generateNetnsBashScript } from './linuxNetNsEngine';

describe('linuxNetNsEngine', () => {
  it('simuliert erfolgreichen L2-Ping zwischen zwei Namespaces über die Bridge', () => {
    const res = simulateNamespacePing('ns-web', '10.0.0.3', true, true);
    expect(res.success).toBe(true);
    expect(res.steps.length).toBe(3);
    expect(res.rttMs).toBeLessThan(1);
  });

  it('bricht ab, wenn die Linux Bridge br0 down ist', () => {
    const res = simulateNamespacePing('ns-web', '10.0.0.3', false, true);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('BRIDGE_DOWN');
  });

  it('erkennt fehlendes iptables NAT MASQUERADE bei externem Ping', () => {
    const res = simulateNamespacePing('ns-web', '8.8.8.8', true, false);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NO_NAT');
  });

  it('generiert vollständiges Bash-Skript mit veth, bridge und iptables', () => {
    const script = generateNetnsBashScript();
    expect(script).toContain('ip netns add ns-web');
    expect(script).toContain('type veth');
    expect(script).toContain('iptables -t nat');
  });
});
