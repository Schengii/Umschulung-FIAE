import { describe, it, expect } from 'vitest';
import {
  calculateSprintMetrics,
  moveStoryStatus,
  INITIAL_USER_STORIES
} from './scrumEngine';

describe('scrumEngine', () => {
  it('berechnet Sprint Metriken und Burndown-Punkte korrekt', () => {
    const metrics = calculateSprintMetrics(INITIAL_USER_STORIES, 10);

    expect(metrics.totalPoints).toBe(23);
    expect(metrics.completedPoints).toBe(2); // US-104 ist 'done' mit 2 SP
    expect(metrics.remainingPoints).toBe(21);
    expect(metrics.burndownData.length).toBe(11); // Tag 0 bis Tag 10
    expect(metrics.burndownData[0].idealRemaining).toBe(23);
    expect(metrics.burndownData[10].idealRemaining).toBe(0);
  });

  it('verschiebt Stories in neue Kanban Spalten', () => {
    const updated = moveStoryStatus(INITIAL_USER_STORIES, 'US-101', 'done');
    const target = updated.find(s => s.id === 'US-101');
    expect(target.status).toBe('done');

    const metricsAfter = calculateSprintMetrics(updated, 10);
    expect(metricsAfter.completedPoints).toBe(7); // 2 + 5 = 7 SP
  });
});
