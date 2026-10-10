import { describe, it, expect } from 'vitest';
import {
  createDhcpSession,
  executeDhcpAction,
  runFullDoraHandshake,
  DHCP_DRILL_QUESTIONS
} from './dhcpDoraEngine';

describe('dhcpDoraEngine', () => {
  it('erstellt eine initiale DHCP-Session im Zustand INIT', () => {
    const s = createDhcpSession();
    expect(s.clientState).toBe('INIT');
    expect(s.assignedIp).toBeNull();
    expect(s.leaseTimeSeconds).toBe(86400);
    expect(s.t1Seconds).toBe(43200); // 50%
    expect(s.t2Seconds).toBe(75600); // 87.5%
    expect(s.history).toHaveLength(0);
  });

  it('führt den vollständigen 4-Way DORA Handshake schrittweise aus', () => {
    let s = createDhcpSession();

    // 1. Discover
    s = executeDhcpAction(s, 'DISCOVER');
    expect(s.clientState).toBe('SELECTING');
    expect(s.history).toHaveLength(1);
    expect(s.history[0].phase).toBe('DISCOVER');
    expect(s.history[0].dstIp).toBe('255.255.255.255');
    expect(s.history[0].dstPort).toBe(67);

    // 2. Offer
    s = executeDhcpAction(s, 'OFFER');
    expect(s.history).toHaveLength(2);
    expect(s.history[1].phase).toBe('OFFER');
    expect(s.history[1].yiaddr).toBe('192.168.1.150');

    // 3. Request
    s = executeDhcpAction(s, 'REQUEST');
    expect(s.clientState).toBe('REQUESTING');
    expect(s.history).toHaveLength(3);
    expect(s.history[2].phase).toBe('REQUEST');

    // 4. Acknowledge
    s = executeDhcpAction(s, 'ACK');
    expect(s.clientState).toBe('BOUND');
    expect(s.assignedIp).toBe('192.168.1.150');
    expect(s.history).toHaveLength(4);
    expect(s.history[3].phase).toBe('ACK');
  });

  it('führt runFullDoraHandshake in einem Schritt aus', () => {
    const s = runFullDoraHandshake(createDhcpSession());
    expect(s.clientState).toBe('BOUND');
    expect(s.assignedIp).toBe('192.168.1.150');
    expect(s.history).toHaveLength(4);
  });

  it('simuliert T1-Renewal und T2-Rebinding Timerausführung', () => {
    let s = runFullDoraHandshake(createDhcpSession());

    // T1 Renewal
    s = executeDhcpAction(s, 'RENEW_T1');
    expect(s.clientState).toBe('RENEWING');
    expect(s.history[s.history.length - 1].dstIp).toBe('192.168.1.1'); // Unicast!

    // T2 Rebinding
    s = executeDhcpAction(s, 'REBIND_T2');
    expect(s.clientState).toBe('REBINDING');
    expect(s.history[s.history.length - 1].dstIp).toBe('255.255.255.255'); // Broadcast!
  });

  it('unterstützt DHCP Relay Agent Weiterleitung mit GIADDR', () => {
    let s = createDhcpSession({ isRelayActive: true });
    s = executeDhcpAction(s, 'DISCOVER');

    expect(s.history[0].giaddr).toBe('192.168.2.1');
    expect(s.history[0].description).toContain('Relay Agent');
  });

  it('führt DHCP Release aus und setzt den Zustand auf INIT zurück', () => {
    let s = runFullDoraHandshake(createDhcpSession());
    expect(s.clientState).toBe('BOUND');

    s = executeDhcpAction(s, 'RELEASE');
    expect(s.clientState).toBe('INIT');
    expect(s.assignedIp).toBeNull();
  });

  it('stellt 4 IHK-Prüfungsfragen bereit', () => {
    expect(DHCP_DRILL_QUESTIONS).toHaveLength(4);
    for (const q of DHCP_DRILL_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.optionen).toHaveLength(4);
      expect(q.korrektIndex).toBeGreaterThanOrEqual(0);
      expect(q.korrektIndex).toBeLessThan(4);
    }
  });
});
