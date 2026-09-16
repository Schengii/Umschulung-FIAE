import React, { useState, useMemo } from 'react';
import { Shield, Key, AlertTriangle, CheckCircle2, Lock, ArrowDown, RefreshCw, Zap, Bug, Globe } from 'lucide-react';
import { 
  validateDnssecChain, 
  verifyNsec3Proof, 
  simulateKaminskyAttack 
} from '../../utils/dnssecValidationEngine';
import { useStore } from '../../store/useStore';

export default function DnssecValidationLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('chain'); // 'chain' | 'nsec3' | 'kaminsky' | 'knowledge'

  // Tamper toggles
  const [tamperDomainDs, setTamperDomainDs] = useState(false);
  const [tamperZsk, setTamperZsk] = useState(false);
  const [expireRrsig, setExpireRrsig] = useState(false);
  const [tamperRecordData, setTamperRecordData] = useState(false);

  // NSEC3 state
  const [nsec3Query, setNsec3Query] = useState('dashboard.example.de');
  const [nsec3Salt, setNsec3Salt] = useState('B4F1');

  // Kaminsky state
  const [kaminskyDnssec, setKaminskyDnssec] = useState(true);
  const [kaminskyResult, setKaminskyResult] = useState(null);

  // Reward state
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const chainResult = useMemo(() => {
    return validateDnssecChain({
      tamperDomainDs,
      tamperZsk,
      expireRrsig,
      tamperRecordData
    });
  }, [tamperDomainDs, tamperZsk, expireRrsig, tamperRecordData]);

  const nsec3Result = useMemo(() => {
    return verifyNsec3Proof(nsec3Query, nsec3Salt);
  }, [nsec3Query, nsec3Salt]);

  const handleRunKaminsky = () => {
    const res = simulateKaminskyAttack({ dnssecEnabled: kaminskyDnssec });
    setKaminskyResult(res);
  };

  const handleClaimReward = () => {
    if (!rewardClaimed) {
      awardXP(65);
      setRewardClaimed(true);
    }
  };

  const resetTampering = () => {
    setTamperDomainDs(false);
    setTamperZsk(false);
    setExpireRrsig(false);
    setTamperRecordData(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Netzwerk & Kryptographie
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              RFC 4033 / 4034 / 4035
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Globe className="w-8 h-8 text-emerald-400" />
            DNSSEC Cryptographic Chain of Trust & RRSIG Validation Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Hierarchische Validierung vom Root-Vertrauensanker (.) über TLDs (.de) bis zur Domain (example.de). Interaktive RRSIG-Signaturen, NSEC3 Denial-of-Existence und Kaminsky-Angriffsabwehr.
          </p>
        </div>

        <button
          onClick={handleClaimReward}
          disabled={rewardClaimed}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg ${
            rewardClaimed 
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-default'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          {rewardClaimed ? '✓ 65 XP Eingelöst' : '+65 XP Belohnung'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-6 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('chain')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'chain' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Chain of Trust Explorer
        </button>
        <button
          onClick={() => setActiveTab('nsec3')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'nsec3' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          NSEC3 Denial of Existence
        </button>
        <button
          onClick={() => setActiveTab('kaminsky')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'kaminsky' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Bug className="w-4 h-4" />
          Kaminsky Cache Poisoning Sandbox
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'knowledge' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          IHK-Prüfungswissen & RFC-Guide
        </button>
      </div>

      {/* Tab 1: Chain of Trust */}
      {activeTab === 'chain' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Angriffs- & Fehler-Injektion
              </h2>
              <button 
                onClick={resetTampering}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Manipulieren Sie gezielt kryptografische Hashes und Signaturen, um zu beobachten, wie DNSSEC-validierende Resolver kompromittierte Records abweisen.
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-800 transition border border-slate-700/50">
                <input
                  type="checkbox"
                  checked={tamperDomainDs}
                  onChange={e => setTamperDomainDs(e.target.checked)}
                  className="mt-1 rounded text-emerald-500 focus:ring-emerald-400"
                />
                <div>
                  <div className="text-sm font-medium text-slate-200">Parent DS-Hash manipulieren</div>
                  <div className="text-xs text-slate-400">Trennt die Kette zwischen .de TLD und example.de KSK</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-800 transition border border-slate-700/50">
                <input
                  type="checkbox"
                  checked={tamperZsk}
                  onChange={e => setTamperZsk(e.target.checked)}
                  className="mt-1 rounded text-emerald-500 focus:ring-emerald-400"
                />
                <div>
                  <div className="text-sm font-medium text-slate-200">ZSK-Signatur durch KSK ungültig</div>
                  <div className="text-xs text-slate-400">Simuliert gefälschten oder unautorisierten Zone Signing Key</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-800 transition border border-slate-700/50">
                <input
                  type="checkbox"
                  checked={expireRrsig}
                  onChange={e => setExpireRrsig(e.target.checked)}
                  className="mt-1 rounded text-emerald-500 focus:ring-emerald-400"
                />
                <div>
                  <div className="text-sm font-medium text-slate-200">RRSIG Signatur abgelaufen</div>
                  <div className="text-xs text-slate-400">Verhindert Replay alter DNS-Antworten nach Ablaufzeit</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-800 transition border border-slate-700/50">
                <input
                  type="checkbox"
                  checked={tamperRecordData}
                  onChange={e => setTamperRecordData(e.target.checked)}
                  className="mt-1 rounded text-emerald-500 focus:ring-emerald-400"
                />
                <div>
                  <div className="text-sm font-medium text-slate-200">A-Record Daten manipulieren</div>
                  <div className="text-xs text-slate-400">Angreifer fälscht IP ohne passende kryptografische Signatur</div>
                </div>
              </label>
            </div>

            {/* Overall Verdict Badge */}
            <div className={`p-4 rounded-xl border ${
              chainResult.status === 'SECURE'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                {chainResult.status === 'SECURE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                Status: {chainResult.status} ({chainResult.dnssecAlert})
              </div>
              <p className="text-xs mt-1.5 opacity-90">
                {chainResult.status === 'SECURE'
                  ? `Authentic Data (AD=1) bestätigt. IP ${chainResult.resolvedIp} wird an Client übergeben.`
                  : chainResult.bogusReason}
              </p>
            </div>
          </div>

          {/* Hierarchical Chain Diagram */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-semibold flex items-center gap-2 text-slate-200">
              <Globe className="w-4 h-4 text-emerald-400" />
              Hierarchische Vertrauenskette (Chain of Trust)
            </h2>

            <div className="space-y-4 relative">
              {chainResult.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`p-4 rounded-xl border transition-all ${
                    step.valid 
                      ? 'bg-slate-800/80 border-emerald-500/30' 
                      : 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/20'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-700 text-slate-300">
                          {step.level}
                        </span>
                        <span className="text-sm font-semibold text-slate-100">
                          {step.step}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                        step.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {step.description}
                    </p>
                  </div>

                  {idx < chainResult.steps.length - 1 && (
                    <div className="flex justify-center my-1.5">
                      <ArrowDown className={`w-4 h-4 ${step.valid ? 'text-emerald-500/60' : 'text-rose-500/60'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NSEC3 Denial of Existence */}
      {activeTab === 'nsec3' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              NSEC3 Proof & Anti-Zone-Walking Simulator
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Klassisches NSEC listete den alphabetisch nächsten Hostnamen im Klartext auf, wodurch Angreifer mit einem einfachen Skript alle Hosts einer Firma auslesen konnten (Zone Walking). 
              <strong> NSEC3 (RFC 5155)</strong> löst dies durch gehashte und gesalzene Intervalle.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-300">Angefragte Subdomain</label>
                <input
                  type="text"
                  value={nsec3Query}
                  onChange={e => setNsec3Query(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="z.B. internal.example.de"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Salt (Hex-Wert)</label>
                <input
                  type="text"
                  value={nsec3Salt}
                  onChange={e => setNsec3Salt(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="z.B. B4F1"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <div className="text-xs font-mono text-slate-400">Berechneter Hash (SHA-1 / Salted):</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                {nsec3Result.hashedQuery}.example.de
              </div>
              <div className="text-xs text-slate-300 pt-1">
                {nsec3Result.isExisting ? (
                  <span className="text-emerald-400 font-semibold">✓ Exakte Übereinstimmung in Zone gefunden (Host existiert).</span>
                ) : (
                  <span className="text-amber-400 font-semibold">✓ Kryptografischer NXDOMAIN-Beweis via abdeckendem NSEC3-Intervall:</span>
                )}
              </div>
              {nsec3Result.coveringInterval && (
                <div className="text-xs font-mono bg-slate-900 p-2 rounded text-slate-300 border border-slate-700/50">
                  {nsec3Result.coveringInterval.proofText}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Öffentliche NSEC3 Hash-Kette der Beispiel-Zone</h3>
            <p className="text-xs text-slate-400">
              Ein Resolver beweist Nichtexistenz, indem er das NSEC3-Record zurückgibt, dessen Intervall den Hash der angefragten Domäne einschließt:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex justify-between">
                <span>2T9GK98.example.de (api)</span>
                <span className="text-emerald-400">--&gt; 7K1QP23</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex justify-between">
                <span>7K1QP23.example.de (mail)</span>
                <span className="text-emerald-400">--&gt; B8X4M91</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex justify-between">
                <span>B8X4M91.example.de (vpn)</span>
                <span className="text-emerald-400">--&gt; F9Z2L04</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex justify-between">
                <span>F9Z2L04.example.de (www)</span>
                <span className="text-emerald-400">--&gt; 2T9GK98 (Wrap)</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
              {nsec3Result.antiZoneWalkingProtection}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kaminsky Attack Simulator */}
      {activeTab === 'kaminsky' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-400" />
                Dan Kaminsky DNS Cache Poisoning Angriff (2008) vs. DNSSEC
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Der Kaminsky-Bug nutzt gefälschte Glue-Records und Zufalls-Subdomains aus, um die 16-Bit Transaction ID des Resolvers im Millisekundenbereich zu erraten.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold bg-slate-800 px-3 py-2 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={kaminskyDnssec}
                  onChange={e => setKaminskyDnssec(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                <span>DNSSEC Validierung aktivieren</span>
              </label>

              <button
                onClick={handleRunKaminsky}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-rose-900/30"
              >
                <Bug className="w-3.5 h-3.5" />
                Angriff ausführen
              </button>
            </div>
          </div>

          {kaminskyResult && (
            <div className={`p-5 rounded-2xl border ${
              kaminskyResult.poisoned 
                ? 'bg-rose-950/40 border-rose-500 text-rose-200' 
                : 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                {kaminskyResult.poisoned ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                Ergebnis: {kaminskyResult.resolverStatus} (Response: {kaminskyResult.responseCode})
              </div>
              <p className="text-xs mt-2 leading-relaxed opacity-95">
                {kaminskyResult.message}
              </p>
              {kaminskyResult.resultIp && (
                <div className="mt-3 inline-block px-3 py-1 bg-slate-900 rounded font-mono text-xs text-rose-400 border border-rose-600/40">
                  Vergifteter Resolver liefert bösartige IP: {kaminskyResult.resultIp}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
              <div className="font-semibold text-rose-300">Ohne DNSSEC (Standard UDP Port 53)</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Nur 16-Bit Transaction ID (65.536 Möglichkeiten) als Schutz.</li>
                <li>Angreifer bombardiert Resolver mit Tausenden gefälschten Antworten auf einmal.</li>
                <li>Erfolg führt zu vollständiger Umleitung von E-Mails und Bankverkehr (Man-in-the-Middle).</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
              <div className="font-semibold text-emerald-300">Mit DNSSEC (Cryptographic Chain)</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Erratene Transaction IDs sind wirkungslos: RRSIG-Signatur muss zwingend mit ZSK übereinstimmen.</li>
                <li>Gefälschte DNS-Pakete ohne privaten Schlüssel werden sofort verworfen.</li>
                <li>Resolver schützt Endnutzer durch Blockade (`SERVFAIL`) vor infizierten Adressen.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Knowledge */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2">
              <Key className="w-4 h-4" /> KSK vs. ZSK (Schlüsseltrennung)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>KSK (Key Signing Key, Flag 257)</strong>: Signiert ausschließlich den DNSKEY-RRset der eigenen Zone. Sein SHA-256 Digest wird in der übergeordneten Parent-Zone als DS-Record hinterlegt. KSKs wechseln selten (z.B. alle 1–2 Jahre).
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>ZSK (Zone Signing Key, Flag 256)</strong>: Signiert alle Nutzdaten-Records (A, AAAA, MX, TXT). Er kann häufiger gewechselt werden (z.B. monatlich), ohne dass der Registrar oder die TLD benachrichtigt werden muss.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-blue-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> DS-Record & Vertrauensanker
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Der <strong>DS (Delegation Signer) Record</strong> ist die kryptografische Brücke zwischen Vater- und Kindzone. Er enthält: Key-Tag, Algorithmus (z.B. 13 = ECDSA P-256), Digest-Typ (2 = SHA-256) und den kryptografischen Hash des öffentlichen KSKs.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stimmt der Hash nicht überein (z.B. nach unvollständigem Key-Rollover), markiert der Resolver die Zone als <strong>BOGUS</strong> und blockiert alle Anfragen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
