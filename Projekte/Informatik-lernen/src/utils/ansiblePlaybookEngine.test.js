import { describe, it, expect } from 'vitest';
import { 
  executeAnsiblePlaybook, 
  validateAnsiblePlaybook,
  DEFAULT_ANSIBLE_INVENTORY, 
  DEFAULT_ANSIBLE_PLAYBOOK 
} from './ansiblePlaybookEngine';

describe('ansiblePlaybookEngine (Ansible & Idempotenz Simulator)', () => {
  it('demonstriert Idempotenz: 1. Lauf changed, 2. Lauf reines ok', () => {
    // 1. Lauf auf jungfräulichem System
    const freshSystemState = {
      web1: { installedPackages: [], files: {}, services: {} },
      web2: { installedPackages: [], files: {}, services: {} }
    };

    const firstRun = executeAnsiblePlaybook(DEFAULT_ANSIBLE_PLAYBOOK, DEFAULT_ANSIBLE_INVENTORY, freshSystemState);
    expect(firstRun.success).toBe(true);
    expect(firstRun.targetHostCount).toBe(2);

    const web1First = firstRun.hostResults.web1;
    expect(web1First.summary.changed).toBeGreaterThan(0);
    expect(web1First.handlerLogs.length).toBeGreaterThan(0); // Handler getriggert

    // 2. Lauf auf demselben System (Zielzustand bereits erreicht!)
    const secondRun = executeAnsiblePlaybook(DEFAULT_ANSIBLE_PLAYBOOK, DEFAULT_ANSIBLE_INVENTORY, firstRun.updatedSystemState);
    const web1Second = secondRun.hostResults.web1;
    expect(web1Second.summary.changed).toBe(0); // 100% IDEMPOTENT!
    expect(web1Second.summary.ok).toBe(4);
    expect(web1Second.handlerLogs.length).toBe(0); // Handler nicht erneut getriggert!
  });

  it('validiert Playbook-Syntax und fängt fehlende Pflichtfelder ab', () => {
    const validResult = validateAnsiblePlaybook(DEFAULT_ANSIBLE_PLAYBOOK);
    expect(validResult.isValid).toBe(true);

    const invalidPlaybook = {
      name: 'Defektes Playbook'
      // Fehlt: hosts, tasks
    };
    const invalidResult = validateAnsiblePlaybook(invalidPlaybook);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.issues.some(i => i.message.includes('hosts'))).toBe(true);
  });
});
