import { describe, it, expect } from 'vitest';
import {
  validatePipelineYaml,
  simulatePipelineRun,
  calculateCloudCost,
  CLOUD_DEVOPS_DRILL_QUESTIONS
} from './cloudDevOpsEngine';

describe('cloudDevOpsEngine', () => {
  describe('validatePipelineYaml', () => {
    it('validiert vollständige GitHub Actions Pipeline', () => {
      const validYaml = `
        name: CI
        on:
          push:
            branches: [main]
        jobs:
          test:
            runs-on: ubuntu-latest
            steps:
              - run: npm ci
      `;
      const res = validatePipelineYaml(validYaml);
      expect(res.isValid).toBe(true);
      expect(res.hardErrors.length).toBe(0);
    });

    it('erkennt fehlende Trigger und Klartext-Secrets', () => {
      const invalidYaml = `
        jobs:
          deploy:
            steps:
              - run: npm install
                env:
                  password: "mySecretPassword123!"
      `;
      const res = validatePipelineYaml(invalidYaml);
      expect(res.isValid).toBe(false);
      expect(res.issues.some((i) => i.includes("Trigger fehlt"))).toBe(true);
      expect(res.issues.some((i) => i.includes("Klartext-Passwort"))).toBe(true);
      expect(res.issues.some((i) => i.includes("npm ci"))).toBe(true);
    });
  });

  describe('simulatePipelineRun', () => {
    const stages = [
      { id: 'lint', name: 'Linting', durationSec: 5 },
      { id: 'test', name: 'Unit Tests', durationSec: 15 },
      { id: 'build', name: 'Docker Build', durationSec: 30 },
      { id: 'deploy', name: 'Production Deploy', durationSec: 20 }
    ];

    it('durchläuft alle Stufen erfolgreich bei fehlerfreiem Lauf', () => {
      const run = simulatePipelineRun(stages, null);
      expect(run.every((s) => s.status === 'success')).toBe(true);
      expect(run[0].actualDuration).toBe(5);
    });

    it('bricht Folgestufen ab, wenn eine Stufe fehlschlägt', () => {
      const run = simulatePipelineRun(stages, 'test');
      expect(run[0].status).toBe('success');
      expect(run[1].status).toBe('failed');
      expect(run[2].status).toBe('skipped');
      expect(run[3].status).toBe('skipped');
    });
  });

  describe('calculateCloudCost', () => {
    it('berechnet monatliche Compute-, Storage- und Bandbreitenkosten', () => {
      const res = calculateCloudCost({
        instances: 2,
        vCpuPerInstance: 2,
        ramGbPerInstance: 4,
        storageGb: 100,
        egressGb: 200
      });

      // 2 * (2*7.5 + 4*2) = 2 * (15 + 8) = 46 € Compute
      // 100 * 0.08 = 8 € Storage
      // (200 - 100) * 0.05 = 5 € Network
      // Gesamt: 59 €
      expect(res.computeCost).toBe(46);
      expect(res.storageCost).toBe(8);
      expect(res.networkCost).toBe(5);
      expect(res.totalMonthlyCost).toBe(59);
    });
  });

  describe('CLOUD_DEVOPS_DRILL_QUESTIONS', () => {
    it('liefert 4 fundierte Fragen', () => {
      expect(CLOUD_DEVOPS_DRILL_QUESTIONS.length).toBe(4);
      CLOUD_DEVOPS_DRILL_QUESTIONS.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(typeof q.correct).toBe('number');
        expect(q.explanation).toBeDefined();
      });
    });
  });
});

