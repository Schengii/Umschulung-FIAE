// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CpmNetworkLab from './CpmNetworkLab';
import { calculateCpmNetwork, DEFAULT_CPM_PROJECT, IHK_CPM_TEMPLATES } from '../../utils/cpmEngine';

afterEach(cleanup);

const text = (c) => c.textContent.replace(/\s+/g, ' ');

describe('CpmNetworkLab', () => {
  it('zeigt Projektdauer, kritischen Pfad und Zyklenfreiheit passend zur Engine', () => {
    const { container } = render(<CpmNetworkLab />);
    const cpm = calculateCpmNetwork(DEFAULT_CPM_PROJECT);
    const t = text(container);
    expect(t).toContain(`${cpm.projectDuration} Tage / h`);
    expect(t).toContain(cpm.criticalPath.join(' ➔ '));
    expect(t).toContain('Zyklenfrei (DAG)');
  });

  it('lädt das FIAE-Szenario und rechnet neu', () => {
    const { container } = render(<CpmNetworkLab />);
    fireEvent.click(screen.getByRole('button', { name: /FIAE \(80h\)/ }));
    const cpm = calculateCpmNetwork(IHK_CPM_TEMPLATES.software_project.nodes);
    const t = text(container);
    expect(t).toContain(`${cpm.projectDuration} Tage / h`);
    expect(t).toContain(cpm.criticalPath.join(' ➔ '));
  });

  it('lädt das FISI-Szenario und wechselt mit „Standard“ zurück', () => {
    const { container } = render(<CpmNetworkLab />);
    fireEvent.click(screen.getByRole('button', { name: /FISI \(40h\)/ }));
    const fisi = calculateCpmNetwork(IHK_CPM_TEMPLATES.datacenter_migration.nodes);
    expect(text(container)).toContain(`${fisi.projectDuration} Tage / h`);
    fireEvent.click(screen.getByRole('button', { name: /Standard/ }));
    const std = calculateCpmNetwork(DEFAULT_CPM_PROJECT);
    expect(text(container)).toContain(`${std.projectDuration} Tage / h`);
  });

  it('vergibt XP über onRewardXP genau einmal', () => {
    const onRewardXP = vi.fn();
    render(<CpmNetworkLab onRewardXP={onRewardXP} />);
    const btn = screen.getAllByRole('button').find((b) => /XP/.test(b.textContent));
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onRewardXP).toHaveBeenCalledTimes(1);
    expect(onRewardXP).toHaveBeenCalledWith(50);
  });
});
