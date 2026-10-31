import React, { useState } from 'react';
import { Calculator, Scale, Percent, CheckCircle2, Award, TrendingUp, Building2, AlertCircle } from 'lucide-react';
import {
  berechneLieferantenkreditVergleich,
  berechneQuantitativesAngebot,
  berechneQualitativenAngebotsvergleich,
  WISO_ANGEBOTSVERGLEICH_DRILL
} from '../../utils/wisoAngebotsvergleichEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function WisoAngebotsvergleichLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('kredit'); // 'kredit' | 'quantitativ' | 'qualitativ' | 'drill'
  const [xpClaimed, setXpClaimed] = useState(false);

  // 1. Skonto vs. Kredit State
  const [kreditParams, setKreditParams] = useState({
    rechnungsbetrag: 10000,
    skontoProzent: 3,
    skontoTage: 10,
    zielTage: 30,
    kontokorrentZinsProzent: 11.5
  });

  const kreditResult = berechneLieferantenkreditVergleich(kreditParams);

  // 2. Quantitativer Angebotsvergleich State
  const [angebotA, setAngebotA] = useState({
    anbieterName: 'TechSource GmbH',
    listeneinkaufspreis: 12000,
    rabattProzent: 10,
    skontoProzent: 2,
    bezugskosten: 250
  });

  const [angebotB, setAngebotB] = useState({
    anbieterName: 'ByteDirect AG',
    listeneinkaufspreis: 11500,
    rabattProzent: 5,
    skontoProzent: 3,
    bezugskosten: 120
  });

  const resA = berechneQuantitativesAngebot(angebotA);
  const resB = berechneQuantitativesAngebot(angebotB);
  const preisDifferenz = Math.abs(resA.bezugspreis - resB.bezugspreis).toFixed(2);
  const guenstigerName = resA.bezugspreis < resB.bezugspreis ? resA.anbieterName : resB.anbieterName;

  // 3. Qualitativer Angebotsvergleich State
  const [qualKriterien] = useState([
    { name: 'Lieferzuverlässigkeit', gewichtungProzent: 35 },
    { name: 'Produktqualität', gewichtungProzent: 30 },
    { name: 'Technischer Support', gewichtungProzent: 20 },
    { name: 'Ökologische Zertifizierung', gewichtungProzent: 15 }
  ]);

  const [qualScores, setQualScores] = useState({
    'TechSource GmbH': {
      'Lieferzuverlässigkeit': 9,
      'Produktqualität': 8,
      'Technischer Support': 7,
      'Ökologische Zertifizierung': 8
    },
    'ByteDirect AG': {
      'Lieferzuverlässigkeit': 7,
      'Produktqualität': 9,
      'Technischer Support': 9,
      'Ökologische Zertifizierung': 6
    }
  });

  const qualResult = berechneQualitativenAngebotsvergleich({
    kriterien: qualKriterien,
    bewertungen: qualScores
  });

  // 4. Drill
  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      triggerHaptic('SUCCESS');
      const fn = onRewardXP || awardXP;
      fn?.(55, 'IHK Angebotsvergleich & Skontozins Master');
    } else {
      triggerHaptic(correctCount >= 2 ? 'SUCCESS' : 'WARNING');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card, #1e293b)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--border-color, #334155)',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              display: 'flex',
              color: '#fff'
            }}>
              <Scale size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                IHK WISO Angebotsvergleich & Skontorechner
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                Kaufmännischer Angebotsvergleich, Skonto-Effektivzins ($p_{'{eff}'}$) vs. Kontokorrentkredit & qualitative Nutzwertmatrix
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '0.35rem 0.75rem',
              borderRadius: '2rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              IHK AP1 / WISO Pflichtstoff
            </span>
            <span style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              padding: '0.35rem 0.75rem',
              borderRadius: '2rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* Tab-Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'kredit', label: '1. Skonto vs. Kontokorrentkredit', icon: Percent },
            { id: 'quantitativ', label: '2. Quantitativer Vergleich (Kalkulationsschema)', icon: Calculator },
            { id: 'qualitativ', label: '3. Qualitativer Vergleich (Scoring-Matrix)', icon: Building2 },
            { id: 'drill', label: '4. IHK Prüfungs-Drill (+55 XP)', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  triggerHaptic('LIGHT');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: isActive ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#fff' : 'var(--text-muted, #94a3b8)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SKONTO VS KREDIT */}
      {activeTab === 'kredit' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Eingabe-Panel */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Percent size={20} color="#10b981" />
              Kredit- & Skontoparameter
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                  Rechnungsbetrag (Zieleinkaufspreis): {kreditParams.rechnungsbetrag.toLocaleString('de-DE')} €
                </label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={kreditParams.rechnungsbetrag}
                  onChange={(e) => setKreditParams({ ...kreditParams, rechnungsbetrag: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                    Skonto: {kreditParams.skontoProzent}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={kreditParams.skontoProzent}
                    onChange={(e) => setKreditParams({ ...kreditParams, skontoProzent: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                    Bankzins: {kreditParams.kontokorrentZinsProzent}% p.a.
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="18"
                    step="0.5"
                    value={kreditParams.kontokorrentZinsProzent}
                    onChange={(e) => setKreditParams({ ...kreditParams, kontokorrentZinsProzent: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                    Skontofrist: {kreditParams.skontoTage} Tage
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={kreditParams.skontoTage}
                    onChange={(e) => setKreditParams({ ...kreditParams, skontoTage: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                    Zahlungsziel: {kreditParams.zielTage} Tage
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={kreditParams.zielTage}
                    onChange={(e) => setKreditParams({ ...kreditParams, zielTage: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted, #94a3b8)'
              }}>
                <strong>IHK Formel für effektiven Jahreszins:</strong>
                <div style={{ fontFamily: 'monospace', color: '#10b981', marginTop: '0.25rem' }}>
                  p_eff = (Skontosatz × 360) / (Zahlungsziel - Skontofrist)
                </div>
              </div>
            </div>
          </div>

          {/* Auswertung & IHK Begründung */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} color="#10b981" />
                Berechnungsergebnisse & Vergleich
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 600 }}>Effektiver Skontozins</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>
                    {kreditResult.effektiverLieferantenzins.toFixed(2)}% <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>p.a.</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 600 }}>Kontokorrentzins</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>
                    {kreditParams.kontokorrentZinsProzent.toFixed(2)}% <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>p.a.</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-color, #334155)' }}>
                  <span>Kreditperiode (Überbrückungstage):</span>
                  <strong>{kreditResult.kreditdauerTage} Tage</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-color, #334155)' }}>
                  <span>Erzielter Skontoabzug (+):</span>
                  <strong style={{ color: '#10b981' }}>{kreditResult.skontoBetrag.toFixed(2)} €</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border-color, #334155)' }}>
                  <span>Bankkreditzinsen für {kreditResult.kreditdauerTage} Tage (-):</span>
                  <strong style={{ color: '#ef4444' }}>{kreditResult.bankkreditzinsen.toFixed(2)} €</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '2px solid var(--border-color, #334155)', fontSize: '1rem' }}>
                  <span><strong>Finanzieller Netto-Vorteil:</strong></span>
                  <strong style={{ color: kreditResult.zinsgewinn > 0 ? '#10b981' : '#ef4444', fontSize: '1.15rem' }}>
                    {kreditResult.zinsgewinn > 0 ? '+' : ''}{kreditResult.zinsgewinn.toFixed(2)} €
                  </strong>
                </div>
              </div>
            </div>

            {/* IHK Begründungsbox */}
            <div style={{
              background: kreditResult.lohntSichBankkredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: `1px solid ${kreditResult.lohntSichBankkredit ? '#10b981' : '#ef4444'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: kreditResult.lohntSichBankkredit ? '#10b981' : '#ef4444', marginBottom: '0.25rem' }}>
                {kreditResult.lohntSichBankkredit ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                IHK-Musterentscheidung:
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                {kreditResult.begruendung}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUANTITATIVER VERGLEICH */}
      {activeTab === 'quantitativ' && (
        <div style={{
          background: 'var(--bg-card, #1e293b)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px solid var(--border-color, #334155)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={22} color="#10b981" />
            Quantitativer Angebotsvergleich: Vollständiges Kalkulationsschema
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <AngebotKalkulation
              angebot={angebotA}
              ergebnis={resA}
              onChange={setAngebotA}
              titelFarbe="#3b82f6"
              istGuenstigster={resA.bezugspreis <= resB.bezugspreis}
            />
            <AngebotKalkulation
              angebot={angebotB}
              ergebnis={resB}
              onChange={setAngebotB}
              titelFarbe="#8b5cf6"
              istGuenstigster={resB.bezugspreis < resA.bezugspreis}
            />
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <strong>Quantitativer Gesamtsieger:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{guenstigerName}</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
                Ersparnis gegenüber dem Mitbewerber: <strong>{preisDifferenz} €</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUALITATIVER VERGLEICH */}
      {activeTab === 'qualitativ' && (
        <div style={{
          background: 'var(--bg-card, #1e293b)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px solid var(--border-color, #334155)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={22} color="#10b981" />
            Qualitativer Angebotsvergleich: Scoring-Matrix (Nutzwertanalyse)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '1.5rem' }}>
            In der IHK-Praxis entscheidet selten der Preis allein: Weiche Kriterien wie Zuverlässigkeit, Support, Qualität und Umweltzertifikate werden mit Gewichtungen (Summe = 100%) und Punkten (1-10) multipliziert.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color, #334155)' }}>
                  <th style={{ padding: '0.75rem' }}>Entscheidungskriterium</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Gewichtung</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>TechSource (Pkt. 1-10)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>ByteDirect (Pkt. 1-10)</th>
                </tr>
              </thead>
              <tbody>
                {qualKriterien.map((krit) => (
                  <tr key={krit.name} style={{ borderBottom: '1px solid var(--border-color, #334155)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{krit.name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                      {krit.gewichtungProzent}%
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={qualScores['TechSource GmbH']?.[krit.name] ?? 5}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(10, Number(e.target.value)));
                          setQualScores((prev) => ({
                            ...prev,
                            'TechSource GmbH': { ...prev['TechSource GmbH'], [krit.name]: val }
                          }));
                        }}
                        style={{ width: '60px', padding: '0.35rem', textAlign: 'center', borderRadius: '0.35rem', border: '1px solid var(--border-color, #334155)' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={qualScores['ByteDirect AG']?.[krit.name] ?? 5}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(10, Number(e.target.value)));
                          setQualScores((prev) => ({
                            ...prev,
                            'ByteDirect AG': { ...prev['ByteDirect AG'], [krit.name]: val }
                          }));
                        }}
                        style={{ width: '60px', padding: '0.35rem', textAlign: 'center', borderRadius: '0.35rem', border: '1px solid var(--border-color, #334155)' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {qualResult.rangliste.map((item) => (
              <div
                key={item.anbieterName}
                style={{
                  background: item.rang === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: item.rang === 1 ? '2px solid #10b981' : '1px solid var(--border-color, #334155)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Rang {item.rang}</div>
                  <strong style={{ fontSize: '1.1rem' }}>{item.anbieterName}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Nutzwert</div>
                  <strong style={{ fontSize: '1.4rem' }}>{item.nutzwert.toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IHK PRÜFUNGS-DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: WISO & Beschaffung"
          questions={WISO_ANGEBOTSVERGLEICH_DRILL}
          accentColor="#10b981"
          selectedBg="rgba(59, 130, 246, 0.2)"
          selectedBorderColor="#3b82f6"
          xpClaimed={xpClaimed}
          onEvaluate={handleEvaluateDrill}
        />
      )}
    </div>
  );
}

const zahlenfeld = (breite) => ({
  width: breite,
  textAlign: 'right',
  padding: '0.2rem',
  borderRadius: '0.3rem',
  border: '1px solid var(--border-color, #334155)'
});

const zwischensumme = {
  display: 'flex',
  justifyContent: 'space-between',
  fontWeight: 600,
  borderTop: '1px solid var(--border-color, #334155)',
  paddingTop: '0.35rem'
};

/** Kalkulationsschema eines Anbieters: LEP → ZEP → BEP → Bezugspreis. */
function AngebotKalkulation({ angebot, ergebnis, onChange, titelFarbe, istGuenstigster }) {
  const setFeld = (feld) => (e) => onChange({ ...angebot, [feld]: Number(e.target.value) });

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      border: istGuenstigster ? '2px solid #10b981' : '1px solid var(--border-color, #334155)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: titelFarbe }}>{angebot.anbieterName}</h3>
        {istGuenstigster && (
          <span style={{ background: '#10b981', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 700 }}>
            GÜNSTIGSTER
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Listeneinkaufspreis:</span>
          <input type="number" value={angebot.listeneinkaufspreis} onChange={setFeld('listeneinkaufspreis')} style={zahlenfeld('100px')} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ef4444' }}>
          <span>- Lieferantenrabatt:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input type="number" value={angebot.rabattProzent} onChange={setFeld('rabattProzent')} style={zahlenfeld('45px')} />
            <span>% (-{ergebnis.rabattBetrag.toFixed(2)} €)</span>
          </div>
        </div>
        <div style={zwischensumme}>
          <span>= Zieleinkaufspreis:</span>
          <span>{ergebnis.zieleinkaufspreis.toFixed(2)} €</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ef4444' }}>
          <span>- Lieferantenskonto:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input type="number" value={angebot.skontoProzent} onChange={setFeld('skontoProzent')} style={zahlenfeld('45px')} />
            <span>% (-{ergebnis.skontoBetrag.toFixed(2)} €)</span>
          </div>
        </div>
        <div style={zwischensumme}>
          <span>= Bareinkaufspreis:</span>
          <span>{ergebnis.bareinkaufspreis.toFixed(2)} €</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#10b981' }}>
          <span>+ Bezugskosten:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>+</span>
            <input type="number" value={angebot.bezugskosten} onChange={setFeld('bezugskosten')} style={zahlenfeld('70px')} />
            <span>€</span>
          </div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '1.1rem',
          borderTop: '2px solid var(--border-color, #334155)',
          paddingTop: '0.5rem',
          color: istGuenstigster ? '#10b981' : 'inherit'
        }}>
          <span>= Bezugspreis (Einstandspreis):</span>
          <span>{ergebnis.bezugspreis.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}
