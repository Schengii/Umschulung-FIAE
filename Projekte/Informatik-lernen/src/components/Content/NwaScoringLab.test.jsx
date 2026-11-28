// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NwaScoringLab from './NwaScoringLab';
import { calculateNwa, DEFAULT_NWA_CRITERIA, DEFAULT_NWA_OPTIONS } from '../../utils/nwaEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');

describe('NwaScoringLab', () => {
  it('zeigt den Sieger und seinen Nutzwert passend zur Engine', () => {
    const { container } = render(<NwaScoringLab />);
    const { bestOption } = calculateNwa({ criteria: DEFAULT_NWA_CRITERIA, options: DEFAULT_NWA_OPTIONS });
    const t = text(container);
    expect(t).toContain(bestOption.name);
    expect(t).toContain(`Nutzwert: ${bestOption.finalScore} / 10 Punkte`);
  });

  it('zeigt für jede Option die Punktzahl oder das K.O.-Ausscheiden wie die Engine', () => {
    const { container } = render(<NwaScoringLab />);
    const { results } = calculateNwa({ criteria: DEFAULT_NWA_CRITERIA, options: DEFAULT_NWA_OPTIONS });
    const t = text(container);
    results.filter((r) => !r.isDisqualified).forEach((r) => {
      expect(t).toContain(`Score: ${r.finalScore} Pkt. (${r.utilityPercent}%)`);
    });
    const koCount = results.filter((r) => r.isDisqualified).length;
    expect(screen.queryAllByText(/K\.O\. Ausgeschieden/)).toHaveLength(koCount);
  });

  it('rechnet nach Änderung einer Gewichtung neu', () => {
    const { container } = render(<NwaScoringLab />);
    const [firstWeight] = screen.getAllByRole('spinbutton');
    fireEvent.change(firstWeight, { target: { value: '60' } });
    const criteria = DEFAULT_NWA_CRITERIA.map((c, i) => (i === 0 ? { ...c, weight: 60 } : c));
    const { bestOption } = calculateNwa({ criteria, options: DEFAULT_NWA_OPTIONS });
    expect(text(container)).toContain(`Nutzwert: ${bestOption.finalScore} / 10 Punkte`);
  });

  it('exportiert den Bericht und vergibt XP genau einmal', () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const onRewardXP = vi.fn();
    render(<NwaScoringLab onRewardXP={onRewardXP} />);
    fireEvent.click(screen.getByRole('button', { name: /IHK Bericht exportieren/ }));
    fireEvent.click(screen.getByRole('button', { name: /Bericht kopiert|IHK Bericht exportieren/ }));
    expect(writeText).toHaveBeenCalled();
    expect(writeText.mock.calls[0][0]).toContain('Nutzwert');
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP).toHaveBeenCalledWith(50);
  });
});
