import React, { useState, useEffect } from 'react';

import { Bluetooth, Play, Pause, Activity, Battery, Thermometer, Droplet, Heart, Layers } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  BLE_SERVICES, 
  generateSensorPacket 
} from '../../utils/bleSensorEngine';
import { soundManager } from '../../utils/audioSystem';
import { useStore } from '../../store/useStore';

export default function BleSensorSimulatorLab() {
  const { awardXP } = useStore();

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState(() => [generateSensorPacket()]);
  const [xpClaimed, setXpClaimed] = useState(false);
  const currentPacket = telemetryHistory[telemetryHistory.length - 1];

  // Stream simulation effect
  useEffect(() => {
    let interval = null;
    if (isConnected && isStreaming) {
      interval = setInterval(() => {
        const nextPacket = generateSensorPacket(
          currentPacket?.temperature || 22.5,
          currentPacket?.humidity || 48,
          currentPacket?.heartRate || 72,
          currentPacket?.battery || 95
        );
        setTelemetryHistory(prev => [...prev.slice(-15), nextPacket]);
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, isStreaming, currentPacket]);

  const handleToggleConnect = () => {
    if (!isConnected) {
      setIsConnected(true);
      setIsStreaming(true);
      soundManager.playSFX('success');
      if (!xpClaimed) {
        setXpClaimed(true);
        awardXP(35, 'ble_sensor_master');
      }
    } else {
      setIsConnected(false);
      setIsStreaming(false);
      soundManager.playSFX('click');
    }
  };

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
    soundManager.playSFX('click');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-cyan-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                IoT &amp; Bluetooth Low Energy (BLE)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                +35 XP
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Bluetooth className="w-8 h-8 text-cyan-400" />
              Bluetooth Low Energy (BLE) Sensor Simulator
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              Simuliere einen BLE GATT-Server (Generic Attribute Profile), lese Services &amp; Characteristics aus und dekodiere Sensor-Telemetrie.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleConnect}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
                isConnected
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              <Bluetooth className="w-4 h-4" />
              {isConnected ? 'Verbindung trennen' : 'Sensor Verbinden (GATT)'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Temperatur</span>
            <span className="text-xl font-bold text-white font-mono">
              {isConnected ? `${currentPacket.temperature} °C` : '-- °C'}
            </span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-lg">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Luftfeuchtigkeit</span>
            <span className="text-xl font-bold text-cyan-300 font-mono">
              {isConnected ? `${currentPacket.humidity} %` : '-- %'}
            </span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-lg">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Herzfrequenz</span>
            <span className="text-xl font-bold text-rose-300 font-mono">
              {isConnected ? `${currentPacket.heartRate} bpm` : '-- bpm'}
            </span>
          </div>
        </div>

        {/* Battery & RSSI */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Battery className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Akku / RSSI</span>
            <span className="text-sm font-bold text-emerald-300 font-mono">
              {isConnected ? `${currentPacket.battery}% (${currentPacket.rssi} dBm)` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* GATT Services Explorer & Live Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GATT Profile Structure */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            GATT Server Profil &amp; UUID-Struktur
          </h2>

          <div className="space-y-3">
            {BLE_SERVICES.map((srv) => (
              <div key={srv.uuid} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-300">{srv.name}</span>
                  <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    UUID: {srv.uuid}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{srv.description}</p>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  {srv.characteristics.map((chr) => (
                    <div key={chr.uuid} className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-300">↳ {chr.name} ({chr.uuid})</span>
                      <span className="text-slate-500">[{chr.properties.join(', ')}]</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Raw Byte Inspector */}
          {isConnected && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs font-mono">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Rohdaten-Byte-Paket (0x2A6E):</span>
              <span className="text-cyan-400 font-bold">{currentPacket.rawHex}</span>
            </div>
          )}
        </div>

        {/* Realtime Telemetry Graph */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Sensor Telemetrie
            </h2>
            {isConnected && (
              <button
                onClick={handleToggleStream}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-1"
              >
                {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isStreaming ? 'Pause' : 'Streamen'}
              </button>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="humidity" name="Feuchte (%)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
