// @ts-check
/**
 * Linux Cgroups v2 & PSI (Pressure Stall Information) Simulation Engine
 * Simulates resource pressure metrics for CPU, Memory, and I/O (some vs. full stalls)
 * and evaluates triggers for Kubernetes node pressure and OOM killer events.
 */

/**
 * @typedef {Object} PsiMetric
 * @property {number} avg10 10-second stall percentage
 * @property {number} avg60 60-second stall percentage
 * @property {number} avg300 300-second stall percentage
 * @property {number} total Total stall time in microseconds
 */

/**
 * @typedef {Object} PsiCategory
 * @property {PsiMetric} some Tasks stalled waiting for resources while others made progress
 * @property {PsiMetric} [full] All non-idle tasks stalled simultaneously (complete system stall)
 */

/**
 * @typedef {Object} CgroupLimits
 * @property {number} cpuMaxQuotaPercent (e.g. 80%)
 * @property {number} memoryMaxMb (e.g. 512MB)
 * @property {number} memoryHighMb (e.g. 400MB threshold for throttling)
 * @property {number} ioWeight (e.g. 100)
 */

/**
 * @typedef {Object} CgroupUsage
 * @property {number} cpuUsagePercent
 * @property {number} memoryUsageMb
 * @property {number} ioReadBytesSec
 * @property {number} ioWriteBytesSec
 */

/**
 * Evaluates PSI pressure stalls and cgroups v2 resource status
 * @param {CgroupLimits} limits
 * @param {CgroupUsage} usage
 * @param {number} [durationSec]
 */
export function calculatePsiAndCgroupStatus(limits, usage, durationSec = 10) {
  const {
    cpuMaxQuotaPercent = 100,
    memoryMaxMb = 512,
    memoryHighMb = 420,
    ioWeight = 100
  } = limits;

  const {
    cpuUsagePercent = 20,
    memoryUsageMb = 250,
    ioReadBytesSec = 1024 * 1024,
    ioWriteBytesSec = 512 * 1024
  } = usage;

  // 1. CPU PSI
  const cpuStallRatio = Math.max(0, Math.min(1, (cpuUsagePercent - cpuMaxQuotaPercent) / Math.max(1, cpuMaxQuotaPercent)));
  const cpuSomeAvg10 = Number((cpuStallRatio * 45).toFixed(2));
  const cpuSomeAvg60 = Number((cpuStallRatio * 32).toFixed(2));
  const cpuSomeAvg300 = Number((cpuStallRatio * 15).toFixed(2));
  const cpuTotalStallUs = Math.round(cpuStallRatio * durationSec * 1000000);

  // 2. Memory PSI (some vs full)
  const memOverHighRatio = Math.max(0, (memoryUsageMb - memoryHighMb) / Math.max(1, memoryMaxMb - memoryHighMb));
  const memOverMax = memoryUsageMb >= memoryMaxMb;

  const memSomeAvg10 = Number(Math.min(99.9, memOverHighRatio * 55 + (memOverMax ? 40 : 0)).toFixed(2));
  const memFullAvg10 = Number(Math.min(95.0, memOverHighRatio * 30 + (memOverMax ? 50 : 0)).toFixed(2));

  // 3. I/O PSI
  const totalIoBytes = ioReadBytesSec + ioWriteBytesSec;
  const ioSaturation = Math.max(0, Math.min(1, (totalIoBytes - (ioWeight * 500000)) / (ioWeight * 500000)));
  const ioSomeAvg10 = Number((ioSaturation * 35).toFixed(2));
  const ioFullAvg10 = Number((ioSaturation * 20).toFixed(2));

  // 4. Kubernetes Node & Cgroup Eviction Status
  let status = 'HEALTHY';
  let isThrottled = false;
  let oomKilled = false;
  /** @type {string[]} */
  const warnings = [];

  if (cpuUsagePercent > cpuMaxQuotaPercent) {
    isThrottled = true;
    warnings.push(`CPU Quota überschritten (${cpuUsagePercent}% > ${cpuMaxQuotaPercent}%). CFS-Bandbreite wird gedrosselt (cfs_quota_us).`);
  }

  if (memoryUsageMb >= memoryMaxMb) {
    status = 'CRITICAL';
    oomKilled = true;
    warnings.push(`Cgroup Memory Max (${memoryMaxMb}MB) erreicht! Linux OOM-Killer terminiert den Prozess.`);
  } else if (memoryUsageMb > memoryHighMb) {
    status = 'WARNING';
    warnings.push(`Cgroup Memory High (${memoryHighMb}MB) überschritten. Kernel-Reclaim aktiv, Prozess verlangsamt.`);
  }

  if (memFullAvg10 > 25) {
    warnings.push(`Kritischer Memory Pressure (PSI full avg10 = ${memFullAvg10}%). Kubelet markiert Node mit MemoryPressure.`);
  }

  return {
    status,
    isThrottled,
    oomKilled,
    warnings,
    psi: {
      cpu: {
        some: { avg10: cpuSomeAvg10, avg60: cpuSomeAvg60, avg300: cpuSomeAvg300, total: cpuTotalStallUs }
      },
      memory: {
        some: { avg10: memSomeAvg10, avg60: Number((memSomeAvg10 * 0.7).toFixed(2)), avg300: Number((memSomeAvg10 * 0.4).toFixed(2)), total: Math.round(memSomeAvg10 * 10000) },
        full: { avg10: memFullAvg10, avg60: Number((memFullAvg10 * 0.6).toFixed(2)), avg300: Number((memFullAvg10 * 0.3).toFixed(2)), total: Math.round(memFullAvg10 * 8000) }
      },
      io: {
        some: { avg10: ioSomeAvg10, avg60: Number((ioSomeAvg10 * 0.6).toFixed(2)), avg300: Number((ioSomeAvg10 * 0.3).toFixed(2)), total: Math.round(ioSomeAvg10 * 5000) },
        full: { avg10: ioFullAvg10, avg60: Number((ioFullAvg10 * 0.5).toFixed(2)), avg300: Number((ioFullAvg10 * 0.2).toFixed(2)), total: Math.round(ioFullAvg10 * 3000) }
      }
    }
  };
}
