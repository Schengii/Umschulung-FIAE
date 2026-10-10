// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DhcpDoraLab from './DhcpDoraLab';
import { DHCP_DRILL_QUESTIONS } from '../../utils/dhcpDoraEngine';

afterEach(() => cleanup());

const button = (name) => screen.getByRole('button', { name });
const click = (name) => fireEvent.click(button(name));
const openTab = (name) => click(name);

const SCHRITTE = [/1\. DISCOVER/, /2\. ➔ OFFER/, /3\. REQUEST/, /4\. ➔ ACK/];
const beantworteDrill = (indizes) => {
  const optionen = screen.getAllByRole('button').filter((b) => /^[A-D]\) /.test(b.textContent));
  indizes.forEach((optIdx, frageIdx) => fireEvent.click(optionen[frageIdx * 4 + optIdx]));
};

describe('DhcpDoraLab: DORA-Handshake', () => {
  it('startet unkonfiguriert in INIT, nur DISCOVER ist aktiv', () => {
    render(<DhcpDoraLab onRewardXP={() => {}} />);
    expect(screen.getByText('INIT')).toBeTruthy();
    expect(screen.getByText('Keine (Unkonfiguriert)')).toBeTruthy();
    expect(SCHRITTE.map((s) => button(s).disabled)).toEqual([false, true, true, true]);
  });

  it('erzwingt die Reihenfolge D-O-R-A und vergibt die XP beim ACK', () => {
    const onRewardXP = vi.fn();
    render(<DhcpDoraLab onRewardXP={onRewardXP} />);

    click(SCHRITTE[0]);
    expect(screen.getByText('SELECTING')).toBeTruthy();
    expect(SCHRITTE.map((s) => button(s).disabled)).toEqual([true, false, true, true]);

    click(SCHRITTE[1]);
    // OFFER bleibt aktiv: In SELECTING darf ein Client laut RFC 2131 weitere
    // Angebote anderer Server empfangen. REQUEST wird erst jetzt möglich.
    expect(SCHRITTE.map((s) => button(s).disabled)).toEqual([true, false, false, true]);

    click(SCHRITTE[2]);
    expect(screen.getByText('REQUESTING')).toBeTruthy();
    expect(onRewardXP).not.toHaveBeenCalled();

    click(SCHRITTE[3]);
    expect(screen.getByText('BOUND')).toBeTruthy();
    expect(screen.getByText('Zugewiesene IP:').parentElement.textContent).toContain('192.168.1.150');
    expect(screen.getByText(/\(4 Pakete\)/)).toBeTruthy();
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP.mock.calls[0][0]).toBe(55);
  });

  it('zeigt im Paket-Inspektor die UDP-Ports 68 ➔ 67 und 67 ➔ 68', () => {
    render(<DhcpDoraLab onRewardXP={() => {}} />);
    click(/1-Klick Auto DORA/);
    const ports = screen.getAllByText(/^UDP \d+ ➔ \d+/).map((el) => el.textContent.match(/^UDP \d+ ➔ \d+/)[0]);
    expect(ports).toEqual(['UDP 68 ➔ 67', 'UDP 67 ➔ 68', 'UDP 68 ➔ 67', 'UDP 67 ➔ 68']);
    ['DHCPDISCOVER (1)', 'DHCPOFFER (2)', 'DHCPREQUEST (3)', 'DHCPACK (5)'].forEach((typ) =>
      expect(screen.getByText(typ)).toBeTruthy()
    );
  });

  it('vergibt die XP nach Reset und erneutem Handshake nicht doppelt', () => {
    const onRewardXP = vi.fn();
    render(<DhcpDoraLab onRewardXP={onRewardXP} />);
    click(/1-Klick Auto DORA/);
    click(/^Reset$/);
    expect(screen.getByText('INIT')).toBeTruthy();
    expect(screen.queryByText(/Pakete\)/).textContent).toMatch(/\(0 Pakete\)/);
    SCHRITTE.forEach((s) => click(s));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
  });

  it('vergibt mit aktivem Relay-Agent eine Adresse aus dem entfernten Subnetz', () => {
    render(<DhcpDoraLab onRewardXP={() => {}} />);
    click(/Relay Agent: Aus/);
    expect(button(/Relay Agent: AKTIV \(GIADDR\)/)).toBeTruthy();
    click(/1-Klick Auto DORA/);
    // Status-Anzeige plus yiaddr in OFFER und ACK
    expect(screen.getAllByText('192.168.2.150').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('192.168.1.150')).toBeNull();
    expect(screen.getAllByText('192.168.2.1').length).toBeGreaterThan(0);
  });
});

