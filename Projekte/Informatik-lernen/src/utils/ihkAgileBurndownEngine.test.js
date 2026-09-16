import { describe, it, expect } from 'vitest';
import { 
  calculateSprintBurndown, 
  analyzeKanbanWipLimits, 
  generateIhkMethodologyJustification,
  DEFAULT_SPRINT_CONFIG 
} from './ihkAgileBurndownEngine';

describe('ihkAgileBurndownEngine', () => {
  it('calculates ideal linear and actual burndown curve properly', () => {
    const result = calculateSprintBurndown(DEFAULT_SPRINT_CONFIG);
    expect(result.initialStoryPoints).toBe(50);
    expect(result.totalDays).toBe(10);
    expect(result.dataPoints.length).toBe(11); // Day 0 to 10
    expect(result.dataPoints[0].ideal).toBe(50);
    expect(result.dataPoints[10].ideal).toBe(0);
    expect(result.totalScopeAdded).toBe(5);
    expect(result.velocityPerDay).toBeGreaterThan(0);
  });

  it('detects incomplete burndown when points remain at sprint end', () => {
    const config = {
      totalDays: 5,
      initialStoryPoints: 30,
      dailyCompletedPoints: [2, 2, 2, 2, 2], // 10 points completed of 30
      scopeAdditions: []
    };
    const result = calculateSprintBurndown(config);
    expect(result.finalRemainingPoints).toBe(20);
    expect(result.isGoalAchieved).toBe(false);
    expect(result.daysNeededAtCurrentVelocity).toBe(10);
  });

  it('analyzes kanban columns and identifies WIP bottlenecks correctly', () => {
    const columns = [
      { id: 'dev', name: 'In Development', cardsCount: 3, wipLimit: 4 },
      { id: 'review', name: 'Code Review', cardsCount: 5, wipLimit: 2 },
      { id: 'done', name: 'Done', cardsCount: 12, wipLimit: 0 }
    ];
    const analysis = analyzeKanbanWipLimits(columns);
    expect(analysis.hasBottlenecks).toBe(true);
    expect(analysis.bottleneckCount).toBe(1);
    expect(analysis.columns[1].status).toBe('BOTTLENECK');
    expect(analysis.columns[0].status).toBe('HEALTHY');
  });

  it('generates compliant IHK hybrid project management documentation text', () => {
    const markdown = generateIhkMethodologyJustification('hybrid', {
      role: 'FIAE',
      totalHours: 80,
      projectName: 'Microservice Telemetrie Pipeline'
    });
    expect(markdown).toContain('Hybrides Projektmanagement');
    expect(markdown).toContain('Microservice Telemetrie Pipeline');
    expect(markdown).toContain('80h Gesamtdauer');
    expect(markdown).toContain('Sprint Burndown Chart');
    expect(markdown).toContain('Klassische Rahmenphasen');
  });
});
