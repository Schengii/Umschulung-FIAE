// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import WisoDunningLab from './WisoDunningLab';
import { useStore } from '../../store/useStore';
import { calculateVerzugszinsen } from '../../utils/wisoDunningEngine';
import { BASISZINSSATZ_BEISPIEL_PERCENT } from '../../data/legalConstants';

let awardXP;
const originalAwardXP = useStore.getState().awardXP;
beforeEach(() => {
  awardXP = vi.fn();
  useStore.setState({ awardXP });
});
afterEach(() => {
  cleanup();
  useStore.setState({ awardXP: originalAwardXP });
});

const norm = (t) => t.replace(/\s+/g, ' ');

describe('WisoDunningLab', () => {
  it('zeigt standardmäßig B2B-Verzugszinsen mit Basiszins + 9 %', () => {
    const { container } = render(<WisoDunningLab />);
    const v = calculateVerzugszinsen({ rechnungsbetrag: 15000, verzugstage: 45, isB2B: true, basiszinssatzPercent: BASISZINSSATZ_BEISPIEL_PERCENT });
    expect(screen.getByText(/B2B Geschäftskunden: Basis \+ 9%/)).toBeTruthy();
    expect(norm(container.textContent)).toContain(`Verzugszins (${v.verzugszinsSatzPercent}% für 45 Tage)`);
  });

  it('wechselt auf B2C mit Basiszins + 5 %', () => {
    const { container } = render(<WisoDunningLab />);
    fireEvent.click(screen.getByRole('button', { name: /B2C/ }));
    const v = calculateVerzugszinsen({ rechnungsbetrag: 15000, verzugstage: 45, isB2B: false, basiszinssatzPercent: BASISZINSSATZ_BEISPIEL_PERCENT });
    expect(screen.getByText(/B2C Verbraucher: Basis \+ 5%/)).toBeTruthy();
    expect(norm(container.textContent)).toContain(`Verzugszins (${v.verzugszinsSatzPercent}% für 45 Tage)`);
  });

  it('kennzeichnet den Basiszins als Beispielwert', () => {
    render(<WisoDunningLab />);
    expect(screen.getByText(/ist ein Beispielwert/)).toBeTruthy();
  });
});
