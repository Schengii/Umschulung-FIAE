import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Award, Check, Terminal, 
  FileText, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  evaluateMacAccess, 
  DEFAULT_MAC_RESOURCES 
} from '../../utils/linuxMacSelinuxEngine';
import { useStore } from '../../store/useStore';

export default function LinuxMacSelinuxLab() {
  const { awardXP } = useStore();
  const [xpAwarded, setXpAwarded] = useState(false);

  const [macFramework, setMacFramework] = useState(/** @type {'SELinux' | 'AppArmor'} */ ('SELinux'));
  const [macMode, setMacMode] = useState(/** @type {'Enforcing' | 'Permissive' | 'Disabled'} */ ('Enforcing'));
  const [isRoot, setIsRoot] = useState(false);
  const [selectedResourcePath, setSelectedResourcePath] = useState(DEFAULT_MAC_RESOURCES[0].path);
  const [action, setAction] = useState(/** @type {'read' | 'write' | 'execute'} */ ('read'));

  const subject = useMemo(() => ({
    processName: 'nginx',
    uid: isRoot ? 0 : 33, // 0 = root, 33 = www-data
    selinuxDomain: 'httpd_t',
    apparmorProfile: '/usr/sbin/nginx'
  }), [isRoot]);

  const selectedResource = useMemo(() => {
    return DEFAULT_MAC_RESOURCES.find(r => r.path === selectedResourcePath) || DEFAULT_MAC_RESOURCES[0];
  }, [selectedResourcePath]);

  const accessResult = useMemo(() => {
    return evaluateMacAccess(subject, selectedResource, action, macMode, macFramework);
  }, [subject, selectedResource, action, macMode, macFramework]);

  const handleTestTrigger = () => {
    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'linux_mac_selinux_master');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                Linux Kernel Security
              </span>
              <span className="text-xs text-slate-400">DAC vs. MAC (SELinux / AppArmor)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Linux AppArmor & SELinux Mandatory Access Control Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Verstehe den Unterschied zwischen traditionellen Datei-Rechten (DAC `chmod`/`chown`) und Kernel-MAC (SELinux Type Enforcement & AppArmor Profile). Erlebe, wie SELinux selbst Root-Exploits neutralisiert.
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow"
              >
                <Award size={14} /> 65 XP sichern
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Controls & Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-400" />
              Sicherheits-Konfiguration
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">MAC Framework:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMacFramework('SELinux')}
                    className={`p-2 rounded-lg border font-medium transition ${
                      macFramework === 'SELinux'
                        ? 'bg-red-950/50 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SELinux (RHEL / Fedora)
                  </button>
                  <button
                    onClick={() => setMacFramework('AppArmor')}
                    className={`p-2 rounded-lg border font-medium transition ${
                      macFramework === 'AppArmor'
                        ? 'bg-red-950/50 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AppArmor (Debian / Ubuntu)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Betriebsmodus (getenforce):</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Enforcing', 'Permissive', 'Disabled'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setMacMode(/** @type {any} */ (mode))}
                      className={`p-2 rounded-lg border font-medium text-center transition ${
                        macMode === mode
                          ? 'bg-red-950/50 border-red-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded bg-slate-950 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isRoot}
                    onChange={(e) => setIsRoot(e.target.checked)}
                    className="accent-red-500 rounded"
                  />
                  <div>
                    <span className="font-semibold block">Root Privilege Escalation (UID 0)</span>
                    <span className="text-[11px] text-slate-500">Angreifer bricht aus Daemon aus und besitzt Root-Rechte</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ziel-Datei / Ressource:</label>
                <select
                  value={selectedResourcePath}
                  onChange={(e) => setSelectedResourcePath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {DEFAULT_MAC_RESOURCES.map((r) => (
                    <option key={r.path} value={r.path}>
                      {r.path} ({r.selinuxType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Aktion:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['read', 'write', 'execute'].map((act) => (
                    <button
                      key={act}
                      onClick={() => setAction(/** @type {any} */ (act))}
                      className={`p-1.5 rounded-lg border font-medium text-center capitalize transition ${
                        action === act
                          ? 'bg-slate-800 border-slate-600 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results & AVC Audit Log (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Decision Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            accessResult.finalAllowed
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500 text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              {accessResult.finalAllowed ? (
                <CheckCircle2 size={32} className="text-emerald-400" />
              ) : (
                <XCircle size={32} className="text-rose-400" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  Zugriff {accessResult.finalAllowed ? 'ERLAUBT (Access Granted)' : 'VERWEIGERT (Access Denied)'}
                </h3>
                <p className="text-xs opacity-85">
                  {accessResult.rootBypassAttempted 
                    ? '🛡️ ROOT GEBLOCKT! DAC erlaubte Root, aber SELinux Enforcing verhinderte die Kompromittierung!'
                    : accessResult.ruleDetails}
                </p>
              </div>
            </div>
          </div>

          {/* DAC vs MAC Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText size={16} className="text-red-400" />
              2-Stufen-Prüfung im Linux-Kernel
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-medium text-slate-200 block">Stufe 1: DAC (Discretionary Access Control)</span>
                  <span className="text-[11px] text-slate-500">
                    UID: {subject.uid} • Owner UID: {selectedResource.ownerUid} • Mode: {selectedResource.dacPermissions}
                  </span>
                </div>
                <span className={`font-semibold font-mono ${accessResult.dacAllowed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {accessResult.dacAllowed ? 'PASSED' : 'DENIED (EACCES)'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-medium text-slate-200 block">Stufe 2: MAC ({macFramework} {macMode})</span>
                  <span className="text-[11px] text-slate-500">
                    Domain: {subject.selinuxDomain} &rarr; Target Type: {selectedResource.selinuxType}
                  </span>
                </div>
                <span className={`font-semibold font-mono ${
                  accessResult.macPolicyAllowed 
                    ? 'text-emerald-400' 
                    : macMode === 'Permissive'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                }`}>
                  {accessResult.macPolicyAllowed ? 'PASSED' : macMode === 'Permissive' ? 'AUDIT (Logged)' : 'DENIED (EPERM)'}
                </span>
              </div>
            </div>
          </div>

          {/* AVC Audit Terminal Log */}
          {accessResult.avcAuditLog && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Terminal size={14} className="text-red-400" />
                Live Linux Audit-Log (`/var/log/audit/audit.log`)
              </div>
              <div className="bg-black/90 p-3 rounded-lg font-mono text-[11px] text-red-400 border border-red-950/60 overflow-x-auto leading-relaxed">
                {accessResult.avcAuditLog}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
