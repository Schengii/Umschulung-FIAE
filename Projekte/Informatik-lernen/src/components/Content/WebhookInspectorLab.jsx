import React, { useState } from 'react';

import { Radio, Send, Activity, Award, Globe } from 'lucide-react';
import { WEBHOOK_PRESETS, simulateWebhookDispatch } from '../../utils/webhookSimulator';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function WebhookInspectorLab() {
  const { awardXP } = useStore();

  const [selectedPresetId, setSelectedPresetId] = useState(WEBHOOK_PRESETS[0].id);
  const preset = WEBHOOK_PRESETS.find(p => p.id === selectedPresetId) || WEBHOOK_PRESETS[0];

  const [endpoint, setEndpoint] = useState(preset.endpoint);
  const [headersJson, setHeadersJson] = useState(() => JSON.stringify(preset.headers, null, 2));
  const [bodyJson, setBodyJson] = useState(() => JSON.stringify(preset.body, null, 2));

  const [logs, setLogs] = useState([]);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleSelectPreset = (pId) => {
    const p = WEBHOOK_PRESETS.find(pr => pr.id === pId);
    if (p) {
      setSelectedPresetId(p.id);
      setEndpoint(p.endpoint);
      setHeadersJson(JSON.stringify(p.headers, null, 2));
      setBodyJson(JSON.stringify(p.body, null, 2));
      soundManager.playSFX('click');
    }
  };

  const handleDispatch = () => {
    let parsedHeaders = {};
    let parsedBody = {};

    try {
      parsedHeaders = JSON.parse(headersJson);
      parsedBody = JSON.parse(bodyJson);
    } catch (err) {
      soundManager.playSFX('error');
      alert('JSON Syntax Fehler in Headers oder Body: ' + err.message);
      return;
    }

    const res = simulateWebhookDispatch({
      endpoint,
      service: preset.service,
      headers: parsedHeaders,
      body: parsedBody
    });

    setLogs(prev => [res, ...prev]);
    setSelectedLog(res);
    soundManager.playSFX('success');
    if (!xpClaimed) {
      setXpClaimed(true);
      awardXP(35, 'api_mock_master');
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                REST &amp; Event-Driven Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +35 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Radio className="w-8 h-8 text-blue-400" />
              REST API Webhook Inspector &amp; Mock Server
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Sende und inspiziere eingehende HTTP-Webhooks (GitHub, Stripe) mit Header-Signaturen, JSON-Payloads und Latenz-Logging.
            </p>
          </div>

          <button
            onClick={() => { if (!xpClaimed) { setXpClaimed(true); awardXP(35, 'api_mock_master'); } }}
            disabled={xpClaimed}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shrink-0"
          >
            <Award className="w-4 h-4" /> {xpClaimed ? 'XP gesichert!' : 'Webhook XP'}
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {WEBHOOK_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p.id)}
            className={`p-4 rounded-xl border text-left transition ${
              selectedPresetId === p.id
                ? 'bg-blue-950/80 border-blue-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-blue-400">{p.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{p.service}</span>
            </div>
            <div className="font-mono text-xs text-slate-400">Endpoint: {p.endpoint}</div>
          </button>
        ))}
      </div>

      {/* Dispatcher Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Webhook Payload Config */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Webhook Konfiguration
            </h2>
            <button
              onClick={handleDispatch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              Webhook Senden
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Ziel-Endpoint:</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-blue-300 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">HTTP Request Headers (JSON):</label>
              <textarea
                value={headersJson}
                onChange={(e) => setHeadersJson(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Payload Body (JSON):</label>
              <textarea
                value={bodyJson}
                onChange={(e) => setBodyJson(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Logs & Inspection */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Empfangene Webhook Requests ({logs.length})
              </h2>
              {logs.length > 0 && (
                <button onClick={handleClearLogs} className="text-xs text-slate-400 hover:text-slate-200">
                  Logs leeren
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-950 rounded-xl border border-slate-800">
                Warte auf eingehende Webhook-Anfragen... Klicke auf "Webhook Senden".
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto mb-4 pr-1">
                {logs.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedLog(req)}
                    className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition flex items-center justify-between ${
                      selectedLog?.id === req.id
                        ? 'bg-blue-950/80 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {req.statusCode} {req.statusText}
                      </span>
                      <span>{req.endpoint}</span>
                    </div>
                    <span className="text-slate-500">{req.durationMs} ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Request Detail Inspector */}
          {selectedLog && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
              <span className="font-bold text-blue-400 block">Inspektor: {selectedLog.id}</span>
              <pre className="p-2 bg-slate-900 rounded text-slate-300 text-[11px] overflow-x-auto max-h-36">
                {JSON.stringify(selectedLog.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
