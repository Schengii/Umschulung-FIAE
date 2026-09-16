import { describe, it, expect } from 'vitest';
import { LINUX_NAMESPACES, CgroupsV2Controller } from './linuxContainerEngine';

describe('Linux Namespaces & Cgroups v2 Engine', () => {
  it('defines the 6 core Linux namespaces accurately', () => {
    expect(LINUX_NAMESPACES.length).toBe(6);
    const pidNs = LINUX_NAMESPACES.find(n => n.type === 'PID');
    expect(pidNs.containerPid).toBe(1);
    expect(pidNs.syscall).toBe('CLONE_NEWPID');
  });

  it('calculates Cgroups v2 cpu.max and throttles when threads exceed cores', () => {
    const cg = new CgroupsV2Controller();
    cg.setCpuLimit(0.5); // 0.5 cores = 50,000 / 100,000

    const state = cg.evaluateProcessState(2, 200);
    expect(state.cpuThrottled).toBe(true);
    expect(state.status).toContain('CPU_THROTTLED');
  });

  it('triggers OOM kill when memory exceeds memory.max', () => {
    const cg = new CgroupsV2Controller();
    cg.setMemoryLimit(512);

    const state = cg.evaluateProcessState(1, 520);
    expect(state.oomKilled).toBe(true);
    expect(state.status).toContain('OOM_KILLED');
  });
});
