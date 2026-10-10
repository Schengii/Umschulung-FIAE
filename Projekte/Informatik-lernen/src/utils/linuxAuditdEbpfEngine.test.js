import { describe, it, expect } from 'vitest';
import {
  matchEventToRules,
  filterSecurityEvents,
  STANDARD_AUDITD_RULES,
  SAMPLE_SYSCALL_LOGS
} from './linuxAuditdEbpfEngine';

describe('linuxAuditdEbpfEngine', () => {
  it('correctly matches file watch rule for /etc/shadow tampering', () => {
    const shadowEvent = SAMPLE_SYSCALL_LOGS.find(e => e.target === '/etc/shadow');
    expect(shadowEvent).toBeDefined();

    const matched = matchEventToRules(shadowEvent, STANDARD_AUDITD_RULES);
    expect(matched.some(r => r.key === 'identity_tampering')).toBe(true);
  });

  it('matches webserver shell spawn rule on execve by www-data', () => {
    const rceEvent = SAMPLE_SYSCALL_LOGS.find(e => e.id === 101);
    expect(rceEvent).toBeDefined();

    const matched = matchEventToRules(rceEvent, STANDARD_AUDITD_RULES);
    expect(matched.some(r => r.key === 'webserver_shell_spawn')).toBe(true);
  });

  it('filters events by severity correctly', () => {
    const criticalEvents = filterSecurityEvents(SAMPLE_SYSCALL_LOGS, 'CRITICAL');
    expect(criticalEvents.length).toBe(2);
    expect(criticalEvents.every(e => e.severity === 'CRITICAL')).toBe(true);

    const allEvents = filterSecurityEvents(SAMPLE_SYSCALL_LOGS, 'ALL');
    expect(allEvents.length).toBe(SAMPLE_SYSCALL_LOGS.length);
  });
});
