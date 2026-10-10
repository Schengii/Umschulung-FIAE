// @ts-check
/**
 * Linux Capabilities & Seccomp BPF Sandbox Engine
 * Simulates Kernel-level privilege management (POSIX 1003.1e) and syscall filtering.
 */

/**
 * @typedef {Object} LinuxCapability
 * @property {string} name
 * @property {string} description
 * @property {string[]} enabledSyscalls
 * @property {boolean} active
 */

export const DEFAULT_CAPABILITIES = {
  CAP_CHOWN: {
    name: 'CAP_CHOWN',
    description: 'Ermöglicht willkürliche Änderungen der Datei-Benutzer- und Gruppen-IDs.',
    enabledSyscalls: ['chown', 'fchown', 'lchown'],
    active: false
  },
  CAP_NET_BIND_SERVICE: {
    name: 'CAP_NET_BIND_SERVICE',
    description: 'Ermöglicht das Binden an privilegierte Ports unterhalb 1024 (z. B. Port 80 HTTP, 443 HTTPS).',
    enabledSyscalls: ['bind'],
    active: true
  },
  CAP_SYS_ADMIN: {
    name: 'CAP_SYS_ADMIN',
    description: 'Sehr mächtige Capability (Fast Root): Dateisysteme mounten, Namespaces konfigurieren, BPF laden.',
    enabledSyscalls: ['mount', 'umount2', 'unshare', 'setns', 'bpf'],
    active: false
  },
  CAP_NET_RAW: {
    name: 'CAP_NET_RAW',
    description: 'Erlaubt das Öffnen von RAW- und PACKET-Sockets (z. B. für ping/ICMP oder tcpdump).',
    enabledSyscalls: ['socket_raw'],
    active: false
  },
  CAP_SYS_PTRACE: {
    name: 'CAP_SYS_PTRACE',
    description: 'Erlaubt das Debuggen und Verfolgen beliebiger Prozesse mittels ptrace.',
    enabledSyscalls: ['ptrace'],
    active: false
  }
};

/**
 * @typedef {'SECCOMP_RET_ALLOW' | 'SECCOMP_RET_ERRNO' | 'SECCOMP_RET_KILL_PROCESS'} SeccompAction
 */

/**
 * @typedef {Object} SeccompRule
 * @property {string} syscall
 * @property {SeccompAction} action
 * @property {string} reason
 */

export const DEFAULT_SECCOMP_RULES = [
  { syscall: 'read', action: /** @type {SeccompAction} */ ('SECCOMP_RET_ALLOW'), reason: 'Standard I/O erlaubt' },
  { syscall: 'write', action: /** @type {SeccompAction} */ ('SECCOMP_RET_ALLOW'), reason: 'Standard I/O erlaubt' },
  { syscall: 'bind', action: /** @type {SeccompAction} */ ('SECCOMP_RET_ALLOW'), reason: 'Netzwerkbindung erlaubt (sofern Capability vorhanden)' },
  { syscall: 'execve', action: /** @type {SeccompAction} */ ('SECCOMP_RET_KILL_PROCESS'), reason: 'Container-Sicherheit: Ausführen neuer Binaries verboten' },
  { syscall: 'ptrace', action: /** @type {SeccompAction} */ ('SECCOMP_RET_ERRNO'), reason: 'Debugging verweigert (EPERM)' },
  { syscall: 'mount', action: /** @type {SeccompAction} */ ('SECCOMP_RET_KILL_PROCESS'), reason: 'Dateisystem-Manipulation verboten' }
];

/**
 * Simuliert die Ausführung eines Syscalls unter Prüfung von Seccomp BPF und Capabilities
 * @param {string} syscall Name des aufgerufenen Systemaufrufs
 * @param {number} [targetPort] Optionaler Zielport bei bind()
 * @param {Record<string, LinuxCapability>} [caps] Aktive Capabilities
 * @param {SeccompRule[]} [seccompRules] Seccomp-Filterregeln
 */
export function executeSyscallSandbox(syscall, targetPort = 80, caps = DEFAULT_CAPABILITIES, seccompRules = DEFAULT_SECCOMP_RULES) {
  // 1. Seccomp Filter Evaluation
  const rule = seccompRules.find(r => r.syscall === syscall);
  if (rule) {
    if (rule.action === 'SECCOMP_RET_KILL_PROCESS') {
      return {
        status: 'KILLED',
        allowed: false,
        message: `Prozess durch Seccomp BPF beendet: Syscall '${syscall}' ist strikt verboten (${rule.reason}).`,
        errno: null,
        seccompHit: true
      };
    }
    if (rule.action === 'SECCOMP_RET_ERRNO') {
      return {
        status: 'EPERM',
        allowed: false,
        message: `Syscall '${syscall}' abgewiesen mit Fehler EPERM (Operation not permitted) via Seccomp.`,
        errno: 1, // EPERM
        seccompHit: true
      };
    }
  }

  // 2. Linux Capabilities Evaluation
  if (syscall === 'bind' && targetPort < 1024) {
    if (!caps.CAP_NET_BIND_SERVICE?.active) {
      return {
        status: 'EACCES',
        allowed: false,
        message: `Bind an Port ${targetPort} fehlgeschlagen (EACCES): Privilegierte Ports < 1024 erfordern CAP_NET_BIND_SERVICE oder Root.`,
        errno: 13, // EACCES
        seccompHit: false
      };
    }
  }

  if ((syscall === 'mount' || syscall === 'umount2' || syscall === 'bpf') && !caps.CAP_SYS_ADMIN?.active) {
    return {
      status: 'EPERM',
      allowed: false,
      message: `Syscall '${syscall}' verweigert: Erfordert CAP_SYS_ADMIN.`,
      errno: 1,
      seccompHit: false
    };
  }

  if (syscall === 'socket_raw' && !caps.CAP_NET_RAW?.active) {
    return {
      status: 'EPERM',
      allowed: false,
      message: `Erstellen eines RAW-Sockets verweigert: Erfordert CAP_NET_RAW.`,
      errno: 1,
      seccompHit: false
    };
  }

  if (syscall === 'chown' && !caps.CAP_CHOWN?.active) {
    return {
      status: 'EPERM',
      allowed: false,
      message: `chown verweigert: Erfordert CAP_CHOWN.`,
      errno: 1,
      seccompHit: false
    };
  }

  return {
    status: 'SUCCESS',
    allowed: true,
    message: `Syscall '${syscall}' erfolgreich ausgeführt. Keine Seccomp-Blockade und alle nötigen Capabilities vorhanden.`,
    errno: 0,
    seccompHit: false
  };
}
