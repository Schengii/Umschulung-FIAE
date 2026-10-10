import { describe, it, expect } from 'vitest';
import { evaluateMacAccess, DEFAULT_MAC_RESOURCES } from './linuxMacSelinuxEngine';

describe('linuxMacSelinuxEngine', () => {
  const nginxSubject = {
    processName: 'nginx',
    uid: 33,
    selinuxDomain: 'httpd_t',
    apparmorProfile: '/usr/sbin/nginx'
  };

  const rootNginx = {
    processName: 'nginx-compromised',
    uid: 0, // Root privilege escalation
    selinuxDomain: 'httpd_t',
    apparmorProfile: '/usr/sbin/nginx'
  };

  it('allows authorized web file read under Enforcing SELinux', () => {
    const webFile = DEFAULT_MAC_RESOURCES[0]; // /var/www/html/index.html
    const res = evaluateMacAccess(nginxSubject, webFile, 'read', 'Enforcing', 'SELinux');

    expect(res.finalAllowed).toBe(true);
    expect(res.dacAllowed).toBe(true);
    expect(res.macPolicyAllowed).toBe(true);
    expect(res.avcAuditLog).toBeNull();
  });

  it('blocks even root from reading /etc/shadow when confined by httpd_t (Root Mitigation)', () => {
    const shadowFile = DEFAULT_MAC_RESOURCES[2]; // /etc/shadow
    const res = evaluateMacAccess(rootNginx, shadowFile, 'read', 'Enforcing', 'SELinux');

    // Root passes DAC, but SELinux Enforcing blocks it!
    expect(res.dacAllowed).toBe(true);
    expect(res.macPolicyAllowed).toBe(false);
    expect(res.finalAllowed).toBe(false);
    expect(res.rootBypassAttempted).toBe(true);
    expect(res.avcAuditLog).toContain('avc: denied { read }');
    expect(res.avcAuditLog).toContain('permissive=0');
  });

  it('permits access but generates an audit denial log under Permissive mode', () => {
    const shadowFile = DEFAULT_MAC_RESOURCES[2];
    const res = evaluateMacAccess(rootNginx, shadowFile, 'read', 'Permissive', 'SELinux');

    expect(res.finalAllowed).toBe(true); // Permissive logs and permits
    expect(res.avcAuditLog).toContain('permissive=1');
  });
});
