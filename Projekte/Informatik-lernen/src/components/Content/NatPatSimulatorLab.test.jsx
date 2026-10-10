// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import NatPatSimulatorLab from './NatPatSimulatorLab';

afterEach(() => cleanup());

describe('NatPatSimulatorLab', () => {
  it('rendert ohne Absturz und zeigt Simulation an', () => {
    render(<NatPatSimulatorLab />);
    expect(screen.getByText(/NAT & PAT \(Port Address Translation\) Studio/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /NAT Translation Table/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /RFC 1918 Adressbereiche/i })).toBeTruthy();
  });

  it('führt eine Paket-Simulation aus und zeigt Header-Transformation', () => {
    render(<NatPatSimulatorLab />);
    const sendBtn = screen.getByRole('button', { name: /Paket absenden/i });
    fireEvent.click(sendBtn);

    expect(screen.getByText(/Paket-Inspektor: Header-Transformation/i)).toBeTruthy();
    expect(screen.getByText(/Im LAN \(Vor NAT\):/i)).toBeTruthy();
  });

  it('wechselt zum RFC 1918 Tab und prüft IP', () => {
    render(<NatPatSimulatorLab />);
    const rfcTabBtn = screen.getByRole('button', { name: /RFC 1918 Adressbereiche/i });
    fireEvent.click(rfcTabBtn);

    expect(screen.getByText(/RFC 1918 Private IPv4-Adressräume/i)).toBeTruthy();
    expect(screen.getByText(/Class A: 10\.0\.0\.0\/8/i)).toBeTruthy();
  });
});
