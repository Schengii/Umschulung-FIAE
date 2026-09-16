import React, { useState, useMemo } from 'react';

import { Server, Sparkles, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { RACK_PRESET_DEVICES, calculateRackMetrics } from '../../utils/rackCalculations';

export default function RackConfiguratorLab() {
  const { awardXP } = useStore();
  const [installedDevices, setInstalledDevices] = useState([
    { ...RACK_PRESET_DEVICES[6], instanceId: 'inst_1' }, // 3U UPS
    { ...RACK_PRESET_DEVICES[0], instanceId: 'inst_2' }, // 1U Server
    { ...RACK_PRESET_DEVICES[1], instanceId: 'inst_3' }, // 2U GPU Server
    { ...RACK_PRESET_DEVICES[3], instanceId: 'inst_4' }, // 2U Core Switch
    { ...RACK_PRESET_DEVICES[4], instanceId: 'inst_5' }, // 1U Patch Panel
    { ...RACK_PRESET_DEVICES[2], instanceId: 'inst_6' }  // 1U 48P Switch
  ]);

  const metrics = useMemo(() => {
    return calculateRackMetrics(installedDevices, 42);
  }, [installedDevices]);

  const handleAddDevice = (preset) => {
    if (metrics.freeU < preset.heightU) {
      alert(`Nicht genügend freie Höheneinheiten im Rack! Benötigt: ${preset.heightU} HE, Frei: ${metrics.freeU} HE.`);
      return;
    }
    const newInst = {
      ...preset,
      instanceId: `inst_${Date.now()}`
    };
    setInstalledDevices([...installedDevices, newInst]);
    awardXP(15, 'rack_device_added');
  };

  const handleRemoveDevice = (instanceId) => {
    setInstalledDevices(installedDevices.filter(d => d.instanceId !== instanceId));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Server size={14} /> IT-Infrastruktur &amp; IHK LF 4/7</span>
              <span className="badge badge-teal"><Sparkles size={14} /> 19" Server-Rack &amp; USV/Klima Studio</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              19"-Server-Rack Konfigurator &amp; USV / RZ-Klimarechner
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Plane ein 42HE RZ-Serverschrank-Layout, berechne die elektrische Schein- &amp; Wirkleistung ($VA, W$), USV-Batterieüberbrückungszeit sowie die thermische Abwärmelast (BTU/h &amp; kW Klimakühlung).
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Höheneinheiten Belegung</span>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--accent-indigo)', marginTop: '4px' }}>
            {metrics.usedU} / {metrics.totalRackU} HE
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{metrics.freeU} HE frei ({metrics.utilizationPercent}%)</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Elektrische Gesamtlast</span>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '4px' }}>
            {metrics.totalWatts} W
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{metrics.totalVa} VA (cos φ {metrics.powerFactor})</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>USV Batterie-Laufzeit</span>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            ~{metrics.upsRuntimeMinutes} Min.
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{metrics.totalBatteryWh} Wh Puffer</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>RZ-Kühlleistung (HVAC)</span>
          <div style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {metrics.btuPerHour.toLocaleString()} BTU/h
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>~{metrics.coolingKwRequired} kW Kälteleistung</span>
        </div>
      </div>

      {/* Main Rack Visualizer & Device Catalog */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: '20px' }}>
        {/* Visual 42U Rack */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="var(--accent-indigo)" /> 42HE Serverschrank (Frontansicht)
          </h2>

          <div style={{ background: '#090d16', border: '3px solid #334155', borderRadius: 'var(--radius-md)', padding: '8px', minHeight: '440px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {installedDevices.map((dev) => (
              <div
                key={dev.instanceId}
                style={{
                  height: `${dev.heightU * 34}px`,
                  background: dev.type === 'power' ? 'linear-gradient(90deg, #1e1b4b, #312e81)' : dev.type === 'server' ? 'linear-gradient(90deg, #0f172a, #1e293b)' : dev.type === 'network' ? 'linear-gradient(90deg, #064e3b, #047857)' : 'linear-gradient(90deg, #374151, #4b5563)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-indigo" style={{ padding: '1px 6px', fontSize: '0.72rem' }}>{dev.heightU} HE</span>
                  <span>{dev.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{dev.powerWatts}W</span>
                  <button
                    onClick={() => handleRemoveDevice(dev.instanceId)}
                    className="btn btn-ghost"
                    style={{ padding: '2px', color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* Free U Indicator */}
            {metrics.freeU > 0 && (
              <div style={{ flex: 1, minHeight: '60px', border: '1px dashed #334155', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                {metrics.freeU} HE Unbelegt / Freiraum
              </div>
            )}
          </div>
        </div>

        {/* Device Catalog */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--accent-teal)" /> RZ-Komponenten Katalog
          </h2>

          <div className="space-y-3">
            {RACK_PRESET_DEVICES.map(preset => (
              <div
                key={preset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{preset.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {preset.heightU} HE | {preset.powerWatts} Watt | {preset.weightKg} kg
                    {preset.batteryWh ? ` | USV Akku: ${preset.batteryWh}Wh` : ''}
                  </div>
                </div>

                <button
                  onClick={() => handleAddDevice(preset)}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                >
                  <Plus size={14} /> Einbauen
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
