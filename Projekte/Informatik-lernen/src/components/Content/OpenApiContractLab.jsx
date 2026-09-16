import React, { useState, useMemo } from 'react';
import { FileCode, CheckCircle2, AlertTriangle, Copy, Check, Zap, Layers, Code2 } from 'lucide-react';
import { 
  SAMPLE_OPENAPI_SPEC_V1, 
  validatePayloadAgainstSchema, 
  detectContractBreakingChanges, 
  generateMockPayload, 
  generateTypeScriptDto 
} from '../../utils/openApiContractEngine';
import { useStore } from '../../store/useStore';

export default function OpenApiContractLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('validator'); // 'validator' | 'breaking' | 'codegen' | 'guide'

  // Validator State
  const orderSchema = SAMPLE_OPENAPI_SPEC_V1.paths['/api/v1/orders'].post.requestBody.schema;
  const [jsonInput, setJsonInput] = useState(JSON.stringify({
    customerId: 'CUST-8812',
    amount: 129.50,
    currency: 'EUR',
    items: ['ThinkPad Laptop Bag', 'USB-C Dock 100W'],
    emailNotification: true
  }, null, 2));

  // Breaking Change Scenario
  const [breakingScenario, setBreakingScenario] = useState('breaking_required'); // 'breaking_required' | 'breaking_type' | 'safe_field'

  const specV2 = useMemo(() => {
    const clone = JSON.parse(JSON.stringify(SAMPLE_OPENAPI_SPEC_V1));
    const reqSchema = clone.paths['/api/v1/orders'].post.requestBody.schema;

    if (breakingScenario === 'breaking_required') {
      reqSchema.required.push('taxIdentificationNumber');
      reqSchema.properties.taxIdentificationNumber = { type: 'string' };
    } else if (breakingScenario === 'breaking_type') {
      reqSchema.properties.amount.type = 'string'; // Breaking type change from number to string!
    } else if (breakingScenario === 'safe_field') {
      reqSchema.properties.discountCoupon = { type: 'string' }; // Optional new field -> Non-breaking
    }
    return clone;
  }, [breakingScenario]);

  const diffResult = useMemo(() => {
    return detectContractBreakingChanges(SAMPLE_OPENAPI_SPEC_V1, specV2);
  }, [specV2]);

  // Parse JSON and Validate
  const validationResult = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      return {
        parseError: null,
        ...validatePayloadAgainstSchema(parsed, orderSchema)
      };
    } catch (err) {
      return {
        parseError: `JSON Syntaxfehler: ${err.message}`,
        valid: false,
        errors: []
      };
    }
  }, [jsonInput, orderSchema]);

  // Code Gen
  const generatedMock = useMemo(() => generateMockPayload(orderSchema), [orderSchema]);
  const generatedTs = useMemo(() => generateTypeScriptDto('CreateOrderRequestDto', orderSchema), [orderSchema]);

  const [copiedTs, setCopiedTs] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const handleCopyTs = () => {
    navigator.clipboard.writeText(generatedTs);
    setCopiedTs(true);
    setTimeout(() => setCopiedTs(false), 2000);
  };

  const handleClaimReward = () => {
    if (!rewardClaimed) {
      awardXP(65);
      setRewardClaimed(true);
    }
  };

  const handleLoadSample = (type) => {
    if (type === 'valid') {
      setJsonInput(JSON.stringify({
        customerId: 'CUST-9901',
        amount: 45.00,
        currency: 'EUR',
        items: ['Keychron K2 Keyboard'],
        emailNotification: true
      }, null, 2));
    } else {
      // Invalid sample
      setJsonInput(JSON.stringify({
        customerId: 'X', // Zu kurz
        amount: -5,      // Negativ
        currency: 'GBP', // Nicht im Enum ['EUR', 'USD', 'CHF']
        // items fehlt komplett
        emailNotification: 'yes' // Falscher Typ (String statt Boolean)
      }, null, 2));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30">
              API Architecture & Quality
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
              OpenAPI 3.1 & JSON Schema 2020-12
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FileCode className="w-8 h-8 text-violet-400" />
            OpenAPI 3.1 & JSON-Schema Contract Testing Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Interaktiver REST-API Contract Validator, automatische Erkennung von Breaking Changes (Rückwärtskompatibilität), TypeScript DTO Export und Test-Mock-Generierung.
          </p>
        </div>

        <button
          onClick={handleClaimReward}
          disabled={rewardClaimed}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg ${
            rewardClaimed 
              ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30 cursor-default'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-900/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          {rewardClaimed ? '✓ 65 XP Eingelöst' : '+65 XP Belohnung'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 my-6 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('validator')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'validator' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Live Contract Validator
        </button>
        <button
          onClick={() => setActiveTab('breaking')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'breaking' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Breaking Change Analyzer
        </button>
        <button
          onClick={() => setActiveTab('codegen')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'codegen' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          TypeScript & Mock Generator
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'guide' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          OpenAPI 3.1 Standards-Guide
        </button>
      </div>

      {/* Tab 1: Live Contract Validator */}
      {activeTab === 'validator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-200">HTTP Request Payload (POST /api/v1/orders)</h2>
                <p className="text-xs text-slate-400 mt-0.5">Bearbeite das JSON zur Echtzeitprüfung gegen das Schema</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadSample('valid')}
                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold"
                >
                  Gültig
                </button>
                <button
                  onClick={() => handleLoadSample('invalid')}
                  className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold"
                >
                  Ungültig
                </button>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              rows={14}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500 leading-relaxed"
            />
          </div>

          {/* Validation Audit Results */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-violet-400" />
              Contract Verification Status
            </h2>

            {validationResult.parseError ? (
              <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 font-mono">
                {validationResult.parseError}
              </div>
            ) : validationResult.valid ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Contract erfüllt (100% Schema-Konform)
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Alle Pflichtfelder (<code>customerId</code>, <code>amount</code>, <code>currency</code>, <code>items</code>) vorhanden. Typen, Grenzwerte und Enum-Werte stimmen mit der OpenAPI-Spezifikation überein.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    Contract-Verletzung erkannt ({validationResult.errors.length} Fehler)
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Der Client-Request verletzt die vereinbarte API-Schnittstelle und wird vom Server mit HTTP 422 Unprocessable Entity abgewiesen.
                  </p>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {validationResult.errors.map((err, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/80 border border-rose-500/30 rounded-xl text-xs space-y-0.5">
                      <div className="flex justify-between font-mono font-bold text-rose-400">
                        <span>Feld: {err.field}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 rounded border border-rose-800">
                          {err.rule}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{err.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schema Definition Reference */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2">Erwartetes Schema (OpenAPI 3.1):</div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 max-h-40 overflow-y-auto">
                {JSON.stringify(orderSchema, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Breaking Change Analyzer */}
      {activeTab === 'breaking' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-200">
                Semantische API-Versions-Evolution (v1.0.0 vs. v2.0.0)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Erkennt automatisch, ob API-Änderungen bestehende Clients brechen (Breaking Change) oder abwärtskompatibel sind.
              </p>
            </div>

            <select
              value={breakingScenario}
              onChange={e => setBreakingScenario(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium"
            >
              <option value="breaking_required">Szenario: Neues Pflichtfeld taxIdentificationNumber (BREAKING)</option>
              <option value="breaking_type">Szenario: Datentyp von amount auf string geändert (BREAKING)</option>
              <option value="safe_field">Szenario: Neues optionales Feld discountCoupon (SAFE)</option>
            </select>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            diffResult.isCompatible 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {diffResult.isCompatible ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <div>
                <div className="text-sm font-bold">
                  {diffResult.isCompatible ? 'Vollständig rückwärtskompatibel (Non-Breaking)' : 'Breaking Changes erkannt! Major Version Bump erforderlich!'}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {diffResult.breakingCount} Breaking Change(s), {diffResult.nonBreakingCount} abwärtskompatible Änderung(en)
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              diffResult.isCompatible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {diffResult.isCompatible ? 'SEVERITY: NONE' : 'SEVERITY: CRITICAL'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300">Änderungs-Protokoll:</div>
            {diffResult.changes.map((c, idx) => (
              <div key={idx} className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono text-slate-400 text-[11px]">{c.location}</div>
                  <div className="font-medium text-slate-200 mt-0.5">{c.description}</div>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  c.type === 'BREAKING' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {c.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Codegen */}
      {activeTab === 'codegen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-200">Generiertes TypeScript DTO Interface</h3>
              <button
                onClick={handleCopyTs}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition"
              >
                {copiedTs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTs ? 'Kopiert!' : 'Kopieren'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-violet-300 leading-relaxed overflow-x-auto">
              {generatedTs}
            </pre>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Automatischer Schema-konformer Test-Mock</h3>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
              {JSON.stringify(generatedMock, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Guide */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-violet-400">OpenAPI 3.1 Neuheiten (RFC Schema 2020-12)</h3>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
              <li><strong>100% JSON-Schema Kompatibilität</strong>: Kein modifiziertes Teilschema mehr. Alle Standard JSON-Schema Schlüsselwörter (`prefixItems`, `contains`, `$defs`) sind nativ gültig.</li>
              <li><strong>Typ-Arrays statt nullable</strong>: <code>type: ['string', 'null']</code> ersetzt das alte <code>nullable: true</code>.</li>
              <li><strong>Webhooks als First-Class Citizens</strong>: Asynchrone Callback-APIs können direkt im Root-Objekt spezifiziert werden.</li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-emerald-400">Best Practices im IHK-Abschlussprojekt</h3>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
              <li><strong>Contract-First Ansatz</strong>: Spezifikation der Schnittstelle vor Beginn der Backend-Implementierung spart Refactorings.</li>
              <li><strong>Automatisierte CI/CD Contract Tests</strong>: Tools wie Spectral oder Schemathesis prüfen in Pipelines auf Breaking Changes.</li>
              <li><strong>SemVer Konformität</strong>: Breaking Changes verlangen nach Semantic Versioning immer ein Inkrement der Hauptversionsnummer (`v1` zu `v2`).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
