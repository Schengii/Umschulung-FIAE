// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import VlanTrunkingLab from './VlanTrunkingLab';

afterEach(() => cleanup());

describe('VlanTrunkingLab', () => {
  it('rendert ohne Absturz und zeigt Frame-Analyse an', () => {
    render(<VlanTrunkingLab />);
    expect(screen.getByText(/IEEE 802\.1Q VLAN & Trunking Protocol Studio/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Switch Port Simulator/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Router-on-a-Stick/i })).toBeTruthy();
  });

  it('führt eine Switch-Port Weiterleitungssimulation aus', () => {
    render(<VlanTrunkingLab />);
    const switchTabBtn = screen.getByRole('button', { name: /Switch Port Simulator/i });
    fireEvent.click(switchTabBtn);

    const testBtn = screen.getByRole('button', { name: /Frame-Weiterleitung testen/i });
    fireEvent.click(testBtn);

    expect(screen.getByText(/Ergebnis: Erfolgreich weitergeleitet/i)).toBeTruthy();
  });

  it('wechselt zum Router-on-a-Stick CLI Tab', () => {
    render(<VlanTrunkingLab />);
    const roasTabBtn = screen.getByRole('button', { name: /Router-on-a-Stick/i });
    fireEvent.click(roasTabBtn);

    expect(screen.getByText(/Cisco CLI Konfiguration: Router-on-a-Stick/i)).toBeTruthy();
    expect(screen.getByText(/encapsulation dot1Q 10/i)).toBeTruthy();
  });
});
