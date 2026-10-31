import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Key, Globe, Layers, 
  ArrowRight, Award, Lock
} from 'lucide-react';
import { validateCertificateChain } from '../../utils/pkiCertificateEngine';

export default function PkiCertificateLab({ onAwardXP }) {
  const [domainInput, setDomainInput] = useState('shop.my-company.de');
  const [isLeafExpired, setIsLeafExpired] = useState(false);
  const [isLeafRevoked, setIsLeafRevoked] = useState(false);
  const [breakChain, setBreakChain] = useState(false);
  const [hasClaimedXp, setHasClaimedXp] = useState(false);

  const chain = [
    {
      id: 'leaf',
      subject: 'CN=*.my-company.de',
      issuer: breakChain ? 'Fake Untrusted CA' : 'Enterprise Intermediate CA v3',
      serialNumber: '7F:2A:9C:11:45',
      validFrom: '2025-01-01',
      validTo: isLeafExpired ? '2025-12-31' : '2027-12-31',
      san: ['*.my-company.de', 'my-company.de'],
      isCa: false,
      isSelfSigned: false,
      isRevoked: isLeafRevoked
    },
    {
      id: 'inter',
      subject: 'Enterprise Intermediate CA v3',
      issuer: 'Global Trusted Root CA G1',
      serialNumber: '02:4B:88:FF',
      validFrom: '2022-01-01',
      validTo: '2032-01-01',
      san: [],
      isCa: true,
      isSelfSigned: false,
      isRevoked: false
    },
    {
      id: 'root',
      subject: 'Global Trusted Root CA G1',
      issuer: 'Global Trusted Root CA G1',
      serialNumber: '01:00:AA',
      validFrom: '2020-01-01',
      validTo: '2040-01-01',
      san: [],
      isCa: true,
      isSelfSigned: true,
      isRevoked: false
    }
  ];

  const validation = validateCertificateChain(chain, domainInput, new Date('2026-09-26T12:00:00Z'));

  const handleClaimXp = () => {
    if (!hasClaimedXp && validation.isValid) {
      setHasClaimedXp(true);
      if (onAwardXP) {
        onAwardXP(60, 'pki_chain_validator');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Lock className="w-4 h-4" />
              <span>TLS / PKI Sicherheitsarchitektur (RFC 5280)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              X.509 PKI & Certificate Chain Validator Studio
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm">
              Visuelle Validierung kryptographischer Vertrauensketten (Root CA $\to$ Intermediate $\to$ End-Entity/Leaf),
              Hostname-Matching (SAN), Gültigkeitszeiträume und Revocation-Status (CRL / OCSP).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-mono">
              RFC 5280 & RFC 6960 OCSP
            </span>
          </div>
        </div>
      </div>

      {/* Domain-Input & Stör-Simulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Zu prüfende Host-URL / Domain:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                placeholder="z.B. shop.my-company.de"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white"
              />
              <button
                onClick={() => setDomainInput('untrusted-phishing.org')}
                className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              >
                Mismatch Test
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              PKI-Fehlerszenarien simulieren:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsLeafExpired(!isLeafExpired)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  isLeafExpired ? 'bg-rose-600/30 border-rose-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                {isLeafExpired ? '⚠️ Ablaufdatum: Abgelaufen' : 'Ablaufdatum manipulieren'}
              </button>
              <button
                onClick={() => setIsLeafRevoked(!isLeafRevoked)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  isLeafRevoked ? 'bg-rose-600/30 border-rose-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                {isLeafRevoked ? '⚠️ CRL: Revoked' : 'Zertifikat widerrufen (OCSP)'}
              </button>
              <button
                onClick={() => setBreakChain(!breakChain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  breakChain ? 'bg-rose-600/30 border-rose-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                {breakChain ? '⚠️ Kettenbruch aktiv' : 'Kettenbruch (Untrusted CA)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chain-of-Trust Baum */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Kryptographische Vertrauenskette (Top-Down):
        </h2>

        {/* Root CA */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 mt-1">
            <Key className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">1. Root Certificate Authority (Trust Anchor)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                Self-Signed & CA:TRUE
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">{chain[2].subject}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Gültig: {chain[2].validFrom} bis {chain[2].validTo} | Serial: {chain[2].serialNumber}
            </div>
          </div>
        </div>

        <div className="flex justify-center text-slate-600">
          <ArrowRight className="w-5 h-5 rotate-90" />
        </div>

        {/* Intermediate CA */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 mt-1">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">2. Intermediate CA (Ausstellende Stelle)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                Signed by Root | CA:TRUE
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">{chain[1].subject}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Ausgestellt für Sub-CAs & Server-Zertifikate zur Schonung des Root-Private-Keys.
            </div>
          </div>
        </div>

        <div className="flex justify-center text-slate-600">
          <ArrowRight className="w-5 h-5 rotate-90" />
        </div>

        {/* Leaf / Server-Zertifikat */}
        <div className={`p-4 rounded-xl border flex items-start gap-4 transition ${
          validation.isValid 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-rose-950/20 border-rose-500/40'
        }`}>
          <div className={`p-2.5 rounded-xl mt-1 ${validation.isValid ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'}`}>
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">3. End-Entity / Leaf-Zertifikat (Webserver)</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                validation.isValid ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {validation.isValid ? 'Zertifikat Gültig' : 'Ungültig'}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">{chain[0].subject}</div>
            <div className="text-xs text-cyan-300 font-mono mt-1">
              SAN (Subject Alternative Names): {chain[0].san.join(', ')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Gültig bis: {chain[0].validTo} | Status: {chain[0].isRevoked ? '❌ WIDERObserver / Revoked' : '✓ Aktiv (OCSP Good)'}
            </div>
          </div>
        </div>
      </div>

      {/* Validierungs-Ergebnis */}
      <div className={`p-5 rounded-xl border ${
        validation.isValid
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
          : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {validation.isValid ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-base mb-1">
                {validation.isValid 
                  ? 'Zertifikatskette vollständig vertrauenswürdig (Trust Anchor OK)' 
                  : 'Sicherheitsfehler bei der Kettenprüfung:'}
              </div>
              {validation.isValid ? (
                <p className="text-xs text-emerald-300">
                  Die Kette wurde über alle 3 Hops erfolgreich verifiziert. Der Browser akzeptiert die TLS-Verbindung zu "{domainInput}".
                </p>
              ) : (
                <ul className="text-xs space-y-1 list-disc list-inside text-rose-300">
                  {validation.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {validation.isValid && (
            <button
              onClick={handleClaimXp}
              disabled={hasClaimedXp}
              className={`px-4 py-2 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                hasClaimedXp 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{hasClaimedXp ? 'Zertifiziert ✓' : 'PKI Meister (+60 XP)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
