// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import VlsmSubnetLab from './VlsmSubnetLab';

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
  });
});

afterEach(() => cleanup());

describe('VlsmSubnetLab Unit Tests', () => {
  it('rendert Basis-Konfiguration und initiale Subnetze', () => {
    render(<VlsmSubnetLab onRewardXP={() => {}} />);
    expect(screen.getByDisplayValue('192.168.10.0')).toBeTruthy();
    expect(screen.getByDisplayValue('24')).toBeTruthy();
    expect(screen.getByText('Adressraum Gültig')).toBeTruthy();
  });

  it('fügt ein neues Subnetz hinzu und aktualisiert den Adressbedarf', () => {
    render(<VlsmSubnetLab onRewardXP={() => {}} />);
    const addBtn = screen.getByRole('button', { name: /subnetz hinzufügen/i });
    fireEvent.click(addBtn);

    expect(screen.getByDisplayValue('Neues Subnetz / Filiale')).toBeTruthy();
  });

  it('kopiert Subnetzplan und vergibt 50 XP', async () => {
    const onRewardXP = vi.fn();
    render(<VlsmSubnetLab onRewardXP={onRewardXP} />);

    const exportBtn = screen.getByRole('button', { name: /subnetzplan exportieren/i });
    fireEvent.click(exportBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(onRewardXP).toHaveBeenCalledWith(50);
  });
});

