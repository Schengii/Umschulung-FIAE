// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import IhkTransferTimeLab from './IhkTransferTimeLab';
import { calculateTransferTime, IHK_SCENARIOS } from '../../utils/transferTimeEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');

describe('IhkTransferTimeLab', () => {
  it('zeigt die Dauer der Standardwerte (10 GB, 100 MBit/s, 10 % Overhead) passend zur Engine', () => {
    const { container } = render(<IhkTransferTimeLab />);
    const r = calculateTransferTime({ dataAmount: 10, dataUnit: 'GB', speedAmount: 100, speedUnit: 'MBPS', overheadPercent: 10 });
    const t = text(container);
    expect(t).toContain(r.formattedTime);
    expect(t).toContain(`≈ ${r.seconds.toFixed(2)} Sekunden`);
  });

  it('rechnet nach Änderung der Datenmenge neu', () => {
    const { container } = render(<IhkTransferTimeLab />);
    const [amount] = screen.getAllByRole('spinbutton');
    fireEvent.change(amount, { target: { value: '50' } });
    const r = calculateTransferTime({ dataAmount: 50, dataUnit: 'GB', speedAmount: 100, speedUnit: 'MBPS', overheadPercent: 10 });
    expect(text(container)).toContain(`≈ ${r.seconds.toFixed(2)} Sekunden`);
  });

  it('lädt ein IHK-Szenario in den Rechner', () => {
    const { container } = render(<IhkTransferTimeLab />);
    fireEvent.click(screen.getByRole('button', { name: /IHK-Prüfungsszenarien/ }));
    const sc = IHK_SCENARIOS[0];
    fireEvent.click(screen.getAllByRole('button', { name: /In Rechner laden/ })[0]);
    const r = calculateTransferTime({
      dataAmount: sc.dataAmount, dataUnit: sc.dataUnit, speedAmount: sc.speedAmount,
      speedUnit: sc.speedUnit, overheadPercent: sc.overheadPercent
    });
    expect(screen.getByRole('button', { name: /Rechner & Detail-Rechenweg/ })).toBeTruthy();
    expect(text(container)).toContain(`≈ ${r.seconds.toFixed(2)} Sekunden`);
  });

  it('Quiz: nach allen Antworten erscheint die Belohnung mit Punktzahl', () => {
    const { container } = render(<IhkTransferTimeLab />);
    fireEvent.click(screen.getByRole('button', { name: /IHK-Fallen Quiz/ }));
    expect(text(container)).not.toContain('Quiz gemeistert');
    const questions = screen.getAllByRole('heading', { level: 4 });
    questions.forEach((h) => {
      const card = h.closest('.card');
      fireEvent.click(within(card).getAllByRole('button')[0]);
    });
    expect(text(container)).toContain('Quiz gemeistert! +50 XP gutgeschrieben.');
    expect(text(container)).toContain(`/ ${questions.length}`);
  });
});
