import React, { useState, useMemo } from 'react';
import { 
  Radio, Award, Check, Network, 
  ShieldCheck, Zap
} from 'lucide-react';
import { gatherIceCandidates, nominateIcePair } from '../../utils/webrtcIceGatheringEngine';
import { useStore } from '../../store/useStore';

export default function WebrtcIceGatheringLab() {
  const { awardXP } = useStore();
  const [xpAwarded, setXpAwarded] = useState(false);

  const [localNat, setLocalNat] = useState(/** @type {'FullCone' | 'RestrictedCone' | 'PortRestrictedCone' | 'Symmetric'} */ ('PortRestrictedCone'));
  const [remoteNat, setRemoteNat] = useState(/** @type {'FullCone' | 'RestrictedCone' | 'PortRestrictedCone' | 'Symmetric'} */ ('Symmetric'));
  const [stunEnabled, setStunEnabled] = useState(true);
  const [turnEnabled, setTurnEnabled] = useState(true);
  const [firewallBlock, setFirewallBlock] = useState(false);

  const localScenario = useMemo(() => ({
    natType: localNat,
    stunReachable: stunEnabled,
    turnReachable: turnEnabled,
    firewallBlocksDirectUdp: firewallBlock
  }), [localNat, stunEnabled, turnEnabled, firewallBlock]);

  const remoteScenario = useMemo(() => ({
    natType: remoteNat,
    stunReachable: stunEnabled,
    turnReachable: turnEnabled,
    firewallBlocksDirectUdp: false
  }), [remoteNat, stunEnabled, turnEnabled]);

  const localCandidates = useMemo(() => {
    return gatherIceCandidates(localScenario);
  }, [localScenario]);

  const connectionDecision = useMemo(() => {
    const res = nominateIcePair(localCandidates, localScenario, remoteScenario);
    return res;
  }, [localCandidates, localScenario, remoteScenario]);

  const handleTestTrigger = () => {
    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'webrtc_ice_master');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                WebRTC & RFC 8445 ICE
              </span>
              <span className="text-xs text-slate-400">STUN (RFC 8489) & TURN (RFC 8656)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              WebRTC STUN/TURN & ICE Candidate Gathering Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simuliere den ICE-Candidate-Gathering-Prozess (Host, Server Reflexive, Relay), analysiere NAT-Typen (Full Cone vs. Symmetric NAT) und erlebe automatisches Fallback auf TURN-Relays.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {xpAwarded ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Check size={14} /> 65 XP erhalten!
              </span>
            ) : (
              <button
                onClick={handleTestTrigger}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold transition shadow"
              >
                <Award size={14} /> 65 XP sichern
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Network size={18} className="text-indigo-400" />
              Netzwerk- & NAT-Topologie
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Lokaler NAT-Typ (Peer A):</label>
                <select
                  value={localNat}
                  onChange={(e) => setLocalNat(/** @type {any} */ (e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="FullCone">Full Cone NAT (Einfaches Hole-Punching)</option>
                  <option value="RestrictedCone">Restricted Cone NAT</option>
                  <option value="PortRestrictedCone">Port Restricted Cone NAT</option>
                  <option value="Symmetric">Symmetric NAT (Unterschiedliche Ports pro Remote IP)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Entfernter NAT-Typ (Peer B):</label>
                <select
                  value={remoteNat}
                  onChange={(e) => setRemoteNat(/** @type {any} */ (e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="FullCone">Full Cone NAT</option>
                  <option value="PortRestrictedCone">Port Restricted Cone NAT</option>
                  <option value="Symmetric">Symmetric NAT (Enterprise / Mobile)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stunEnabled}
                    onChange={(e) => setStunEnabled(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>STUN Server aktiv (`stun:stun.l.google.com:19302`)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={turnEnabled}
                    onChange={(e) => setTurnEnabled(e.target.checked)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>TURN Relay Server konfiguriert (`turn:turn.domain.tld`)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firewallBlock}
                    onChange={(e) => setFirewallBlock(e.target.checked)}
                    className="accent-rose-500 rounded"
                  />
                  <span className="text-rose-300">Corporate Firewall blockiert Direkt-UDP (P2P Drop)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ICE Gathering Result (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Nominated Pair Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            connectionDecision.connectionType === 'FAILED'
              ? 'bg-rose-950/40 border-rose-600 text-rose-200'
              : connectionDecision.connectionType === 'RELAY_TURN'
                ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {connectionDecision.connectionType === 'FAILED' ? (
                <ShieldCheck size={28} className="text-rose-400" />
              ) : connectionDecision.connectionType === 'RELAY_TURN' ? (
                <Zap size={28} className="text-amber-400" />
              ) : (
                <Radio size={28} className="text-emerald-400" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  ICE Status: {connectionDecision.connectionType}
                </h3>
                <p className="text-xs opacity-80">
                  {connectionDecision.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Gathered Candidates List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span>Gesammelte ICE-Kandidaten (SDP)</span>
              <span className="text-xs text-slate-400 font-normal">({localCandidates.length} gefunden)</span>
            </h3>

            <div className="space-y-2.5">
              {localCandidates.map((candidate) => {
                const isNominated = connectionDecision.nominatedPair?.foundation === candidate.foundation;
                return (
                  <div
                    key={candidate.foundation}
                    className={`p-3 rounded-xl border text-xs transition ${
                      isNominated
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-900/20'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          candidate.type === 'host' ? 'bg-cyan-500/20 text-cyan-300' :
                          candidate.type === 'srflx' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {candidate.type}
                        </span>
                        <span className="font-mono text-slate-300">{candidate.ip}:{candidate.port}</span>
                        {isNominated && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/30 text-indigo-200 font-semibold">
                            Nominiert
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">Prio: {candidate.priority}</span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded border border-slate-800/80 overflow-x-auto">
                      {candidate.rawSdpCandidate}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Prioritätsformel nach RFC 8445:</span>
              <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded font-mono">
                priority = (2^24)*type_pref + (2^8)*local_pref + (256-component)
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
