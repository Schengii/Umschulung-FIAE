import React, { useState, useMemo } from 'react';
import { 
  Activity, Award, Check, Cpu, HardDrive, 
  Layers, AlertTriangle, Skull
} from 'lucide-react';
import { calculatePsiAndCgroupStatus } from '../../utils/linuxPsiCgroupEngine';
import { useStore } from '../../store/useStore';

export default function LinuxPsiCgroupLab() {
  const { awardXP } = useStore();
  const [xpAwarded, setXpAwarded] = useState(false);

  const [limits, setLimits] = useState({
    cpuMaxQuotaPercent: 80,
    memoryMaxMb: 512,
    memoryHighMb: 400,
    ioWeight: 100
  });

  const [usage, setUsage] = useState({
    cpuUsagePercent: 65,
    memoryUsageMb: 320,
    ioReadBytesSec: 5 * 1024 * 1024,
    ioWriteBytesSec: 2 * 1024 * 1024
  });

  const statusReport = useMemo(() => {
    return calculatePsiAndCgroupStatus(limits, usage);
  }, [limits, usage]);

  const handleSimulateLoad = (scenario) => {
    if (scenario === 'healthy') {
      setUsage({
        cpuUsagePercent: 35,
        memoryUsageMb: 240,
        ioReadBytesSec: 1024 * 1024,
        ioWriteBytesSec: 512 * 1024
      });
    } else if (scenario === 'cpu-throttle') {
      setUsage({
        cpuUsagePercent: 120, // Stalling beyond 80%
        memoryUsageMb: 280,
        ioReadBytesSec: 2 * 1024 * 1024,
        ioWriteBytesSec: 1024 * 1024
      });
    } else if (scenario === 'memory-reclaim') {
      setUsage({
        cpuUsagePercent: 50,
        memoryUsageMb: 460, // Above memory.high (400)
        ioReadBytesSec: 8 * 1024 * 1024,
        ioWriteBytesSec: 4 * 1024 * 1024
      });
    } else if (scenario === 'oom-kill') {
      setUsage({
        cpuUsagePercent: 90,
        memoryUsageMb: 520, // Beyond memory.max (512)
        ioReadBytesSec: 15 * 1024 * 1024,
        ioWriteBytesSec: 10 * 1024 * 1024
      });
    }

    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'linux_psi_master');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Linux Kernel & Cgroups v2
              </span>
              <span className="text-xs text-slate-400">Kubernetes Node Pressure & PSI</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Linux Cgroups v2 & PSI (Pressure Stall Information) Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Untersuche CPU, Memory und I/O Stalls (`some` vs. `full`), analysiere CFS-Drosselung (`cpu.max`) und simuliere Kernel-Reclaim sowie OOM-Killer Auslösungen für K8s Pods.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {xpAwarded ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Check size={14} /> 65 XP erhalten!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
                <Award size={14} /> 65 XP verfügbar
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleSimulateLoad('healthy')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          Normalbetrieb (Grün)
        </button>
        <button
          onClick={() => handleSimulateLoad('cpu-throttle')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border border-amber-800 transition"
        >
          CPU CFS Quota Throttling
        </button>
        <button
          onClick={() => handleSimulateLoad('memory-reclaim')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-800 transition"
        >
          Memory High (Reclaim Stall)
        </button>
        <button
          onClick={() => handleSimulateLoad('oom-kill')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/50 text-rose-200 border border-rose-800 transition"
        >
          OOM Killer Crash
        </button>
      </div>

      {/* Grid: Controls & PSI Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              Cgroup v2 Limits
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>cpu.max Quota:</span>
                  <span className="font-mono text-cyan-400">{limits.cpuMaxQuotaPercent}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={limits.cpuMaxQuotaPercent}
                  onChange={(e) => setLimits(prev => ({ ...prev, cpuMaxQuotaPercent: Number(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>memory.high (Reclaim Threshold):</span>
                  <span className="font-mono text-purple-400">{limits.memoryHighMb} MB</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="800"
                  value={limits.memoryHighMb}
                  onChange={(e) => setLimits(prev => ({ ...prev, memoryHighMb: Number(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>memory.max (Hard Limit OOM):</span>
                  <span className="font-mono text-rose-400">{limits.memoryMaxMb} MB</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="1024"
                  value={limits.memoryMaxMb}
                  onChange={(e) => setLimits(prev => ({ ...prev, memoryMaxMb: Number(e.target.value) }))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" />
              Aktuelle Workload-Auslastung
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Aktuelle CPU-Last:</span>
                  <span className="font-mono text-cyan-400">{usage.cpuUsagePercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={usage.cpuUsagePercent}
                  onChange={(e) => setUsage(prev => ({ ...prev, cpuUsagePercent: Number(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Aktueller RAM-Bedarf:</span>
                  <span className="font-mono text-purple-400">{usage.memoryUsageMb} MB</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="900"
                  value={usage.memoryUsageMb}
                  onChange={(e) => setUsage(prev => ({ ...prev, memoryUsageMb: Number(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PSI Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            statusReport.oomKilled 
              ? 'bg-rose-950/40 border-rose-600 text-rose-200'
              : statusReport.status === 'WARNING'
                ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-600 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {statusReport.oomKilled ? (
                <Skull size={28} className="text-rose-400 animate-pulse" />
              ) : statusReport.status === 'WARNING' ? (
                <AlertTriangle size={28} className="text-amber-400" />
              ) : (
                <Check size={28} className="text-emerald-400" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {statusReport.oomKilled ? 'OOM-KILLER TRIGGERED' : `Node Status: ${statusReport.status}`}
                </h3>
                <p className="text-xs opacity-80">
                  {statusReport.isThrottled ? 'CFS Throttling aktiv • ' : ''}
                  {statusReport.warnings[0] || 'Alle Ressourcen innerhalb gesunder Schwellenwerte.'}
                </p>
              </div>
            </div>
          </div>

          {/* PSI Metrics Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Kernel Pressure Stall Information (`/proc/pressure/*`)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* CPU PSI */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-semibold">
                  <Cpu size={16} /> /proc/pressure/cpu
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>some avg10:</span>
                    <span className="font-mono text-cyan-300 font-bold">{statusReport.psi.cpu.some.avg10}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>some avg60:</span>
                    <span className="font-mono text-slate-300">{statusReport.psi.cpu.some.avg60}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    Kein 'full' stall bei CPU (Linux hat immer Kernel/Idle).
                  </div>
                </div>
              </div>

              {/* Memory PSI */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-semibold">
                  <Activity size={16} /> /proc/pressure/memory
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>some avg10:</span>
                    <span className="font-mono text-purple-300 font-bold">{statusReport.psi.memory.some.avg10}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>full avg10:</span>
                    <span className={`font-mono font-bold ${
                      (statusReport.psi.memory.full?.avg10 || 0) > 25 ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      {statusReport.psi.memory.full?.avg10}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    'full' = Alle Threads blockiert durch Paging.
                  </div>
                </div>
              </div>

              {/* I/O PSI */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-semibold">
                  <HardDrive size={16} /> /proc/pressure/io
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>some avg10:</span>
                    <span className="font-mono text-amber-300 font-bold">{statusReport.psi.io.some.avg10}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>full avg10:</span>
                    <span className="font-mono text-slate-300">{statusReport.psi.io.full?.avg10}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    Disk Sättigung & Block-Queue Stalls.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
