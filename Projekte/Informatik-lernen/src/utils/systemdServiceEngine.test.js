import { describe, it, expect } from 'vitest';
import {
  generateSystemdUnitFile,
  transitionServiceState,
  DEFAULT_SERVICE_CONFIG
} from './systemdServiceEngine';

describe('systemdServiceEngine', () => {
  it('should generate valid systemd unit file with cgroups limits', () => {
    const file = generateSystemdUnitFile(DEFAULT_SERVICE_CONFIG);

    expect(file).toContain('[Unit]');
    expect(file).toContain('[Service]');
    expect(file).toContain('[Install]');
    expect(file).toContain('MemoryMax=256M');
    expect(file).toContain('CPUQuota=50%');
    expect(file).toContain('Restart=on-failure');
  });

  it('should start and stop a service correctly', () => {
    const startRes = transitionServiceState('inactive', 'start');
    expect(startRes.nextState).toBe('active');
    expect(startRes.logMessage).toContain('Started');

    const stopRes = transitionServiceState('active', 'stop');
    expect(stopRes.nextState).toBe('inactive');
    expect(stopRes.logMessage).toContain('Stopped');
  });

  it('should trigger automatic restart on crash when policy is on-failure', () => {
    const crashRes = transitionServiceState('active', 'crash', {
      ...DEFAULT_SERVICE_CONFIG,
      restart: 'on-failure',
      restartSec: 3
    });

    expect(crashRes.nextState).toBe('restarting');
    expect(crashRes.willAutoRestart).toBe(true);
    expect(crashRes.logMessage).toContain('Restarting in 3s');
  });

  it('should transition to failed state when restart policy is no', () => {
    const crashRes = transitionServiceState('active', 'crash', {
      ...DEFAULT_SERVICE_CONFIG,
      restart: 'no'
    });

    expect(crashRes.nextState).toBe('failed');
    expect(crashRes.willAutoRestart).toBe(false);
    expect(crashRes.logMessage).toContain('Failed');
  });

  it('should simulate OOM kill when memory exceeds cgroups MemoryMax', () => {
    const oomRes = transitionServiceState('active', 'simulate_oom', {
      ...DEFAULT_SERVICE_CONFIG,
      memoryMaxMb: 128,
      restart: 'no'
    }, 200); // 200MB > 128MB

    expect(oomRes.oomKilled).toBe(true);
    expect(oomRes.nextState).toBe('failed');
    expect(oomRes.logMessage).toContain('Out of memory: Killed process');
  });
});
