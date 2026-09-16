import { describe, it, expect } from 'vitest';
import { BpftraceSimulator } from './bpftraceEngine';

describe('Linux BPFtrace Engine', () => {
  it('executes bpftrace scripts and outputs dynamic kernel histograms', () => {
    const sim = new BpftraceSimulator();
    const res = sim.runScript('vfs_read_hist');

    expect(res.title).toContain('VFS Read');
    expect(res.code).toContain('kprobe:vfs_read');
    expect(res.output).toContain('@us:');
    expect(res.probeCount).toBe(2);
  });

  it('handles user-space uprobe tracing scripts', () => {
    const sim = new BpftraceSimulator();
    const res = sim.runScript('bash_readline');

    expect(res.code).toContain('uprobe:/bin/bash:readline');
    expect(res.output).toContain('git status');
  });
});
