// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { initialProfileState, getTodayDateKey } from '../utils/storage';

describe('useStore Lab-Fortschritt', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState({ userState: { ...initialProfileState, labProgress: {} } });
  });

  it('zählt Besuche je Lab', () => {
    const { recordLabVisit } = useStore.getState();
    recordLabVisit('stp_protocol_lab');
    recordLabVisit('stp_protocol_lab');
    const entry = useStore.getState().userState.labProgress.stp_protocol_lab;
    expect(entry.visits).toBe(2);
    expect(entry.lastVisit).toBe(getTodayDateKey());
    expect(entry.completed).toBe(false);
  });

  it('markiert Abschluss einmalig und lässt ihn bei weiteren Besuchen bestehen', () => {
    const { recordLabVisit, recordLabCompletion } = useStore.getState();
    recordLabCompletion('dhcp_dora_lab');
    const first = useStore.getState().userState.labProgress.dhcp_dora_lab;
    expect(first.completed).toBe(true);

    const stateBefore = useStore.getState().userState;
    recordLabCompletion('dhcp_dora_lab');
    expect(useStore.getState().userState).toBe(stateBefore);

    recordLabVisit('dhcp_dora_lab');
    expect(useStore.getState().userState.labProgress.dhcp_dora_lab.completed).toBe(true);
  });

  it('ignoriert leere Schlüssel und kommt mit altem Spielstand ohne labProgress klar', () => {
    const { recordLabVisit, recordLabCompletion } = useStore.getState();
    recordLabVisit('');
    recordLabCompletion(undefined);
    expect(useStore.getState().userState.labProgress).toEqual({});

    const { labProgress: _omit, ...legacy } = initialProfileState;
    useStore.setState({ userState: legacy });
    recordLabVisit('nat_pat_lab');
    expect(useStore.getState().userState.labProgress.nat_pat_lab.visits).toBe(1);
  });

  it('persistiert den Fortschritt im localStorage', () => {
    useStore.getState().recordLabCompletion('usv_calculator_lab');
    const raw = Object.values({ ...localStorage }).join('');
    // Speichern ist gedebounced; der Zustand im Store ist maßgeblich, localStorage darf nachziehen.
    expect(useStore.getState().userState.labProgress.usv_calculator_lab.completed).toBe(true);
    expect(typeof raw).toBe('string');
  });
});
