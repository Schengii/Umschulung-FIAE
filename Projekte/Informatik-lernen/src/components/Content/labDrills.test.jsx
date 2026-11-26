// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import DockerLab from './DockerLab';
import KubernetesLab from './KubernetesLab';
import OauthOidcLab from './OauthOidcLab';
import CloudDevOpsLab from './CloudDevOpsLab';
import WebSocketsLab from './WebSocketsLab';
import UmlDiagramLab from './UmlDiagramLab';
import WisoBabLab from './WisoBabLab';
import { useStore } from '../../store/useStore';
import { DRILL_QUESTIONS, DRILL_LAB_BY_QUESTION_ID } from '../../data/drillQuestions';

afterEach(() => cleanup());
beforeEach(() => useStore.setState((s) => ({ userState: { ...s.userState, mistakeJournal: {} } })));

const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// IhkDrillPanel zeigt "1. Frage" und "A) Antwort"
const questionBlock = (q) => screen.getByText(new RegExp(esc(q.question))).parentElement;
const optionButton = (q, i) => within(questionBlock(q)).getByText(new RegExp(`^${String.fromCharCode(65 + i)}\\) ${esc(q.options[i])}$`));

const journalIds = () => Object.keys(useStore.getState().userState.mistakeJournal);

// Regression: Diese Labs reichten ihre Drill-Fragen im englischen Feldformat an das Panel weiter,
// das beim Aufklappen mit "Cannot read properties of undefined (reading 'map')" abstürzte.
describe.each([
  ['Docker', DockerLab, 'docker'],
  ['Kubernetes', KubernetesLab, 'kubernetes'],
  ['OAuth/OIDC', OauthOidcLab, 'oauth_oidc'],
  ['Cloud/DevOps', CloudDevOpsLab, 'cloud_devops'],
  ['WebSockets', WebSocketsLab, 'websockets']
])('IHK-Drill im Lab %s', (_name, Lab, labId) => {
  it('lässt sich aufklappen, beantworten und schreibt falsche Antworten ins Fehlerjournal', () => {
    const awarded = [];
    const { container } = render(<Lab onRewardXP={(xp) => awarded.push(xp)} />);
    fireEvent.click(screen.getAllByRole('button').find((b) => /IHK-Drill/.test(b.textContent)));

    const details = container.querySelector('details');
    details.open = true;
    fireEvent(details, new Event('toggle'));

    const questions = DRILL_QUESTIONS.filter((q) => DRILL_LAB_BY_QUESTION_ID[q.id] === labId);
    expect(questions.length).toBeGreaterThanOrEqual(4);
    for (const q of questions) expect(questionBlock(q)).toBeTruthy();

    // Immer die jeweils falsche Antwort wählen
    for (const q of questions) {
      const wrongIndex = q.correct === 0 ? 1 : 0;
      fireEvent.click(optionButton(q, wrongIndex));
    }
    fireEvent.click(screen.getByRole('button', { name: /Antworten prüfen/ }));

    expect(journalIds().sort()).toEqual(questions.map((q) => q.id).sort());
    expect(awarded).toEqual([]);
  });
});

describe('Journal-Anbindung der Labs mit eigener Drill-Oberfläche', () => {
  it('UML: eine falsche Antwort landet im Fehlerjournal', () => {
    render(<UmlDiagramLab />);
    fireEvent.click(screen.getAllByRole('button').find((b) => /Klassendiagramm/.test(b.textContent)));
    const q = DRILL_QUESTIONS.find((x) => DRILL_LAB_BY_QUESTION_ID[x.id] === 'uml_diagram');
    const wrong = q.options[q.correct === 0 ? 1 : 0];
    fireEvent.click(screen.getAllByText(wrong)[0]);
    expect(journalIds()).toContain(q.id);
  });

  it('BAB: das Auswerten schreibt alle falschen Antworten ins Fehlerjournal', () => {
    render(<WisoBabLab onXPGain={() => {}} />);
    fireEvent.click(screen.getAllByRole('button').find((b) => /Drill/.test(b.textContent)));
    const questions = DRILL_QUESTIONS.filter((q) => DRILL_LAB_BY_QUESTION_ID[q.id] === 'wiso_bab_lab');
    for (const q of questions) fireEvent.click(screen.getByText(q.options[q.correct === 0 ? 1 : 0]));
    fireEvent.click(screen.getByRole('button', { name: /prüfen|auswerten|Ergebnis/i }));
    expect(journalIds().sort()).toEqual(questions.map((q) => q.id).sort());
  });
});
