import { describe, it, expect } from 'vitest';
import {
  DEFAULT_COMPOSE_PROJECT,
  resolveDependencyOrder,
  checkNetworkReachability,
  generateComposeYaml,
  simulateComposeUp
} from './dockerComposeEngine';

describe('dockerComposeEngine (Multi-Container Orchestration & Dependency Graph)', () => {
  it('löst depends_on Abhängigkeiten deterministisch als DAG auf', () => {
    const res = resolveDependencyOrder(DEFAULT_COMPOSE_PROJECT.services);
    expect(res.hasCycle).toBe(false);
    expect(res.error).toBeNull();

    // postgres und redis müssen VOR api starten
    const posPg = res.launchOrder.indexOf('postgres');
    const posRedis = res.launchOrder.indexOf('redis');
    const posApi = res.launchOrder.indexOf('api');
    const posWeb = res.launchOrder.indexOf('web');

    expect(posPg).toBeLessThan(posApi);
    expect(posRedis).toBeLessThan(posApi);
    expect(posApi).toBeLessThan(posWeb);
  });

  it('erkennt zyklische Abhängigkeiten in depends_on zuverlässig', () => {
    const cyclicServices = [
      { id: 'svc_a', depends_on: ['svc_b'] },
      { id: 'svc_b', depends_on: ['svc_a'] }
    ];
    const res = resolveDependencyOrder(cyclicServices);
    expect(res.hasCycle).toBe(true);
    expect(res.error).toContain('Zyklische Abhängigkeit');
  });

  it('überprüft Netzwerk-Isolation (Bridge Reachability) zwischen Containern', () => {
    const services = DEFAULT_COMPOSE_PROJECT.services;

    // web und api teilen sich frontend_net -> erreichbar!
    const reachWebToApi = checkNetworkReachability('web', 'api', services);
    expect(reachWebToApi.canReach).toBe(true);
    expect(reachWebToApi.sharedNetworks).toContain('frontend_net');

    // web und postgres teilen sich KEIN Netzwerk -> isoliert!
    const reachWebToDb = checkNetworkReachability('web', 'postgres', services);
    expect(reachWebToDb.canReach).toBe(false);
    expect(reachWebToDb.sharedNetworks.length).toBe(0);
  });

  it('generiert valides Docker Compose YAML v3.8 und simuliert compose up', () => {
    const yaml = generateComposeYaml(DEFAULT_COMPOSE_PROJECT);
    expect(yaml).toContain("version: '3.8'");
    expect(yaml).toContain('postgres:16-alpine');
    expect(yaml).toContain('frontend_net');

    const upResult = simulateComposeUp(DEFAULT_COMPOSE_PROJECT);
    expect(upResult.success).toBe(true);
    expect(upResult.launchOrder.length).toBe(4);
    expect(upResult.servicesStatus['postgres']).toBe('running');
    expect(upResult.servicesStatus['web']).toBe('running');
  });
});
