import { describe, it, expect } from 'vitest';
import {
  validateDockerfile,
  simulateBuildCaching,
  validateComposePorts,
  DOCKER_DRILL_QUESTIONS
} from './dockerEngine';

describe('dockerEngine', () => {
  describe('validateDockerfile', () => {
    it('behandelt leeres Dockerfile korrekt', () => {
      const res = validateDockerfile('');
      expect(res.isValid).toBe(false);
      expect(res.score).toBe(0);
      expect(res.issues).toContain('Dockerfile ist leer.');
    });

    it('erkennt fehlende FROM- und CMD-Direktiven', () => {
      const res = validateDockerfile('WORKDIR /app\nRUN npm test');
      expect(res.isValid).toBe(false);
      expect(res.issues.some((i) => i.includes('FROM'))).toBe(true);
      expect(res.issues.some((i) => i.includes('CMD oder ENTRYPOINT'))).toBe(true);
    });

    it('warnt vor latest-Tag, unbereinigtem apt-Cache und Secrets in ENV', () => {
      const df = `
        FROM node:latest
        ENV DB_PASSWORD=geheim
        RUN apt-get install -y curl
        CMD node index.js
      `;
      const res = validateDockerfile(df);
      expect(res.isValid).toBe(false);
      expect(res.issues.some((i) => i.includes(':latest'))).toBe(true);
      expect(res.issues.some((i) => i.includes('Zugangsdaten'))).toBe(true);
      expect(res.issues.some((i) => i.includes('apt-get install'))).toBe(true);
      expect(res.issues.some((i) => i.includes('Exec-Form'))).toBe(true);
    });

    it('erkennt sauberes Multi-Stage Dockerfile als valide', () => {
      const validDf = `
        FROM node:18-alpine AS builder
        WORKDIR /app
        COPY package*.json ./
        RUN npm ci
        COPY . .
        RUN npm run build

        FROM nginx:1.25-alpine
        COPY --from=builder /app/dist /usr/share/nginx/html
        EXPOSE 80
        CMD ["nginx", "-g", "daemon off;"]
      `;
      const res = validateDockerfile(validDf);
      expect(res.isValid).toBe(true);
      expect(res.isMultiStage).toBe(true);
      expect(res.stageCount).toBe(2);
      expect(res.score).toBe(100);
      expect(res.layers.length).toBeGreaterThan(5);
    });
  });

  describe('simulateBuildCaching', () => {
    const layers = [
      { instruction: 'FROM', rest: 'node:18-alpine' },
      { instruction: 'WORKDIR', rest: '/app' },
      { instruction: 'COPY', rest: 'package*.json ./' },
      { instruction: 'RUN', rest: 'npm ci' },
      { instruction: 'COPY', rest: '. .' },
      { instruction: 'RUN', rest: 'npm run build' }
    ];

    it('cacht alle Schichten bei keinen Änderungen', () => {
      const cached = simulateBuildCaching(layers, 'none');
      expect(cached.every((l) => l.cached)).toBe(true);
    });

    it('invalidiert ab COPY . . wenn sich nur Quellcode ändert', () => {
      const cached = simulateBuildCaching(layers, 'source_code');
      expect(cached[0].cached).toBe(true); // FROM
      expect(cached[1].cached).toBe(true); // WORKDIR
      expect(cached[2].cached).toBe(true); // COPY package
      expect(cached[3].cached).toBe(true); // npm ci (bleibt gecacht!)
      expect(cached[4].cached).toBe(false); // COPY . . (invalidiert)
      expect(cached[5].cached).toBe(false); // RUN npm run build (Folgeschicht neu)
    });

    it('invalidiert ab package.json-Schicht, wenn sich package.json ändert', () => {
      const cached = simulateBuildCaching(layers, 'package_json');
      expect(cached[0].cached).toBe(true); // FROM
      expect(cached[1].cached).toBe(true); // WORKDIR
      expect(cached[2].cached).toBe(false); // COPY package.json (invalidiert)
      expect(cached[3].cached).toBe(false); // npm ci muss laufen
      expect(cached[4].cached).toBe(false);
      expect(cached[5].cached).toBe(false);
    });
  });

  describe('validateComposePorts', () => {
    it('erkennt saubere Port-Zuordnungen', () => {
      const res = validateComposePorts([
        { service: 'web', portHost: 80, portContainer: 80 },
        { service: 'api', portHost: 3000, portContainer: 3000 },
        { service: 'db', portHost: 5432, portContainer: 5432 }
      ]);
      expect(res.hasConflicts).toBe(false);
      expect(res.boundPortsCount).toBe(3);
    });

    it('erkennt Port-Kollisionen auf dem Host', () => {
      const res = validateComposePorts([
        { service: 'frontend-v1', portHost: 8080, portContainer: 80 },
        { service: 'frontend-v2', portHost: 8080, portContainer: 80 }
      ]);
      expect(res.hasConflicts).toBe(true);
      expect(res.conflicts.some((c) => c.includes('Port-Kollision'))).toBe(true);
    });

    it('erkennt ungültige Portnummern', () => {
      const res = validateComposePorts([
        { service: 'test', portHost: 70000, portContainer: 0 }
      ]);
      expect(res.hasConflicts).toBe(true);
      expect(res.conflicts.length).toBe(2);
    });
  });

  describe('DOCKER_DRILL_QUESTIONS', () => {
    it('enthält mindestens 4 strukturierte Prüfungsfragen', () => {
      expect(DOCKER_DRILL_QUESTIONS.length).toBeGreaterThanOrEqual(4);
      DOCKER_DRILL_QUESTIONS.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(typeof q.correct).toBe('number');
        expect(q.explanation).toBeDefined();
      });
    });
  });
});

