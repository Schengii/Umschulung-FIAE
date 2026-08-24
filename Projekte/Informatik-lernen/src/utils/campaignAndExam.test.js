import { describe, it, expect } from 'vitest';
import { ORAL_EXAM_DATA } from '../data/oralExamData';
import { CAMPAIGN_CHAPTERS } from '../data/campaignData';

describe('Oral Exam & Campaign Data Integrity', () => {
  it('contains valid oral exam data for FIAE and FISI', () => {
    expect(ORAL_EXAM_DATA.ae).toBeDefined();
    expect(ORAL_EXAM_DATA.fisi).toBeDefined();
    expect(ORAL_EXAM_DATA.ae.questions.length).toBeGreaterThan(0);
    expect(ORAL_EXAM_DATA.fisi.questions.length).toBeGreaterThan(0);

    // Each question must have at least one correct answer
    ORAL_EXAM_DATA.ae.questions.forEach(q => {
      const correct = q.options.filter(o => o.isCorrect);
      expect(correct.length).toBe(1);
    });
  });

  it('contains 5 progressive campaign chapters with quests', () => {
    expect(CAMPAIGN_CHAPTERS.length).toBe(5);
    CAMPAIGN_CHAPTERS.forEach((ch, idx) => {
      expect(ch.id).toBe(`ch${idx + 1}`);
      expect(ch.quests.length).toBeGreaterThan(0);
      ch.quests.forEach(q => {
        expect(q.actionTab).toBeDefined();
        expect(q.xp).toBeGreaterThan(0);
      });
    });
  });
});
