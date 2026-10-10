// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import LabsDashboard from './LabsDashboard';
import { LAB_MODULES } from '../../data/labModulesData';
import { useStore } from '../../store/useStore';
import { initialProfileState } from '../../utils/storage';

afterEach(() => cleanup());

beforeEach(() => {
  localStorage.clear();
  useStore.setState({ userState: { ...initialProfileState, labProgress: {} } });
});

describe('LabsDashboard Lernfortschritt', () => {
  it('zeigt 0 Abschlüsse und eine Fortschrittsanzeige ohne Fortschritt', () => {
    render(<LabsDashboard onSelectLab={() => {}} />);
    const bar = screen.getByRole('progressbar', { name: /abgeschlossene labs/i });
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(screen.getByText(new RegExp(`0 von ${LAB_MODULES.length} Labs abgeschlossen`))).toBeTruthy();
  });

  it('empfiehlt 3 nächste Schritte und öffnet das Lab per Klick', () => {
    const onSelectLab = vi.fn();
    render(<LabsDashboard onSelectLab={onSelectLab} />);
    const section = screen.getByRole('region', { name: /lernfortschritt/i });
    const buttons = within(section).getAllByRole('button');
    expect(buttons).toHaveLength(3);
    fireEvent.click(buttons[0]);
    expect(onSelectLab).toHaveBeenCalledTimes(1);
    expect(LAB_MODULES.map((m) => m.id)).toContain(onSelectLab.mock.calls[0][0]);
  });

  it('markiert abgeschlossene Labs und zählt sie im Fortschritt', () => {
    useStore.setState({
      userState: {
        ...initialProfileState,
        labProgress: { stp_protocol_lab: { visits: 1, lastVisit: '2026-10-07', completed: true, completedOn: '2026-10-07' } }
      }
    });
    render(<LabsDashboard onSelectLab={() => {}} />);
    expect(screen.getAllByText('Abgeschlossen').length).toBe(1);
    expect(screen.getByText(new RegExp(`1 von ${LAB_MODULES.length} Labs abgeschlossen`))).toBeTruthy();
  });

  it('zeigt den Abschluss an der passenden Lab-Karte (Registry-Schlüssel)', () => {
    useStore.setState({
      userState: {
        ...initialProfileState,
        labProgress: { stp_protocol_lab: { visits: 1, lastVisit: '2026-10-07', completed: true } }
      }
    });
    render(<LabsDashboard onSelectLab={() => {}} />);
    const card = screen.getByText(/Spanning Tree Protocol \(STP & RSTP\) Studio/).closest('h3').parentElement;
    expect(within(card).getByText('Abgeschlossen')).toBeTruthy();
  });
});
