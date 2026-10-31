import React, { useState, useMemo } from 'react';
import {
  Globe,
  ShieldAlert,
  Zap,
  Activity,
  Sparkles
} from 'lucide-react';
import {
  INITIAL_POPS,
  processPopTraffic
} from '../../utils/ddosScrubberEngine';

export default function BgpAnycastDdosLab({ onRewardXP }) {
  const [pops, setPops] = useState(INITIAL_POPS);
  const [selectedPopId, setSelectedPopId] = useState('fra');
  const [attackType, setAttackType] = useState('SYN_FLOOD');
  const [attackGbps, setAttackGbps] = useState(60);
  const [enableSynCookies, setEnableSynCookies] = useState(true);
  const [enableRateLimiting, setEnableRateLimiting] = useState(true);
  const [enableBgpWithdrawal, setEnableBgpWithdrawal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const selectedPop = pops.find(p => p.id === selectedPopId) || pops[0];

  const simulationResult = useMemo(() => {
    return processPopTraffic({
      pop: selectedPop,
      attackType,
      attackGbps,
      enableSynCookies,
      enableRateLimiting,
      enableBgpWithdrawal
    });
  }, [selectedPop, attackType, attackGbps, enableSynCookies, enableRateLimiting, enableBgpWithdrawal]);

  const handleSimulateMitigation = () => {
    setPops(prevPops =>
      prevPops.map(p => (p.id === selectedPopId ? simulationResult.scrubbedPop : p))
    );
    if (!isCompleted && onRewardXP && simulationResult.mitigationStatus !== 'OVERWHELMED') {
      onRewardXP(65);
      setIsCompleted(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              BGP Anycast & DDoS Flow-Scrubber Studio
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-400">
                L3/L4 & BGP
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Globale Ingress-Verkehrsverteilung via BGP Anycast, SYN-Cookie Kernel Filterung und automatisierter Traffic-Failover.
            </p>
          </div>
        </div>
      </div>

      {/* Global PoP Map / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pops.map((p) => {
          const isTarget = p.id === selectedPopId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPopId(p.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isTarget
                  ? 'border-rose-500 bg-rose-500/10 shadow-lg'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-rose-400" />
                  {p.city}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  p.isHealthy ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {p.isHealthy ? 'HEALTHY' : 'DOWN / WITHDRAWN'}
                </span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {p.currentTrafficGbps} <span className="text-xs font-normal text-slate-400">/ {p.capacityGbps} Gbps</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    p.currentTrafficGbps > p.capacityGbps * 0.85 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (p.currentTrafficGbps / p.capacityGbps) * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attack Generator & Defense Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-rose-400" />
              DDoS Angriffs-Simulator & Filterung
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Angriffsmuster:</label>
                <select
                  value={attackType}
                  onChange={(e) => setAttackType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="NONE">Kein Angriff (Normalbetrieb)</option>
                  <option value="SYN_FLOOD">TCP SYN Flood (L4)</option>
                  <option value="UDP_AMPLIFICATION">NTP/DNS UDP Amplification (L3/L4)</option>
                  <option value="HTTP_FLOOD">HTTP GET/POST Flood (L7)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Angriffsvolumen (Gbps):</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={attackGbps}
                  onChange={(e) => setAttackGbps(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Defense Controls */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-slate-300">Flow-Scrubber & Kernel Controls</div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">SYN-Cookies (Linux Kernel tcp_syncookies=1):</span>
                <input
                  type="checkbox"
                  checked={enableSynCookies}
                  onChange={(e) => setEnableSynCookies(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Token-Bucket Rate-Limiting & FlowSpec:</span>
                <input
                  type="checkbox"
                  checked={enableRateLimiting}
                  onChange={(e) => setEnableRateLimiting(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">BGP Anycast Route Withdrawal bei Überlast:</span>
                <input
                  type="checkbox"
                  checked={enableBgpWithdrawal}
                  onChange={(e) => setEnableBgpWithdrawal(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateMitigation}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-xs shadow-lg hover:from-rose-400 hover:to-rose-500 transition"
            >
              Filterung & Scrubber auf {selectedPop.city} anwenden
            </button>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Log */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-400" />
                Live Ingress-Telemetrie ({selectedPop.city})
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                simulationResult.mitigationStatus === 'OVERWHELMED'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                Status: {simulationResult.mitigationStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block mb-1">Gefilterter Angriffsverkehr:</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {simulationResult.droppedTrafficGbps} Gbps
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-400 block mb-1">Passierender Rest-Traffic:</span>
                <span className="text-lg font-bold font-mono text-rose-400">
                  {simulationResult.passedTrafficGbps} Gbps
                </span>
              </div>
            </div>

            {/* Event log */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1 font-mono">BGP / Scrubber Audit-Log:</div>
              <p className="font-mono text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
                {simulationResult.log}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          Wie BGP Anycast & DDoS-Scrubber das Internet schützen
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Bei BGP Anycast kündigen mehrere weltweite Rechenzentren dieselbe IP-Adresse per BGP an. Globaler Traffic wird dank BGP Shortest AS-Path automatisch zum geografisch nächsten PoP geleitet. Bei einem massiven DDoS-Angriff verteilt sich die Last automatisch auf alle PoPs weltweit, anstatt einen einzelnen Server lahmzulegen. Droht ein Standort zu kollabieren, wird die BGP-Route für diesen PoP entzogen, woraufhin der Traffic nahtlos auf die übrigen PoPs ausweicht.
        </p>
      </div>
    </div>
  );
}
