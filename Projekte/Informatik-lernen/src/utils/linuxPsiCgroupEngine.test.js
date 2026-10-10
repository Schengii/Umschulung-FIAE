import { describe, it, expect } from 'vitest';
import { calculatePsiAndCgroupStatus } from './linuxPsiCgroupEngine';

describe('linuxPsiCgroupEngine', () => {
  it('reports healthy status under low load', () => {
    const res = calculatePsiAndCgroupStatus(
      { cpuMaxQuotaPercent: 100, memoryMaxMb: 512, memoryHighMb: 400, ioWeight: 100 },
      { cpuUsagePercent: 30, memoryUsageMb: 200, ioReadBytesSec: 1000, ioWriteBytesSec: 1000 }
    );

    expect(res.status).toBe('HEALTHY');
    expect(res.isThrottled).toBe(false);
    expect(res.oomKilled).toBe(false);
    expect(res.warnings.length).toBe(0);
  });

  it('detects cpu throttling when usage exceeds quota', () => {
    const res = calculatePsiAndCgroupStatus(
      { cpuMaxQuotaPercent: 50, memoryMaxMb: 512, memoryHighMb: 400, ioWeight: 100 },
      { cpuUsagePercent: 80, memoryUsageMb: 200, ioReadBytesSec: 1000, ioWriteBytesSec: 1000 }
    );

    expect(res.isThrottled).toBe(true);
    expect(res.psi.cpu.some.avg10).toBeGreaterThan(0);
    expect(res.warnings[0]).toContain('CFS-Bandbreite wird gedrosselt');
  });

  it('triggers OOM-Killer when memory reaches memory.max', () => {
    const res = calculatePsiAndCgroupStatus(
      { cpuMaxQuotaPercent: 100, memoryMaxMb: 512, memoryHighMb: 400, ioWeight: 100 },
      { cpuUsagePercent: 30, memoryUsageMb: 512, ioReadBytesSec: 1000, ioWriteBytesSec: 1000 }
    );

    expect(res.status).toBe('CRITICAL');
    expect(res.oomKilled).toBe(true);
    expect(res.warnings.some(w => w.includes('OOM-Killer'))).toBe(true);
    expect(res.psi.memory.full?.avg10).toBeGreaterThan(50);
  });
});
