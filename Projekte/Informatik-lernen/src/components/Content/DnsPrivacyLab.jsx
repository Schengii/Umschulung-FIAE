import React, { useState, useMemo } from 'react';
import { 
  Globe, Award, Check, Lock, Unlock, 
  Terminal, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { inspectDnsPrivacy } from '../../utils/dnsPrivacyEngine';
import { useStore } from '../../store/useStore';

export default function DnsPrivacyLab() {
  const { awardXP } = useStore();
  const [xpAwarded, setXpAwarded] = useState(false);

  const [domain, setDomain] = useState('secure-banking.sparkasse.de');
  const [protocol, setProtocol] = useState(/** @type {'PlainDNS' | 'DoT' | 'DoH'} */ ('DoH'));

  const inspection = useMemo(() => {
    return inspectDnsPrivacy(domain, protocol);
  }, [domain, protocol]);

  const handleTestTrigger = () => {
    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'dns_privacy_master');
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
                Network Privacy & RFC Standards
              </span>
              <span className="text-xs text-slate-400">DoH (RFC 8484) vs. DoT (RFC 7858)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              DNS-over-HTTPS (DoH) & DNS-over-TLS (DoT) Privacy Inspector
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Vergleiche unverschlüsseltes Standard-DNS (UDP 53) mit modernen Verschlüsselungsstandards. Entdecke, wie ISPs und Man-in-the-Middle Angreifer Surfgewohnheiten überwachen und wie DoH/DoT Zensur verhindern.
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow"
              >
                <Award size={14} /> 65 XP sichern
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Inputs & Inspection Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Globe size={18} className="text-cyan-400" />
              DNS-Anfrage konfigurieren
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Aufzurufende Domain (FQDN):</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="z. B. www.reddit.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Protokoll:</label>
                <div className="space-y-2">
                  {[
                    { id: 'PlainDNS', title: 'Klartext-DNS (Standard)', port: 'Port 53 / UDP' },
                    { id: 'DoT', title: 'DNS over TLS (RFC 7858)', port: 'Port 853 / TCP' },
                    { id: 'DoH', title: 'DNS over HTTPS (RFC 8484)', port: 'Port 443 / TCP (HTTP/2)' }
                  ].map((proto) => (
                    <button
                      key={proto.id}
                      onClick={() => setProtocol(/** @type {any} */ (proto.id))}
                      className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition ${
                        protocol === proto.id
                          ? 'bg-cyan-950/40 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <span className="font-semibold block">{proto.title}</span>
                        <span className="text-[11px] text-slate-500">{proto.port}</span>
                      </div>
                      {protocol === proto.id && <Check size={16} className="text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results View (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Privacy Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            inspection.isEncrypted
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500 text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              {inspection.isEncrypted ? (
                <Lock size={32} className="text-emerald-400" />
              ) : (
                <Unlock size={32} className="text-rose-400" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {inspection.isEncrypted ? 'Verschlüsselte DNS-Kommunikation' : 'Unverschlüsseltes Klartext-DNS'}
                </h3>
                <p className="text-xs opacity-85">
                  {inspection.isIspVisible
                    ? '⚠️ ISP / WLAN-Betreiber sieht jede aufgerufene Domain im Klartext!'
                    : '🛡️ Ende-zu-Ende verschlüsselt bis zum DNS-Resolver (Cloudflare 1.1.1.1 / Quad9).'}
                </p>
              </div>
            </div>
          </div>

          {/* Wire-Format Inspection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Netzwerk-Paket Inspektion</span>
              <span className="font-mono text-cyan-400">Port {inspection.port}</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 block font-medium">Protokoll-Spezifikation:</span>
              <span className="text-slate-200 font-mono">{inspection.packetFormat}</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Terminal size={14} className="text-cyan-400" />
                Wireshark / Sniffer Paket-Inhalt Preview:
              </span>
              <div className="p-3 rounded-xl bg-black/90 font-mono text-[11px] text-cyan-300 border border-slate-800 overflow-x-auto">
                {inspection.hexDumpPreview}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-slate-400">
              <div className="flex items-center gap-2">
                {inspection.isIspVisible ? <Eye size={16} className="text-rose-400" /> : <EyeOff size={16} className="text-emerald-400" />}
                <span>ISP Überwachung: <strong className={inspection.isIspVisible ? 'text-rose-400' : 'text-emerald-400'}>
                  {inspection.isIspVisible ? 'Möglich' : 'Blockiert'}
                </strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                <span>Firewall-Blockade: <strong className="text-slate-200">
                  {inspection.protocol === 'DoH' ? 'Schwer (Port 443)' : inspection.protocol === 'DoT' ? 'Möglich (Port 853)' : 'Leicht (Port 53)'}
                </strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
