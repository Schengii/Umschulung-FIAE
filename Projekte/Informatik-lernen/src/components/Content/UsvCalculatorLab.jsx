import React, { useState } from 'react';
import { Zap, BatteryCharging, Gauge, Award, Server } from 'lucide-react';
import {
  USV_TOPOLOGIES,
  calculatePowerMetrics,
  calculateAutonomyTime,
  calculatePue,
  DEFAULT_SERVER_RACK_CONSUMERS,
  USV_DRILL_QUESTIONS
} from '../../utils/usvCalculationsEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function UsvCalculatorLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('dimensioning'); // 'dimensioning' | 'autonomie' | 'topologien' | 'drill'
  const [xpClaimed, setXpClaimed] = useState(false);

  // 1. Dimensionierungs-State
  const [consumers, setConsumers] = useState(DEFAULT_SERVER_RACK_CONSUMERS);
  const [cosPhiVal, setCosPhiVal] = useState(0.8);
  const [safetyMargin, setSafetyMargin] = useState(25);

  // 2. Autonomiezeit-State
  const [batteryVoltage, setBatteryVoltage] = useState(24); // 24V (z.B. 2x 12V in Reihe)
  const [batteryCapacity, setBatteryCapacity] = useState(100); // 100 Ah
  const efficiency = 0.88;

  // 3. PUE-State
  const [facilityEnergy, setFacilityEnergy] = useState(1250);
  const [itEnergy, setItEnergy] = useState(1000);

  // Berechnungen
  const totalRackWatt = consumers.reduce((acc, c) => acc + (c.count * c.wattPerUnit), 0);
  const powerMetrics = calculatePowerMetrics(totalRackWatt, cosPhiVal, safetyMargin);
  const autonomyRes = calculateAutonomyTime(totalRackWatt, batteryVoltage, batteryCapacity, efficiency);
  const pueRes = calculatePue(facilityEnergy, itEnergy);

  const handleUpdateConsumerCount = (id, count) => {
    setConsumers(prev => prev.map(c => c.id === id ? { ...c, count: Math.max(0, count) } : c));
    triggerHaptic('LIGHT');
  };

  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(55, 'usv_calculator_master');
      } else if (awardXP) {
        awardXP(55, 'usv_calculator_master');
      }
      triggerHaptic('SUCCESS');
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
                <Zap size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>
                IHK USV-Dimensionierung & Stromversorgungs-Studio
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', maxWidth: '800px' }}>
              Berechne Wirkleistung (P in Watt), Scheinleistung (S in VA) mit Leistungsfaktor cos phi, dimensioniere USV-Anlagen nach DIN EN 62040-3 (VFD, VI, VFI) und kalkuliere exakte Akku-Autonomiezeiten.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
              IT-SE & FISI
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('dimensioning')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'dimensioning' ? '#eab308' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'dimensioning' ? '#000' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Server size={16} /> USV-Leistungsrechner (W / VA)
          </button>
          <button
            onClick={() => setActiveTab('autonomie')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'autonomie' ? '#eab308' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'autonomie' ? '#000' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BatteryCharging size={16} /> Autonomiezeit (Batterie)
          </button>
          <button
            onClick={() => setActiveTab('topologien')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'topologien' ? '#eab308' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'topologien' ? '#000' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Gauge size={16} /> USV-Typen & PUE
          </button>
          <button
            onClick={() => setActiveTab('drill')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'drill' ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'drill' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Award size={16} /> IHK-Drill (+55 XP)
          </button>
        </div>
      </div>

      {/* TAB 1: USV LEISTUNGSDIMENSIONIERUNG */}
      {activeTab === 'dimensioning' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Verbraucher-Tabelle */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: 0, marginBottom: '14px' }}>
              IT-Verbraucher im Serverschrank:
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {consumers.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color, #334155)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.wattPerUnit} W pro Gerät</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={c.count}
                      onChange={(e) => handleUpdateConsumerCount(c.id, Number(e.target.value))}
                      style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '60px', textAlign: 'right' }}>
                      {c.count * c.wattPerUnit} W
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Parameter */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Leistungsfaktor (cos φ):
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="1.0"
                  value={cosPhiVal}
                  onChange={(e) => setCosPhiVal(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  IHK-Reserve (+%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={safetyMargin}
                  onChange={(e) => setSafetyMargin(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
                />
              </div>
            </div>
          </div>

          {/* Berechnungsergebnisse */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: 0, marginBottom: '14px', color: '#facc15' }}>
              IHK Dimensionierungs-Ergebnis:
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reine Wirkleistung P (Last):</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                  {powerMetrics.activePowerW} W
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({powerMetrics.activePowerKw} kW)</div>
              </div>

              <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scheinleistung S = P / cos φ:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>
                  {powerMetrics.apparentPowerVa} VA
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({powerMetrics.apparentPowerKva} kVA)</div>
              </div>
            </div>

            {/* Empfohlene USV-Klasse */}
            <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#facc15', marginBottom: '4px' }}>
                Mindestgröße der USV (inkl. {safetyMargin}% Sicherheitsreserve):
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#facc15' }}>
                ≥ {powerMetrics.requiredUsvVa} VA ({powerMetrics.requiredUsvWatt} W)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Empfohlenes Markengerät: <strong>{Math.ceil(powerMetrics.requiredUsvVa / 500) * 500} VA</strong> USV-Klasse.
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <strong>IHK-Merksatz:</strong> Ein PC-Schaltnetzteil erzeugt durch Kondensatoren Phasenverschiebung. Da USVs in Voltampere (VA) bemessen werden, muss stets durch den Leistungsfaktor dividiert werden: <code>S = P / cos φ</code>.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTONOMIEZEIT */}
      {activeTab === 'autonomie' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            Autonomiezeit-Kalkulation (Überbrückungsdauer im Akkubetrieb)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Batterie-Nennspannung (V):
              </label>
              <select
                value={batteryVoltage}
                onChange={(e) => setBatteryVoltage(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
              >
                <option value={12}>12 V (1x 12V Blei-Vlies Akku)</option>
                <option value={24}>24 V (2x 12V in Reihe)</option>
                <option value={48}>48 V (4x 12V / RZ Standard)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Batterie-Kapazität (Ah):
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>
                Aktuelle IT-Last (W):
              </label>
              <input
                type="number"
                value={totalRackWatt}
                disabled
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'rgba(255,255,255,0.05)', color: 'inherit' }}
              />
            </div>
          </div>

          {/* Ergebnis-Box */}
          <div style={{ padding: '20px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: '700' }}>
                Errechnete Autonomiezeit bei {totalRackWatt} W Last:
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
                {autonomyRes.runtimeMinutes} Minuten
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Nutzbare Energie: {autonomyRes.usableEnergyWh} Wh von {autonomyRes.totalEnergyWh} Wh Brutto (Wirkungsgrad {Math.round(efficiency * 100)}%)
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', maxWidth: '340px', color: 'var(--text-muted)' }}>
              Reicht aus für sauberes Herunterfahren via SNMP/Network Shutdown Modul (typisch 5–10 Min benötigt) oder Notstromdiesel-Start.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOPOLOGIEN & PUE */}
      {activeTab === 'topologien' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            USV-Topologien nach DIN EN 62040-3
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {USV_TOPOLOGIES.map(t => (
              <div key={t.code} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #334155)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#facc15' }}>{t.code}</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                    Umschaltzeit: {t.switchTime}
                  </span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>{t.germanName}</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: '1.45' }}>
                  {t.explanation}
                </p>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                  <strong>Einsatz:</strong> {t.recommendedFor}
                </div>
              </div>
            ))}
          </div>

          {/* PUE Rechner */}
          <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 12px 0' }}>
              RZ-Energieeffizienz: PUE-Rechner (Power Usage Effectiveness)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Gesamtenergie des Rechenzentrums (kWh):
                </label>
                <input
                  type="number"
                  value={facilityEnergy}
                  onChange={(e) => setFacilityEnergy(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Reine IT-Energie (Server & Storage) (kWh):
                </label>
                <input
                  type="number"
                  value={itEnergy}
                  onChange={(e) => setItEnergy(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PUE = Gesamtenergie / IT-Energie:</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: pueRes.pue <= 1.4 ? '#34d399' : '#f59e0b', marginTop: '2px' }}>
                  {pueRes.pue} ({pueRes.rating})
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Overhead für Kühlung/USV: <strong>+{pueRes.overheadPercent}%</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IHK DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: USV & Stromversorgung"
          questions={USV_DRILL_QUESTIONS}
          accentColor="#eab308"
          selectedBg="rgba(234, 179, 8, 0.2)"
          selectedBorderColor="#eab308"
          xpClaimed={xpClaimed}
          onEvaluate={handleEvaluateDrill}
        />
      )}
    </div>
  );
}
