import { describe, it, expect } from 'vitest';
import {
  parseSimpleK8sYaml,
  validateK8sManifest,
  simulateReconciliation,
  matchServiceEndpoints,
  K8S_DRILL_QUESTIONS
} from './kubernetesEngine';

describe('kubernetesEngine', () => {
  describe('parseSimpleK8sYaml', () => {
    it('parst grundlegende K8s Manifesteigenschaften', () => {
      const yaml = `
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: web-app
        spec:
          replicas: 4
      `;
      const res = parseSimpleK8sYaml(yaml);
      expect(res.apiVersion).toBe('apps/v1');
      expect(res.kind).toBe('Deployment');
      expect(res.name).toBe('web-app');
      expect(res.replicas).toBe(4);
    });
  });

  describe('validateK8sManifest', () => {
    it('erkennt unvollständige Manifeste', () => {
      const res = validateK8sManifest('kind: Deployment');
      expect(res.isValid).toBe(false);
      expect(res.issues.some((i) => i.includes('apiVersion'))).toBe(true);
      expect(res.issues.some((i) => i.includes('name'))).toBe(true);
    });

    it('validiert Deployment mit matchLabels und warnt vor fehlenden Limits', () => {
      const yaml = `
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: api
        spec:
          replicas: 3
          selector:
            matchLabels:
              app: api
      `;
      const res = validateK8sManifest(yaml);
      expect(res.isValid).toBe(true);
      expect(res.issues.some((i) => i.includes('Best Practice'))).toBe(true);
      expect(res.score).toBeLessThanOrEqual(100);
    });

    it('validiert Service-Typen und Port-Vorgaben', () => {
      const validSvc = `
        apiVersion: v1
        kind: Service
        metadata:
          name: api-svc
        spec:
          type: LoadBalancer
          ports:
            - port: 80
      `;
      const res = validateK8sManifest(validSvc);
      expect(res.isValid).toBe(true);
      expect(res.kind).toBe('Service');

      const invalidSvc = `
        apiVersion: v1
        kind: Service
        metadata:
          name: invalid-svc
        spec:
          type: CustomProxy
      `;
      const invalidRes = validateK8sManifest(invalidSvc);
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.issues.some((i) => i.includes('Ungültiger Service-Typ'))).toBe(true);
      expect(invalidRes.issues.some((i) => i.includes('spec.ports.port'))).toBe(true);
    });
  });

  describe('simulateReconciliation', () => {
    it('skaliert Pods hoch, wenn Soll > Ist', () => {
      const current = [
        { id: 'p1', name: 'app-p1', status: 'Running', node: 'node-1' }
      ];
      const res = simulateReconciliation(3, current);
      expect(res.inSync).toBe(true);
      expect(res.currentCount).toBe(3);
      expect(res.pods.length).toBe(3);
    });

    it('skaliert Pods herunter, wenn Soll < Ist', () => {
      const current = [
        { id: 'p1', name: 'app-p1', status: 'Running', node: 'node-1' },
        { id: 'p2', name: 'app-p2', status: 'Running', node: 'node-2' },
        { id: 'p3', name: 'app-p3', status: 'Running', node: 'node-3' }
      ];
      const res = simulateReconciliation(1, current);
      expect(res.inSync).toBe(true);
      expect(res.currentCount).toBe(1);
    });

    it('bleibt unverändert, wenn Soll == Ist', () => {
      const current = [
        { id: 'p1', name: 'app-p1', status: 'Running', node: 'node-1' }
      ];
      const res = simulateReconciliation(1, current);
      expect(res.inSync).toBe(true);
      expect(res.pods.length).toBe(1);
    });
  });

  describe('matchServiceEndpoints', () => {
    it('matcht Pods mit passendem Label als aktive Endpoints', () => {
      const pods = [
        { id: 'p1', appLabel: 'frontend', ip: '10.244.1.5', status: 'Running' },
        { id: 'p2', appLabel: 'backend', ip: '10.244.2.8', status: 'Running' },
        { id: 'p3', appLabel: 'frontend', ip: '10.244.3.2', status: 'Running' }
      ];
      const endpoints = matchServiceEndpoints('frontend', pods);
      expect(endpoints.isAvailable).toBe(true);
      expect(endpoints.endpoints.length).toBe(2);
      expect(endpoints.endpoints.map((e) => e.ip)).toContain('10.244.1.5');
      expect(endpoints.endpoints.map((e) => e.ip)).toContain('10.244.3.2');
    });

    it('meldet nicht verfügbar, wenn keine Pods matchen', () => {
      const pods = [
        { id: 'p1', appLabel: 'backend', ip: '10.244.1.5', status: 'Running' }
      ];
      const endpoints = matchServiceEndpoints('frontend', pods);
      expect(endpoints.isAvailable).toBe(false);
      expect(endpoints.endpoints.length).toBe(0);
    });
  });

  describe('K8S_DRILL_QUESTIONS', () => {
    it('liefert 4 fundierte IHK-Prüfungsfragen', () => {
      expect(K8S_DRILL_QUESTIONS.length).toBe(4);
      K8S_DRILL_QUESTIONS.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(typeof q.correct).toBe('number');
        expect(q.explanation).toBeDefined();
      });
    });
  });
});

