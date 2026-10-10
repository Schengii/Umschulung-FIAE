import { describe, it, expect } from 'vitest';
import { 
  executeSyscallSandbox, 
  DEFAULT_CAPABILITIES, 
  DEFAULT_SECCOMP_RULES 
} from './linuxCapSeccompEngine';

describe('Linux Capabilities & Seccomp BPF Engine', () => {
  it('kills process on forbidden syscall configured with SECCOMP_RET_KILL_PROCESS', () => {
    const res = executeSyscallSandbox('execve', 80, DEFAULT_CAPABILITIES, DEFAULT_SECCOMP_RULES);
    expect(res.status).toBe('KILLED');
    expect(res.allowed).toBe(false);
    expect(res.seccompHit).toBe(true);
  });

  it('allows binding to port 80 when CAP_NET_BIND_SERVICE is active', () => {
    const caps = { ...DEFAULT_CAPABILITIES, CAP_NET_BIND_SERVICE: { ...DEFAULT_CAPABILITIES.CAP_NET_BIND_SERVICE, active: true } };
    const res = executeSyscallSandbox('bind', 80, caps, DEFAULT_SECCOMP_RULES);
    expect(res.status).toBe('SUCCESS');
    expect(res.allowed).toBe(true);
  });

  it('rejects binding to privileged port 80 when CAP_NET_BIND_SERVICE is inactive', () => {
    const caps = { ...DEFAULT_CAPABILITIES, CAP_NET_BIND_SERVICE: { ...DEFAULT_CAPABILITIES.CAP_NET_BIND_SERVICE, active: false } };
    const res = executeSyscallSandbox('bind', 80, caps, DEFAULT_SECCOMP_RULES);
    expect(res.status).toBe('EACCES');
    expect(res.allowed).toBe(false);
    expect(res.errno).toBe(13);
  });

  it('returns EPERM when CAP_SYS_ADMIN is missing for mount', () => {
    // Override seccomp mount rule to ALLOW so capabilities check runs
    const rules = DEFAULT_SECCOMP_RULES.filter(r => r.syscall !== 'mount');
    const caps = { ...DEFAULT_CAPABILITIES, CAP_SYS_ADMIN: { ...DEFAULT_CAPABILITIES.CAP_SYS_ADMIN, active: false } };
    const res = executeSyscallSandbox('mount', 80, caps, rules);
    expect(res.status).toBe('EPERM');
    expect(res.allowed).toBe(false);
  });
});