describe('DhcpDoraLab: Lease-Lifecycle', () => {
  it('sperrt die Timer-Aktionen, solange keine Lease besteht', () => {
    render(<DhcpDoraLab onRewardXP={() => {}} />);
    openTab(/Lease-Lifecycle/);
    expect(button(/T1 Renewal/).disabled).toBe(true);
    expect(button(/T2 Rebind/).disabled).toBe(true);
    expect(button(/DHCP Release/).disabled).toBe(true);
  });

  it('durchläuft RENEWING und REBINDING und gibt die Adresse per Release frei', () => {
    render(<DhcpDoraLab onRewardXP={() => {}} />);
    click(/1-Klick Auto DORA/);
    openTab(/Lease-Lifecycle/);

    click(/T1 Renewal/);
    // Nach T1 ist nur noch der Rebind (T2) möglich, kein zweites Renewal/Release
    expect(button(/T1 Renewal/).disabled).toBe(true);
    expect(button(/DHCP Release/).disabled).toBe(true);
    click(/T2 Rebind/);
    expect(button(/T2 Rebind/).disabled).toBe(true);

    openTab(/DORA-Handshake/);
    expect(screen.getByText('REBINDING')).toBeTruthy();
    expect(screen.getByText('DHCPREQUEST (3) [T1 Renewal]')).toBeTruthy();
    expect(screen.getByText('DHCPREQUEST (3) [T2 Rebind]')).toBeTruthy();
  });

  it('setzt den Client nach einem Release zurück auf INIT', () => {
    render(<DhcpDoraLab onRewardXP={() => {}} />);
    click(/1-Klick Auto DORA/);
    openTab(/Lease-Lifecycle/);
    click(/DHCP Release/);
    openTab(/DORA-Handshake/);
    expect(screen.getByText('INIT')).toBeTruthy();
    expect(screen.getByText('Keine (Unkonfiguriert)')).toBeTruthy();
    expect(screen.getByText('DHCPRELEASE (7)')).toBeTruthy();
  });
});

describe('DhcpDoraLab: Prüfungs-Drill', () => {
  const RICHTIG = DHCP_DRILL_QUESTIONS.map((q) => q.korrektIndex);
  const FALSCH = RICHTIG.map((i) => (i + 1) % 4);

  it('vergibt bei bestandenem Drill 55 XP', () => {
    const onRewardXP = vi.fn();
    render(<DhcpDoraLab onRewardXP={onRewardXP} />);
    openTab(/Prüfungs-Drill/);
    beantworteDrill(RICHTIG);
    click(/Antworten prüfen/);
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('✓ Richtig!')).toHaveLength(4);
  });

  it('vergibt nichts bei nur 2 richtigen Antworten', () => {
    const onRewardXP = vi.fn();
    render(<DhcpDoraLab onRewardXP={onRewardXP} />);
    openTab(/Prüfungs-Drill/);
    beantworteDrill([RICHTIG[0], RICHTIG[1], FALSCH[2], FALSCH[3]]);
    click(/Antworten prüfen/);
    expect(onRewardXP).not.toHaveBeenCalled();
    expect(screen.getAllByText('✗ Lösung & Erklärung:')).toHaveLength(2);
  });

  it('teilt sich die einmaligen XP mit dem Handshake', () => {
    const onRewardXP = vi.fn();
    render(<DhcpDoraLab onRewardXP={onRewardXP} />);
    click(/1-Klick Auto DORA/);
    openTab(/Prüfungs-Drill/);
    beantworteDrill(RICHTIG);
    click(/Antworten prüfen/);
    expect(onRewardXP).toHaveBeenCalledTimes(1);
  });
});
