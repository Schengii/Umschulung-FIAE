/**
 * Linux Namespaces & Cgroups v2 Container Runtime Engine
 * Simulates the 6 core Linux container isolation namespaces (PID, NET, MNT, UTS, IPC, USER)
 * and Cgroups v2 resource quotas (CPU bandwidth & memory limits).
 */

export const LINUX_NAMESPACES = [
  {
    type: 'PID',
    name: 'Process ID Isolation',
    syscall: 'CLONE_NEWPID',
    description: 'Erstellt einen isolierten Prozessbaum. Der Container-Hauptprozess wird zu PID 1 im Namespace.',
    hostPid: 24890,
    containerPid: 1
  },
  {
    type: 'NET',
    name: 'Network Stack Isolation',
    syscall: 'CLONE_NEWNET',
    description: 'Eigener Netzwerk-Stack: Virtuelles Ethernet-Paar (veth), Routing-Tabelle, iptables & eigene IP (z. B. 172.17.0.2).',
    hostInterface: 'veth04a9e2',
    containerInterface: 'eth0 (172.17.0.2/16)'
  },
  {
    type: 'MNT',
    name: 'Mount / Filesystem Isolation',
    syscall: 'CLONE_NEWMNT',
    description: 'Isoliert Einhängepunkte via pivot_root. Container sieht nur das Root-Dateisystem des Container-Images.',
    hostMount: '/var/lib/docker/overlay2/.../merged',
    containerMount: '/ (rootfs)'
  },
  {
    type: 'UTS',
    name: 'Hostname & Domain Isolation',
    syscall: 'CLONE_NEWUTS',
    description: 'Ermöglicht eigenständigen Hostname (z. B. "prod-api-worker") unabhängig vom Host-System.',
    hostName: 'srv-node-01.company.internal',
    containerName: 'api-worker-a8f3'
  },
  {
    type: 'IPC',
    name: 'Inter-Process Communication',
    syscall: 'CLONE_NEWIPC',
    description: 'Verhindert unberechtigten Zugriff auf Host-Shared-Memory (POSIX IPC / System V Semaphoren).',
    status: 'ISOLATED'
  },
  {
    type: 'USER',
    name: 'User & Group ID Mapping (Rootless)',
    syscall: 'CLONE_NEWUSER',
    description: 'Container-Root (UID 0) wird auf unprivilegierten Host-User (z. B. UID 100000) gemappt (Rootless Security).',
    hostUid: 100000,
    containerUid: 0
  }
];

export class CgroupsV2Controller {
  constructor() {
    this.cpuQuotaUs = 50000; // 50ms quota
    this.cpuPeriodUs = 100000; // 100ms period -> 0.5 CPU Cores
    this.memoryMaxMb = 512;
    this.memoryHighMb = 400;
  }

  setCpuLimit(cores = 1.0) {
    const safeCores = Math.max(0.1, Math.min(8.0, cores));
    this.cpuQuotaUs = Math.round(safeCores * this.cpuPeriodUs);
    return {
      cores: safeCores,
      cpuMaxEntry: `${this.cpuQuotaUs} ${this.cpuPeriodUs}`
    };
  }

  setMemoryLimit(maxMb = 512, highRatio = 0.8) {
    this.memoryMaxMb = Math.max(64, maxMb);
    this.memoryHighMb = Math.round(this.memoryMaxMb * highRatio);
    return {
      memoryMaxMb: this.memoryMaxMb,
      memoryHighMb: this.memoryHighMb
    };
  }

  evaluateProcessState(activeThreads = 4, memoryUsedMb = 450) {
    const maxCores = this.cpuQuotaUs / this.cpuPeriodUs;
    const cpuThrottled = activeThreads > maxCores;
    const memoryThrottled = memoryUsedMb > this.memoryHighMb;
    const oomKilled = memoryUsedMb >= this.memoryMaxMb;

    let status = 'RUNNING (Healthy)';
    if (oomKilled) status = 'OOM_KILLED (137 Exit)';
    else if (memoryThrottled) status = 'MEMORY_THROTTLED (Reclaiming)';
    else if (cpuThrottled) status = 'CPU_THROTTLED (Quota Exceeded)';

    return {
      maxCores,
      cpuThrottled,
      memoryThrottled,
      oomKilled,
      status
    };
  }
}
