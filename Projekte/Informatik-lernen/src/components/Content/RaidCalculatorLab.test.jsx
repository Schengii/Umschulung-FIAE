// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import RaidCalculatorLab from './RaidCalculatorLab';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');

describe('RaidCalculatorLab', () => {
  it('startet mit RAID 5 (4 × 4 TB): 12 TB nutzbar, 75 % Effizienz, 1 Ausfall, Write Penalty 4', () => {
    const { container } = render(<RaidCalculatorLab />);
    const t = text(container);
    expect(t).toContain('12 TB');
    expect(t).toContain('Effizienz: 75%');
    expect(t).toContain('1 Platten');
    expect(t).toContain('Write Penalty: 4x IOPS');
  });

  it('wechselt auf RAID 6: 2 tolerierte Ausfälle, Write Penalty 6', () => {
    const { container } = render(<RaidCalculatorLab />);
    fireEvent.click(screen.getByRole('button', { name: 'RAID 6' }));
    const t = text(container);
    expect(t).toContain('2 Platten');
    expect(t).toContain('Write Penalty: 6x IOPS');
  });

  it('erhöht die Plattenzahl auf das Minimum des gewählten Levels', () => {
    const { container } = render(<RaidCalculatorLab />);
    fireEvent.click(screen.getByRole('button', { name: 'RAID 50' }));
    const [disks] = screen.getAllByRole('slider');
    expect(Number(disks.value)).toBeGreaterThanOrEqual(Number(disks.min));
    expect(Number(disks.min)).toBeGreaterThanOrEqual(6);
    expect(text(container)).toContain(`${disks.value} Platten`);
  });

  it('rechnet bei größerer Plattenkapazität neu', () => {
    const { container } = render(<RaidCalculatorLab />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[1], { target: { value: '8' } });
    expect(text(container)).toContain('24 TB'); // (4-1) × 8 TB
  });

  it('vergibt XP über onRewardXP genau einmal', () => {
    const onRewardXP = vi.fn();
    render(<RaidCalculatorLab onRewardXP={onRewardXP} />);
    const btn = screen.getByRole('button', { name: /Storage Meister/ });
    fireEvent.click(btn);
    fireEvent.click(screen.getByRole('button', { name: /XP eingesammelt/ }));
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP).toHaveBeenCalledWith(45);
  });
});
