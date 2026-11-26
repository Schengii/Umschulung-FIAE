import { describe, it, expect } from 'vitest';
import { LAB_MODULES } from './labModulesData';
import { LAB_EXAM_DOMAINS } from './labExamDomains';
import { domainOfLab, DOMAIN_LABELS } from '../utils/learningPathEngine';

// Lern- und Prüfungswerkzeuge ohne Prüfungsbereich: bewusst ohne Schwächen-Signal im Lernpfad.
const TOOLS_WITHOUT_DOMAIN = [
  'exam_readiness_lab', 'ihk_weakness_audit_lab', 'ihk_study_plan_lab', 'ihk_certificate_pdf_lab',
  'oral_defense_studio', 'presentation_timer_lab', 'oral_exam', 'voice_quiz', 'p2p_duell',
  'cheat_sheets', 'sm2_spaced_repetition', 'leitner', 'podcast', 'lernfelder', 'quiz_arena'
];

describe('LAB_EXAM_DOMAINS', () => {
  it('verweist nur auf existierende Labs und gültige Bereiche', () => {
    const ids = new Set(LAB_MODULES.map((m) => m.id));
    for (const [id, domain] of Object.entries(LAB_EXAM_DOMAINS)) {
      expect(ids.has(id), `${id} fehlt in LAB_MODULES`).toBe(true);
      expect(domain in DOMAIN_LABELS, `${id}: ungültiger Bereich ${domain}`).toBe(true);
    }
  });

  it('wird in LAB_MODULES als examDomain übernommen', () => {
    expect(LAB_MODULES.find((m) => m.id === 'cpm_network').examDomain).toBe('ap2_1');
  });

  it('lässt nur die bekannten Lernwerkzeuge ohne Prüfungsbereich (neue Labs brauchen Kategorie/Tags oder einen Eintrag)', () => {
    const without = LAB_MODULES.filter((m) => !domainOfLab(m)).map((m) => m.id).sort();
    expect(without).toEqual([...TOOLS_WITHOUT_DOMAIN].sort());
  });
});
