import React, { useState } from 'react';

import { Globe, Network, Award, RefreshCw, Send } from 'lucide-react';
import { 
  compressIpv6, 
  expandIpv6, 
  generateEui64, 
  matchRoutingTable 
} from '../../utils/ipv6Routing';
import { useStore } from '../../store/useStore';

export default function Ipv6RoutingLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('ipv6_compress');
  const [xpClaimed, setXpClaimed] = useState(false);

  // IPv6 Compression / Expansion State
  const [ipv6Input, setIpv6Input] = useState('2001:0db8:0000:0000:0000:ff00:0042:8329');
  const compressedIpv6 = compressIpv6(ipv6Input);
  const expandedIpv6 = expandIpv6(compressedIpv6);

  // EUI-64 SLAAC State
  const [macInput, setMacInput] = useState('00:1A:2B:3C:4D:5E');
  const [ipv6Prefix, setIpv6Prefix] = useState('fe80::');
  const eui64Result = generateEui64(macInput, ipv6Prefix);

  // Routing Table Simulator State
  const routes = [
    { destination: '0.0.0.0/0', nextHop: '192.168.1.1', iface: 'wan0 (Internet)' },
    { destination: '10.0.0.0/8', nextHop: '10.254.0.1', iface: 'eth1 (Corporate Backbone)' },
    { destination: '10.1.0.0/16', nextHop: '10.1.254.1', iface: 'eth2 (Campus Branch)' },
    { destination: '10.1.5.0/24', nextHop: '10.1.5.254', iface: 'eth3 (Server VLAN 5)' },
    { destination: '172.16.0.0/12', nextHop: '172.31.255.1', iface: 'eth4 (DMZ Lab)' }
  ];
  const [targetIp, setTargetIp] = useState('10.1.5.42');
  const routingMatch = matchRoutingTable(targetIp, routes);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Netzwerktechnik & Next-Gen Routing
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                +100 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Globe className="w-8 h-8 text-emerald-400" />
              IPv6 & Routing-Table Simulator
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Meistere IPv6-Adresskompression, automatische SLAAC / EUI-64 Generierung und Longest Prefix Match (LPM) Routing-Entscheidungen.
            </p>
          </div>
          <button
            onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(30, 'ipv6_expert'); } }}
            disabled={xpClaimed}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" />
            {xpClaimed ? 'XP gesichert!' : 'Netzwerk XP sichern'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('ipv6_compress')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'ipv6_compress'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          IPv6 Kompression & Adresstypen
        </button>
        <button
          onClick={() => setActiveTab('eui64')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'eui64'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Network className="w-4 h-4" />
          SLAAC & EUI-64 Rechner
        </button>
        <button
          onClick={() => setActiveTab('routing_sim')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'routing_sim'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          Longest Prefix Match (LPM) Router
        </button>
      </div>

      {/* Tab 1: IPv6 Compression */}
      {activeTab === 'ipv6_compress' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                IPv6-Adresse eingeben (vollständig oder komprimiert)
              </label>
              <input
                type="text"
                value={ipv6Input}
                onChange={(e) => setIpv6Input(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-mono text-lg"
                placeholder="2001:0db8:0000:0000:0000:ff00:0042:8329"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 block font-semibold">1. Komprimierte Form (RFC 5952)</span>
                <div className="text-xl font-mono font-bold text-emerald-400 break-all">
                  {compressedIpv6}
                </div>
                <p className="text-xs text-slate-400">
                  Regeln: Führende Nullen pro Hextet entfallen. Die längste zusammenhängende Reihe von 0-Hextets wird genau einmal durch <code className="text-amber-400">::</code> ersetzt.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 block font-semibold">2. Expandierte Form (128-Bit, 8 Hextets)</span>
                <div className="text-sm font-mono font-bold text-cyan-300 break-all">
                  {expandedIpv6}
                </div>
                <p className="text-xs text-slate-400">
                  Alle 8 Hextets mit jeweils 4 Hex-Ziffern (16 Bit × 8 = 128 Bit Gesamtadresse).
                </p>
              </div>
            </div>

            {/* Adresstypen Referenz */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
              <h3 className="font-bold text-white text-sm">Wichtige IPv6-Präfixe & Adresstypen</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-emerald-400 font-mono font-bold block">2000::/3</span>
                  <span className="text-slate-300 font-semibold block mt-0.5">Global Unicast</span>
                  <span className="text-slate-400 text-[11px]">Öffentlich im Internet geroutet</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-blue-400 font-mono font-bold block">fe80::/10</span>
                  <span className="text-slate-300 font-semibold block mt-0.5">Link-Local</span>
                  <span className="text-slate-400 text-[11px]">Nur im lokalen Netzwerksegment</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-amber-400 font-mono font-bold block">fc00::/7</span>
                  <span className="text-slate-300 font-semibold block mt-0.5">Unique Local (ULA)</span>
                  <span className="text-slate-400 text-[11px]">Privat, ähnlich RFC 1918 IPv4</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="text-rose-400 font-mono font-bold block">ff00::/8</span>
                  <span className="text-slate-300 font-semibold block mt-0.5">Multicast</span>
                  <span className="text-slate-400 text-[11px]">1-an-Viele (kein Broadcast in IPv6)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: EUI-64 */}
      {activeTab === 'eui64' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-400" />
              SLAAC / EUI-64 Generator
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">MAC-Adresse (48-Bit)</label>
                <input
                  type="text"
                  value={macInput}
                  onChange={(e) => setMacInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base"
                  placeholder="00:1A:2B:3C:4D:5E"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">IPv6 Präfix (64-Bit)</label>
                <input
                  type="text"
                  value={ipv6Prefix}
                  onChange={(e) => setIpv6Prefix(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-base"
                  placeholder="fe80::"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Generierte IPv6 Interface-ID</h2>

            {eui64Result.error ? (
              <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm">
                {eui64Result.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono space-y-2">
                  <span className="text-xs text-slate-400">Komplette SLAAC Link-Local Adresse:</span>
                  <div className="text-xl font-bold text-emerald-400 break-all">
                    {eui64Result.fullIpv6}
                  </div>
                  <span className="text-xs text-slate-400 block pt-1">
                    Interface-ID: <span className="text-cyan-300">{eui64Result.interfaceId}</span>
                  </span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-white block">Ablauf der EUI-64 Konvertierung:</span>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>MAC-Adresse in zwei 24-Bit Hälften teilen (<code className="text-emerald-300">00:1A:2B</code> und <code className="text-emerald-300">3C:4D:5E</code>).</li>
                    <li><code className="text-amber-400">FF:FE</code> in die Mitte einfügen ➔ <code className="text-slate-200">00:1A:2B:FF:FE:3C:4D:5E</code>.</li>
                    <li>Das 7. Bit (Universal/Local) im 1. Byte invertieren (00 ➔ <code className="text-cyan-300">{eui64Result.modifiedFirstByte}</code>).</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: LPM Routing */}
      {activeTab === 'routing_sim' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  Longest Prefix Match (LPM) Weiterleitungs-Entscheidung
                </h2>
                <p className="text-xs text-slate-400">
                  Der Router wählt immer die spezifischste Route (mit der längsten übereinstimmenden Präfixlänge / CIDR).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetIp}
                  onChange={(e) => setTargetIp(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono text-sm"
                  placeholder="10.1.5.42"
                />
                <button
                  onClick={() => setTargetIp('10.1.5.' + Math.floor(Math.random() * 200 + 1))}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Zufalls-IP
                </button>
              </div>
            </div>

            {/* Evaluierte Routen */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 text-xs uppercase tracking-wider">
                    <th className="p-3 border-b border-slate-700">Zielnetzwerk (CIDR)</th>
                    <th className="p-3 border-b border-slate-700">Next-Hop Gateway</th>
                    <th className="p-3 border-b border-slate-700">Ausgangs-Interface</th>
                    <th className="p-3 border-b border-slate-700">Präfix-Match</th>
                    <th className="p-3 border-b border-slate-700">Entscheidung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {routingMatch.evaluatedRoutes?.map((r, idx) => {
                    const isSelected = routingMatch.bestMatch?.destination === r.destination;
                    return (
                      <tr
                        key={idx}
                        className={isSelected ? 'bg-emerald-950/40 text-emerald-200' : 'text-slate-300 hover:bg-slate-800/40'}
                      >
                        <td className="p-3 font-bold">{r.destination}</td>
                        <td className="p-3">{r.nextHop}</td>
                        <td className="p-3 font-sans text-xs">{r.iface}</td>
                        <td className="p-3">
                          {r.matches ? (
                            <span className="text-emerald-400 font-bold">✓ /{r.prefixLength} Match</span>
                          ) : (
                            <span className="text-slate-500">✗ Kein Match</span>
                          )}
                        </td>
                        <td className="p-3 font-sans">
                          {isSelected ? (
                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              ➔ WEITERLEITUNG (Best Match)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Verworfen</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
