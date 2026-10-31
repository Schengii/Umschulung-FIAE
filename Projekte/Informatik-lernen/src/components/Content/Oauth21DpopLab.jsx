import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import {
  OAUTH_GRANT_TYPES,
  OAUTH21_DISALLOWED_GRANTS,
  evaluateOauth21Flow,
  createMockDpopProof,
  validateDpopProof
} from '../../utils/oauth21DpopEngine';

export default function Oauth21DpopLab() {
  // Grant Evaluation State
  const [selectedGrant, setSelectedGrant] = useState('auth_code_pkce');
  const [usePkce, setUsePkce] = useState(true);
  const [pkceMethod, setPkceMethod] = useState('S256');
  const [useDpop, setUseDpop] = useState(true);
  const [exactRedirectUri, setExactRedirectUri] = useState(true);

  // DPoP Demonstration State
  const [httpMethod, setHttpMethod] = useState('POST');
  const [targetUri, setTargetUri] = useState('https://api.cloud-corp.de/v1/transfer');
  const customThumbprint = 'thumb_jwk_ed25519_99a8b1c';
  const proofJti = 'jti-uuid-4481-992a';
  const [proofAgeSec, setProofAgeSec] = useState(15);
  const [simulatedReplay, setSimulatedReplay] = useState(false);

  // Evaluation results
  const flowEvaluation = useMemo(() => {
    return evaluateOauth21Flow({
      grantType: selectedGrant,
      pkceUsed: usePkce,
      pkceMethod: pkceMethod,
      dpopUsed: useDpop,
      exactRedirectMatch: exactRedirectUri
    });
  }, [selectedGrant, usePkce, pkceMethod, useDpop, exactRedirectUri]);

  // Generated Mock DPoP Proof
  const mockDpopToken = useMemo(() => {
    return createMockDpopProof({
      htm: httpMethod,
      htu: targetUri,
      jktThumbprint: customThumbprint,
      jti: proofJti,
      issuedAtSecAgo: proofAgeSec
    });
  }, [httpMethod, targetUri, customThumbprint, proofJti, proofAgeSec]);

  // DPoP Validation
  const dpopValidation = useMemo(() => {
    const seenJtis = simulatedReplay ? new Set([proofJti]) : new Set();
    return validateDpopProof({
      proof: mockDpopToken,
      expectedHtm: httpMethod,
      expectedHtu: targetUri,
      boundJkt: customThumbprint,
      seenJtis: seenJtis,
      maxAgeSeconds: 300
    });
  }, [mockDpopToken, httpMethod, targetUri, customThumbprint, simulatedReplay, proofJti]);

  return (
    <div className="space-y-8 animate-fadeIn p-4 md:p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              OAuth 2.1 & RFC 9449 DPoP Security Studio
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                IHK & Cloud Sec
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Demonstration von Sender-Constrained Tokens, striktem PKCE-Zwang (S256) und dem Wegfall unsicherer OAuth 2.0 Legacy-Flows.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: OAuth 2.1 Compliance Lab */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                OAuth 2.1 Flow & Profil-Konfigurator
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold ${
                flowEvaluation.isCompliant ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
              }`}>
                Score: {flowEvaluation.score}/100
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Gewählter Grant Type:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(OAUTH_GRANT_TYPES).map(([id, label]) => {
                    const isBanned = OAUTH21_DISALLOWED_GRANTS.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedGrant(id)}
                        className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                          selectedGrant === id
                            ? 'border-cyan-500 bg-cyan-500/10 text-white font-medium shadow'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{label}</span>
                          {isBanned && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-400 border border-rose-800">
                              Deprecated
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Toggles */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-slate-300">Sicherheitsanforderungen & Controls</div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">PKCE verwenden (RFC 7636):</span>
                  <input
                    type="checkbox"
                    checked={usePkce}
                    onChange={(e) => setUsePkce(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                  />
                </div>

                {usePkce && (
                  <div className="flex items-center justify-between text-xs pl-2 border-l-2 border-slate-700">
                    <span className="text-slate-400">PKCE Challenge Method:</span>
                    <select
                      value={pkceMethod}
                      onChange={(e) => setPkceMethod(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                    >
                      <option value="S256">S256 (SHA-256 mandatory)</option>
                      <option value="plain">plain (OAuth 2.1 unzulässig!)</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">DPoP Token Binding (RFC 9449):</span>
                  <input
                    type="checkbox"
                    checked={useDpop}
                    onChange={(e) => setUseDpop(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Striktes Redirect-URI Matching (Exakt):</span>
                  <input
                    type="checkbox"
                    checked={exactRedirectUri}
                    onChange={(e) => setExactRedirectUri(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                  />
                </div>
              </div>

              {/* Evaluation Output */}
              <div className={`p-4 rounded-xl border ${
                flowEvaluation.isCompliant
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {flowEvaluation.isCompliant ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>OAuth 2.1 Konformität bestätigt</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <span>Nicht OAuth 2.1 konform</span>
                    </>
                  )}
                </div>

                {flowEvaluation.violations.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="text-xs font-semibold text-rose-400">Erkannte Verstöße / Risiken:</div>
                    <ul className="text-xs space-y-1 pl-4 list-disc text-rose-300">
                      {flowEvaluation.violations.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {flowEvaluation.recommendations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-cyan-300">Empfehlung: </span>
                    {flowEvaluation.recommendations[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: RFC 9449 DPoP Demonstration */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                RFC 9449 DPoP Proof Validator
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold ${
                dpopValidation.valid ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
              }`}>
                {dpopValidation.valid ? 'PROVED & BOUND' : 'REJECTED (401)'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Request Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">HTTP-Methode (htm):</label>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">DPoP Token Alter (Sekunden):</label>
                  <input
                    type="number"
                    value={proofAgeSec}
                    onChange={(e) => setProofAgeSec(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Resource URI (htu):</label>
                <input
                  type="text"
                  value={targetUri}
                  onChange={(e) => setTargetUri(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              {/* Replay Simulation Switch */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Replay Attacke simulieren (JTI bereits gesehen)</span>
                  <p className="text-slate-400 text-[11px]">Prüft ob der Nonce/JTI-Cache denselben Token abfängt</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulatedReplay(!simulatedReplay)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    simulatedReplay ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {simulatedReplay ? 'Aktiv (Replay!)' : 'Inaktiv'}
                </button>
              </div>

              {/* Live JWT DPoP Header Inspector */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-mono text-cyan-400">DPoP Proof JWT Payload (Decoded)</span>
                  <span className="text-[10px] text-slate-500">RFC 9449 Typ: dpop+jwt</span>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900/60 rounded border border-slate-800/80">
{JSON.stringify(mockDpopToken.payload, null, 2)}
                </pre>
              </div>

              {/* Validation Status message */}
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                dpopValidation.valid ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}>
                {dpopValidation.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold">{dpopValidation.valid ? 'Autorisierung erfolgreich' : 'Autorisierung verweigert'}</div>
                  <div className="text-[11px] opacity-90">{dpopValidation.error || 'DPoP-Signatur und Token-Bindung (JKT) stimmen mit dem Ziel-Endpoint exakt überein.'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Comparison Box */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 shadow-lg">
        <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          IHK & Industry Leitfaden: OAuth 2.0 vs. OAuth 2.1
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <h4 className="font-semibold text-rose-400 mb-1">Verbot von Implicit & ROPC</h4>
            <p className="text-slate-400 leading-relaxed">
              Tokens dürfen nicht mehr in URL-Fragmenten (Hash `#access_token=...`) zurückgegeben werden (Referrer Leaks). Nutzerpasswörter dürfen nie direkt an die App gehen.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <h4 className="font-semibold text-amber-400 mb-1">Verpflichtendes PKCE mit S256</h4>
            <p className="text-slate-400 leading-relaxed">
              Jeder Authorization Code Flow muss PKCE mit dem SHA-256 Hash-Verfahren nutzen. Selbst für vertrauliche Clients (Backend-Server) ist PKCE nun Standard.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <h4 className="font-semibold text-emerald-400 mb-1">Sender-Constrained Tokens (DPoP)</h4>
            <p className="text-slate-400 leading-relaxed">
              Klassische Bearer-Tokens können bei Diebstahl frei missbraucht werden. DPoP bindet jeden Request kryptografisch an einen privaten Client-Schlüssel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
