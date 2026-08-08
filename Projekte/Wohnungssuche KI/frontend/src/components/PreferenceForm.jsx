import React, { useState, useEffect } from 'react';
import { Save, Plus, Sparkles, Key, Compass, Eye, EyeOff, Check, Mail, Sliders, Send, RotateCw } from 'lucide-react';

export default function PreferenceForm({ backendUrl, onBackendUrlChange, onBulkReevaluate }) {
  const [cities, setCities] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [minRentWarm, setMinRentWarm] = useState(0);
  const [maxRentWarm, setMaxRentWarm] = useState(1000);
  const [minSqm, setMinSqm] = useState(40);
  const [netIncome, setNetIncome] = useState(2500);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [autopilotMinScore, setAutopilotMinScore] = useState(85);
  const [autopilotAttachPortfolio, setAutopilotAttachPortfolio] = useState(true);
  const [autopilotAttachSelfDisclosure, setAutopilotAttachSelfDisclosure] = useState(false);
  const [partnerModeEnabled, setPartnerModeEnabled] = useState(false);
  const [partnerAName, setPartnerAName] = useState('Partner A');
  const [partnerBName, setPartnerBName] = useState('Partner B');
  const [maxNebenkosten, setMaxNebenkosten] = useState(250);
  const [maxKaution, setMaxKaution] = useState(2000);
  const [oneTimeMoveBudget, setOneTimeMoveBudget] = useState(1500);
  const [mietspiegelReference, setMietspiegelReference] = useState(12.5);
  const [maxSqm, setMaxSqm] = useState(9999);
  const [minRooms, setMinRooms] = useState(2);
  const [wishes, setWishes] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [scanIntervalHours, setScanIntervalHours] = useState(4);
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState(993);
  const [imapUser, setImapUser] = useState('');
  const [imapPassword, setImapPassword] = useState('');
  const [imapEnabled, setImapEnabled] = useState(false);
  const [showImapPass, setShowImapPass] = useState(false);
  
  const [ebkRequired, setEbkRequired] = useState(false);
  const [balkonRequired, setBalkonRequired] = useState(false);
  const [noGroundFloor, setNoGroundFloor] = useState(false);
  const [searchRent, setSearchRent] = useState(true);
  const [searchBuy, setSearchBuy] = useState(false);
  const [searchSwap, setSearchSwap] = useState(false);
  const [wbsStatus, setWbsStatus] = useState('none');
  const [blacklistKeywords, setBlacklistKeywords] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [targetAddresses, setTargetAddresses] = useState([]);
  const [newTargetLabel, setNewTargetLabel] = useState('');
  const [newTargetAddress, setNewTargetAddress] = useState('');
  const [minDistanceKm, setMinDistanceKm] = useState(0);
  const [maxDistanceKm, setMaxDistanceKm] = useState(10);
  const [wishCity, setWishCity] = useState('');
  const [wishCityRadiusKm, setWishCityRadiusKm] = useState(15);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramMinScore, setTelegramMinScore] = useState(75);
  const [travelProfile, setTravelProfile] = useState('driving');
  const [learnedNegativePreferences, setLearnedNegativePreferences] = useState([]);
  const [newLearnedPrefInput, setNewLearnedPrefInput] = useState('');
  const [telegramTestStatus, setTelegramTestStatus] = useState(''); // '' | 'loading' | 'ok' | 'error'
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidatePhoto, setCandidatePhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpSenderName, setSmtpSenderName] = useState('');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpTestStatus, setSmtpTestStatus] = useState(''); // '' | 'loading' | 'ok' | 'error'

  const [enabledPortals, setEnabledPortals] = useState({
    kleinanzeigen: true,
    immowelt: true,
    ohneMakler: true,
    wgGesucht: true,
    immoscout24: true,
    immonet: true
  });

  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Präferenzen vom Server laden
  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch(`${backendUrl}/api/preferences`);
        if (res.ok) {
          const data = await res.json();
          setCities(data.cities || []);
          setEnabledPortals(data.enabledPortals || {
            kleinanzeigen: true,
            immowelt: true,
            ohneMakler: true,
            wgGesucht: true,
            immoscout24: true,
            immonet: true
          });
          setMinRentWarm(data.minRentWarm ?? 0);
          setMaxRentWarm(data.maxRentWarm || 1000);
          setMinSqm(data.minSqm || 40);
          setNetIncome(data.netIncome ?? 2500);
          setMaxNebenkosten(data.maxNebenkosten ?? 250);
          setMaxKaution(data.maxKaution ?? 2000);
          setOneTimeMoveBudget(data.oneTimeMoveBudget ?? 1500);
          setMietspiegelReference(data.mietspiegelReference ?? 12.5);
          setAutopilotEnabled(data.autopilotEnabled || false);
          setAutopilotMinScore(data.autopilotMinScore ?? 85);
          setAutopilotAttachPortfolio(data.autopilotAttachPortfolio !== undefined ? data.autopilotAttachPortfolio : true);
          setAutopilotAttachSelfDisclosure(data.autopilotAttachSelfDisclosure || false);
          setPartnerModeEnabled(data.partnerModeEnabled || false);
          setPartnerAName(data.partnerAName || 'Partner A');
          setPartnerBName(data.partnerBName || 'Partner B');
          setMaxSqm(data.maxSqm ?? 9999);
          setMinRooms(data.minRooms || 2);
          setWishes(data.wishes || '');
          setAboutMe(data.aboutMe || '');
          setGeminiApiKey(data.geminiApiKey || '');
          setScanIntervalHours(data.scanIntervalHours || 4);
          setImapHost(data.imapHost || '');
          setImapPort(data.imapPort || 993);
          setImapUser(data.imapUser || '');
          setImapPassword(data.imapPassword || '');
          setImapEnabled(data.imapEnabled || false);
          setEbkRequired(data.ebkRequired || false);
          setBalkonRequired(data.balkonRequired || false);
          setNoGroundFloor(data.noGroundFloor || false);
          setSearchRent(data.searchRent !== undefined ? data.searchRent : true);
          setSearchBuy(data.searchBuy || false);
          setSearchSwap(data.searchSwap || false);
          setWbsStatus(data.wbsStatus || 'none');
          setBlacklistKeywords(data.blacklistKeywords || '');
          setTargetAddress(data.targetAddress || '');
          setTargetAddresses(data.targetAddresses || []);
          setMinDistanceKm(data.minDistanceKm ?? 0);
          setMaxDistanceKm(data.maxDistanceKm || 10);
          setWishCity(data.wishCity || '');
          setWishCityRadiusKm(data.wishCityRadiusKm || 15);
          setTelegramEnabled(data.telegramEnabled || false);
          setTelegramBotToken(data.telegramBotToken || '');
          setTelegramChatId(data.telegramChatId || '');
          setTelegramMinScore(data.telegramMinScore ?? 75);
          setTravelProfile(data.travelProfile || 'driving');
          setLearnedNegativePreferences(data.learnedNegativePreferences || []);
          setCandidateName(data.candidateName || '');
          setCandidateEmail(data.candidateEmail || '');
          setCandidatePhone(data.candidatePhone || '');
          setCandidatePhoto(data.candidatePhoto || '');
          setSmtpHost(data.smtpHost || '');
          setSmtpPort(data.smtpPort || 587);
          setSmtpUser(data.smtpUser || '');
          setSmtpPassword(data.smtpPassword || '');
          setSmtpSecure(data.smtpSecure || false);
          setSmtpSenderName(data.smtpSenderName || '');
        }
      } catch (err) {
        console.error('Fehler beim Laden der Präferenzen:', err);
      }
    }
    loadPrefs();
  }, [backendUrl]);

  // Stadt hinzufügen
  function addCity() {
    const trimmed = cityInput.trim();
    if (trimmed && !cities.includes(trimmed)) {
      setCities([...cities, trimmed]);
      setCityInput('');
    }
  }

  // Stadt entfernen
  function removeCity(cityToRemove) {
    setCities(cities.filter(c => c !== cityToRemove));
  }

  // Zielort hinzufügen
  function addTargetAddress() {
    const label = newTargetLabel.trim();
    const address = newTargetAddress.trim();
    if (label && address) {
      const newTarget = {
        label,
        address,
        lat: null,
        lon: null
      };
      setTargetAddresses([...targetAddresses, newTarget]);
      setNewTargetLabel('');
      setNewTargetAddress('');
    }
  }

  // Zielort entfernen
  function removeTargetAddress(indexToRemove) {
    setTargetAddresses(targetAddresses.filter((_, idx) => idx !== indexToRemove));
  }

  // Gelernte Präferenz löschen
  async function removeLearnedPref(prefToRemove) {
    const newList = learnedNegativePreferences.filter(p => p !== prefToRemove);
    setLearnedNegativePreferences(newList);
    
    // Direkt an das Backend senden
    try {
      await fetch(`${backendUrl}/api/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnedNegativePreferences: newList })
      });
    } catch (err) {
      console.error('Fehler beim Löschen der gelernten Präferenz:', err);
    }
  }

  // Gelernte Präferenz manuell hinzufügen
  async function addLearnedPref() {
    const trimmed = newLearnedPrefInput.trim();
    if (trimmed && !learnedNegativePreferences.includes(trimmed)) {
      const newList = [...learnedNegativePreferences, trimmed];
      setLearnedNegativePreferences(newList);
      setNewLearnedPrefInput('');
      
      // Direkt an das Backend senden
      try {
        await fetch(`${backendUrl}/api/preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learnedNegativePreferences: newList })
        });
      } catch (err) {
        console.error('Fehler beim Hinzufügen der gelernten Präferenz:', err);
      }
    }
  }

  // Absenden
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setErrorMsg('');

    const prefs = {
      cities,
      minRentWarm: Number(minRentWarm),
      maxRentWarm: Number(maxRentWarm),
      minSqm: Number(minSqm),
      netIncome: Number(netIncome),
      maxNebenkosten: Number(maxNebenkosten),
      maxKaution: Number(maxKaution),
      oneTimeMoveBudget: Number(oneTimeMoveBudget),
      mietspiegelReference: Number(mietspiegelReference),
      autopilotEnabled,
      autopilotMinScore: Number(autopilotMinScore),
      autopilotAttachPortfolio,
      autopilotAttachSelfDisclosure,
      partnerModeEnabled,
      partnerAName,
      partnerBName,
      maxSqm: Number(maxSqm),
      minRooms: Number(minRooms),
      wishes,
      aboutMe,
      geminiApiKey,
      scanIntervalHours: Number(scanIntervalHours),
      imapHost,
      imapPort: Number(imapPort),
      imapUser,
      imapPassword,
      imapEnabled,
      ebkRequired,
      balkonRequired,
      noGroundFloor,
      searchRent,
      searchBuy,
      searchSwap,
      wbsStatus,
      blacklistKeywords,
      targetAddress: targetAddresses[0]?.address || targetAddress,
      minDistanceKm: Number(minDistanceKm),
      maxDistanceKm: Number(maxDistanceKm),
      wishCity,
      wishCityRadiusKm: Number(wishCityRadiusKm),
      telegramEnabled,
      telegramBotToken,
      telegramChatId,
      telegramMinScore: Number(telegramMinScore),
      travelProfile,
      learnedNegativePreferences,
      candidateName,
      candidateEmail,
      candidatePhone,
      candidatePhoto,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpPassword,
      smtpSecure,
      smtpSenderName,
      targetAddresses,
      enabledPortals
    };

    try {
      const res = await fetch(`${backendUrl}/api/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg('Fehler beim Speichern der Präferenzen.');
      }
    } catch (err) {
      setErrorMsg('Netzwerkfehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${backendUrl}/api/preferences/profile-picture`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setCandidatePhoto(data.url);
      } else {
        alert('Fehler beim Hochladen des Fotos.');
      }
    } catch (err) {
      console.error(err);
      alert('Netzwerkfehler beim Hochladen des Fotos.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Suchprofil & Präferenzen</h1>
          <p>Konfiguriere deine Anforderungen und richte den Gemini-Analyzer ein.</p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? 'Gespeichert!' : 'Profil Speichern'}</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1rem', borderRadius: '8px' }}>
          {errorMsg}
        </div>
      )}

      {/* 0. Bereich: Server-Verbindung */}
      <div className="form-section">
        <h3><Sliders size={20} style={{ color: 'var(--primary)' }} /> Server-Verbindung</h3>
        <div className="form-group-full">
          <label>Backend API URL (für dieses Gerät)</label>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Gib die Adresse des Backend-Servers ein. Wenn du die App auf einem Smartphone oder Emulator ausführst, muss dies die IP deines Computers im lokalen Netzwerk sein (z.B. <code style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onBackendUrlChange && onBackendUrlChange('http://192.168.137.252:5000')}>http://192.168.137.252:5000</code>).
          </p>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => onBackendUrlChange && onBackendUrlChange(e.target.value)}
            placeholder="http://192.168.137.252:5000"
            required
          />
        </div>
      </div>

      {/* 1. Bereich: Standort & Budget */}
      <div className="form-section">
        <h3><Compass size={20} className="logo-icon" /> 1. Basis-Kriterien</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Wunschstadt</label>
            <input
              type="text"
              placeholder="z. B. Bonn, Köln, Berlin"
              value={wishCity}
              onChange={(e) => setWishCity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Suchradius um Wunschstadt (km)</label>
            <input
              type="number"
              value={wishCityRadiusKm}
              onChange={(e) => setWishCityRadiusKm(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Minimale Warmmiete (€)</label>
            <input
              type="number"
              value={minRentWarm}
              onChange={(e) => setMinRentWarm(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Maximale Warmmiete (€)</label>
            <input
              type="number"
              value={maxRentWarm}
              onChange={(e) => setMaxRentWarm(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mindestgröße (qm)</label>
            <input
              type="number"
              value={minSqm}
              onChange={(e) => setMinSqm(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Maximale Größe (qm)</label>
            <input
              type="number"
              value={maxSqm}
              onChange={(e) => setMaxSqm(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mindest-Zimmeranzahl</label>
            <input
              type="number"
              step="0.5"
              value={minRooms}
              onChange={(e) => setMinRooms(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Scan-Intervall (Stunden)</label>
            <select
              value={scanIntervalHours}
              onChange={(e) => setScanIntervalHours(e.target.value)}
            >
              <option value="1">Jede Stunde</option>
              <option value="2">Alle 2 Stunden</option>
              <option value="4">Alle 4 Stunden</option>
              <option value="8">Alle 8 Stunden</option>
              <option value="12">Alle 12 Stunden</option>
              <option value="24">Einmal täglich</option>
            </select>
          </div>

          <div className="form-group-full" style={{ gridColumn: 'span 2', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Angebotsarten / Suchpräferenzen</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', flex: '1 1 200px' }}>
                <input
                  type="checkbox"
                  id="searchRent"
                  checked={searchRent}
                  onChange={(e) => setSearchRent(e.target.checked)}
                  style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                />
                <label htmlFor="searchRent" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>Mietwohnungen suchen</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', flex: '1 1 200px' }}>
                <input
                  type="checkbox"
                  id="searchBuy"
                  checked={searchBuy}
                  onChange={(e) => setSearchBuy(e.target.checked)}
                  style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                />
                <label htmlFor="searchBuy" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>Kaufobjekte suchen</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', flex: '1 1 200px' }}>
                <input
                  type="checkbox"
                  id="searchSwap"
                  checked={searchSwap}
                  onChange={(e) => setSearchSwap(e.target.checked)}
                  style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                />
                <label htmlFor="searchSwap" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>Tauschwohnungen suchen</label>
              </div>
            </div>
          </div>

          <div className="form-group-full" style={{ gridColumn: 'span 2', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Aktive Suchportale</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                { id: 'kleinanzeigen', label: 'Kleinanzeigen', color: '#3c7a3c' },
                { id: 'immowelt', label: 'Immowelt', color: '#ff6c00' },
                { id: 'ohneMakler', label: 'Ohne Makler', color: '#005f73' },
                { id: 'wgGesucht', label: 'WG-Gesucht', color: '#d83a3a' },
                { id: 'immoscout24', label: 'ImmoScout24', color: '#ee7b00' },
                { id: 'immonet', label: 'Immonet', color: '#003366' }
              ].map(portal => (
                <div key={portal.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    id={`portal-${portal.id}`}
                    checked={enabledPortals[portal.id] ?? true}
                    onChange={(e) => setEnabledPortals({ ...enabledPortals, [portal.id]: e.target.checked })}
                    style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                  />
                  <label htmlFor={`portal-${portal.id}`} style={{ margin: 0, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: portal.color }}></span>
                    {portal.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group-full" style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)', gridColumn: 'span 2' }}>
            <label style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Compass size={18} style={{ color: 'var(--primary)' }} />
              <span>Zielorte / Arbeitsplätze (für Pendelzeit-Berechnung)</span>
            </label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Trage hier deine Arbeitsplätze oder andere wichtige Zielorte ein. Die Reisezeiten (Auto, Fußweg etc.) werden für jedes Inserat berechnet.
            </p>

            {/* List of existing target addresses */}
            {targetAddresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {targetAddresses.map((target, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div>
                      <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{target.label}:</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{target.address}</span>
                      {target.lat && target.lon && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          ({Number(target.lat).toFixed(4)}, {Number(target.lon).toFixed(4)})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTargetAddress(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', padding: '0 4px', display: 'flex', alignItems: 'center' }}
                      title="Zielort löschen"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
                Keine Zielorte konfiguriert. Füge unten deinen ersten Zielort hinzu.
              </p>
            )}

            {/* Add new target address form */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Name (z.B. Arbeit Max)"
                value={newTargetLabel}
                onChange={(e) => setNewTargetLabel(e.target.value)}
                style={{ flex: '1 1 200px', minWidth: '150px', padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
              <input
                type="text"
                placeholder="Adresse (z.B. Poststraße 1, Bonn)"
                value={newTargetAddress}
                onChange={(e) => setNewTargetAddress(e.target.value)}
                style={{ flex: '2 1 300px', minWidth: '200px', padding: '0.5rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTargetAddress();
                  }
                }}
              />
              <button
                type="button"
                title="Aktuellen GPS-Standort als Adresse verwenden"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(0,242,254,0.08)',
                  border: '1px solid rgba(0,242,254,0.25)',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.08)'; }}
                onClick={async () => {
                  if (!navigator.geolocation) {
                    alert('GPS wird von diesem Browser nicht unterstützt.');
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { 'Accept-Language': 'de' } }
                      );
                      const data = await res.json();
                      const addr = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                      setNewTargetAddress(addr);
                    } catch {
                      setNewTargetAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                    }
                  }, (err) => {
                    alert(`GPS-Fehler: ${err.message}`);
                  }, { enableHighAccuracy: true, timeout: 8000 });
                }}
              >
                📍 <span>GPS</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addTargetAddress}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', height: '38px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={16} />
                <span>Hinzufügen</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Minimale Entfernung (km)</label>
            <input
              type="number"
              value={minDistanceKm}
              onChange={(e) => setMinDistanceKm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Maximaler Arbeitsweg (km)</label>
            <input
              type="number"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(e.target.value)}
            />
          </div>

          <div className="form-group-full" style={{ display: 'none' }}>
            <label>Städte / Postleitzahlen (Suche)</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Trage die Städte ein, in denen gesucht werden soll, und drücke das "+".
            </p>
            <div className="tags-container">
              {cities.map((city, idx) => (
                <div key={idx} className="tag-chip">
                  <span>{city}</span>
                  <button type="button" onClick={() => removeCity(city)}>&times;</button>
                </div>
              ))}
              <input
                type="text"
                className="tags-input"
                placeholder={cities.length === 0 ? "z.B. Düsseldorf, Köln, 40211" : "Weitere Stadt..."}
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCity();
                  }
                }}
              />
              <button
                type="button"
                className="btn"
                style={{ padding: '0.35rem 0.75rem', borderRadius: '8px' }}
                onClick={addCity}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1.5. Bereich: Finanz- & Budgeteinstellungen */}
      <div className="form-section">
        <h3><Sliders size={20} style={{ color: 'var(--primary)' }} /> Budget- & Finanz-Kriterien</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Monatsnettoeinkommen (€)</label>
            <input
              type="number"
              value={netIncome}
              onChange={(e) => setNetIncome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Max. Nebenkosten-Budget (€/Monat)</label>
            <input
              type="number"
              value={maxNebenkosten}
              onChange={(e) => setMaxNebenkosten(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Max. Kautionsbudget (€)</label>
            <input
              type="number"
              value={maxKaution}
              onChange={(e) => setMaxKaution(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Einmaliges Umzugsbudget (€)</label>
            <input
              type="number"
              value={oneTimeMoveBudget}
              onChange={(e) => setOneTimeMoveBudget(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mietspiegel Richtwert (€/qm Kaltmiete)</label>
            <input
              type="number"
              step="0.1"
              value={mietspiegelReference}
              onChange={(e) => setMietspiegelReference(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* 1.6. Bereich: Bewerbungs-Autopilot */}
      <div className="form-section">
        <h3><Mail size={20} style={{ color: 'var(--primary)' }} /> Bewerbungs-Autopilot (Semi-Automatisch)</h3>
        <div className="form-grid">
          
          <div className="form-group-full" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              id="autopilotEnabled"
              checked={autopilotEnabled}
              onChange={(e) => setAutopilotEnabled(e.target.checked)}
              style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
            />
            <label htmlFor="autopilotEnabled" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>
              Bewerbungs-Autopilot aktivieren (Generiert Entwürfe & ermöglicht Schnell-Bewerbung)
            </label>
          </div>

          {autopilotEnabled && (
            <>
              <div className="form-group">
                <label>Mindest-Matching-Score für Autopilot (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={autopilotMinScore}
                  onChange={(e) => setAutopilotMinScore(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  id="autopilotAttachPortfolio"
                  checked={autopilotAttachPortfolio}
                  onChange={(e) => setAutopilotAttachPortfolio(e.target.checked)}
                  style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                />
                <label htmlFor="autopilotAttachPortfolio" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>
                  Standardmäßig Bewerbermappe (PDF) anhängen
                </label>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  id="autopilotAttachSelfDisclosure"
                  checked={autopilotAttachSelfDisclosure}
                  onChange={(e) => setAutopilotAttachSelfDisclosure(e.target.checked)}
                  style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                />
                <label htmlFor="autopilotAttachSelfDisclosure" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>
                  Standardmäßig Mieterselbstauskunft (PDF) anhängen
                </label>
              </div>
            </>
          )}

        </div>
      </div>

      {/* 1.7. Bereich: Partner-Modus (Multi-User) */}
      <div className="form-section">
        <h3><Compass size={20} style={{ color: 'var(--primary)' }} /> Partner-Modus (Multi-User)</h3>
        <div className="form-grid">
          
          <div className="form-group-full" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              id="partnerModeEnabled"
              checked={partnerModeEnabled}
              onChange={(e) => setPartnerModeEnabled(e.target.checked)}
              style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
            />
            <label htmlFor="partnerModeEnabled" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>
              Partner-Modus aktivieren (Erlaubt getrennte Bewertungen für zwei Personen)
            </label>
          </div>

          {partnerModeEnabled && (
            <>
              <div className="form-group">
                <label>Name Partner A</label>
                <input
                  type="text"
                  value={partnerAName}
                  onChange={(e) => setPartnerAName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Name Partner B</label>
                <input
                  type="text"
                  value={partnerBName}
                  onChange={(e) => setPartnerBName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

        </div>
      </div>

      {/* 2. Bereich: Detail-Präferenzen */}
      <div className="form-section">
        <h3><Sliders size={20} className="logo-icon" style={{ color: 'var(--primary)' }} /> 2. Detail-Präferenzen</h3>
        <div className="form-grid">
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              id="ebkRequired"
              checked={ebkRequired}
              onChange={(e) => setEbkRequired(e.target.checked)}
              style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
            />
            <label htmlFor="ebkRequired" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>Einbauküche (EBK) erforderlich</label>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              id="balkonRequired"
              checked={balkonRequired}
              onChange={(e) => setBalkonRequired(e.target.checked)}
              style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
            />
            <label htmlFor="balkonRequired" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>Balkon / Terrasse erforderlich</label>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              id="noGroundFloor"
              checked={noGroundFloor}
              onChange={(e) => setNoGroundFloor(e.target.checked)}
              style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
            />
            <label htmlFor="noGroundFloor" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>Erdgeschoss meiden</label>
          </div>

          <div className="form-group">
            <label>Wohnberechtigungsschein (WBS)</label>
            <select value={wbsStatus} onChange={(e) => setWbsStatus(e.target.value)}>
              <option value="none">Ich habe KEINEN WBS (WBS-Wohnungen filtern)</option>
              <option value="has">Ich habe einen WBS (Bevorzugen)</option>
              <option value="any">Keine Einschränkung (Egal)</option>
            </select>
          </div>

          <div className="form-group-full">
            <label>Ausschluss-Kriterien & Blacklist (kommagetrennt)</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Wohnungsanzeigen mit diesen Stichworten im Text erhalten drastischen Punktabzug.
            </p>
            <input
              type="text"
              placeholder="z. B. Tauschwohnung, Zwischenmiete, Untermiete, Seniorenwohnung, nur an Studenten"
              value={blacklistKeywords}
              onChange={(e) => setBlacklistKeywords(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Bereich: Wünsche & Profil */}
      <div className="form-section">
        <h3><Sparkles size={20} style={{ color: 'var(--primary)' }} /> 3. Präferenzen & Bewerberprofil</h3>
        <div className="form-grid">
          <div className="form-group-full">
            <label>Besondere Wünsche & Stichworte (für die KI-Filterung)</label>
            <textarea
              placeholder="z. B. Einbauküche (EBK) erforderlich, Balkon erwünscht, Badewanne, gute ÖPNV Anbindung, Erdgeschoss meiden..."
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Name des Bewerbers</label>
            <input
              type="text"
              placeholder="z. B. Max Mustermann"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.6rem 0.8rem', borderRadius: '8px', width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>E-Mail-Adresse des Bewerbers</label>
            <input
              type="email"
              placeholder="z. B. max.mustermann@gmail.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.6rem 0.8rem', borderRadius: '8px', width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>Telefonnummer des Bewerbers</label>
            <input
              type="text"
              placeholder="z. B. +49 176 12345678"
              value={candidatePhone}
              onChange={(e) => setCandidatePhone(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.6rem 0.8rem', borderRadius: '8px', width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>Bewerbungsfoto</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              {candidatePhoto && (
                <img
                  src={`${backendUrl}${candidatePhoto}`}
                  alt="Bewerbungsfoto"
                  style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="profile-pic-upload"
              />
              <label
                htmlFor="profile-pic-upload"
                className="btn"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', margin: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {uploadingPhoto ? 'Lädt...' : 'Foto auswählen'}
              </label>
              {candidatePhoto && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setCandidatePhoto('')}
                  style={{ color: 'var(--danger)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Entfernen
                </button>
              )}
            </div>
          </div>

          <div className="form-group-full">
            <label>Bewerberprofil ("Über mich" - für das KI-Anschreiben und Mappen-Deckblatt)</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Diese Informationen nutzt die KI für Anschreiben und das Deckblatt deiner Bewerbungsmappe.
            </p>
            <textarea
              placeholder="z. B. Ich bin 28 Jahre alt, arbeite unbefristet als IT-Berater bei Firma X (Nettoeinkommen 2.800€). Keine Haustiere, Nichtraucher. Einzug idealerweise zum nächstmöglichen Zeitpunkt..."
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              style={{ minHeight: '150px' }}
            />
          </div>
        </div>
      </div>

      {/* 4. Bereich: API Key */}
      <div className="form-section">
        <h3><Key size={20} style={{ color: 'var(--primary)' }} /> 4. Gemini API-Schlüssel</h3>
        <div className="form-group-full">
          <label>Google Gemini API Key</label>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Erforderlich für die automatische Bewertung der Inserate und die Erstellung der Anschreiben.
            Du kannst dir kostenlos einen API Key im Google AI Studio holen.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <input
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bereich: E-Mail-Suchagent (IMAP) */}
      <div className="form-section">
        <h3><Mail size={20} className="logo-icon" style={{ color: 'var(--primary)' }} /> 5. Automatischer E-Mail-Suchlauf</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Hinterlege dein E-Mail-Postfach, um neue Wohnungsangebote direkt aus deinen Suchagenten-Mails (z.B. von ImmobilienScout24) vollautomatisch auszulesen und durch Gemini bewerten zu lassen. Das umgeht alle Web-Sperren komplett!
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <input
            type="checkbox"
            id="imapEnabled"
            checked={imapEnabled}
            onChange={(e) => setImapEnabled(e.target.checked)}
            style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
          />
          <label htmlFor="imapEnabled" style={{ margin: 0, fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}>Automatischen E-Mail-Suchlauf aktivieren</label>
        </div>

        {imapEnabled && (
          <div className="form-grid">
            <div className="form-group">
              <label>IMAP Host (Server)</label>
              <input
                type="text"
                placeholder="z.B. imap.gmx.net oder imap.gmail.com"
                value={imapHost}
                onChange={(e) => setImapHost(e.target.value)}
                required={imapEnabled}
              />
            </div>

            <div className="form-group">
              <label>IMAP Port</label>
              <input
                type="number"
                placeholder="993"
                value={imapPort}
                onChange={(e) => setImapPort(e.target.value)}
                required={imapEnabled}
              />
            </div>

            <div className="form-group">
              <label>E-Mail-Adresse (Benutzername)</label>
              <input
                type="email"
                placeholder="z.B. meine.suche@gmx.de"
                value={imapUser}
                onChange={(e) => setImapUser(e.target.value)}
                required={imapEnabled}
              />
            </div>

            <div className="form-group">
              <label>E-Mail-Passwort / App-Passwort</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showImapPass ? "text" : "password"}
                  placeholder="Passwort"
                  value={imapPassword}
                  onChange={(e) => setImapPassword(e.target.value)}
                  required={imapEnabled}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowImapPass(!showImapPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showImapPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Bereich: E-Mail-Bewerbung (SMTP) */}
      <div className="form-section">
        <h3><Mail size={20} className="logo-icon" style={{ color: 'var(--primary)' }} /> 6. Auto-Mail-Bewerbung (SMTP)</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Hinterlege deine SMTP-Zugangsdaten, um dich direkt aus der App per E-Mail auf Wohnungsanzeigen bewerben zu können. Das System hängt automatisch deine konfigurierte PDF-Bewerbungsmappe an.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label>SMTP Host (Postausgangs-Server)</label>
            <input
              type="text"
              placeholder="z.B. smtp.gmx.net oder smtp.gmail.com"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>SMTP Port</label>
            <input
              type="number"
              placeholder="587 oder 465"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '100%', marginTop: 'auto', marginBottom: '0.5rem' }}>
            <input
              type="checkbox"
              id="smtpSecure"
              checked={smtpSecure}
              onChange={(e) => setSmtpSecure(e.target.checked)}
              style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
            />
            <label htmlFor="smtpSecure" style={{ margin: 0, cursor: 'pointer', userSelect: 'none' }}>SSL/TLS verschlüsselt (Port 465)</label>
          </div>

          <div className="form-group">
            <label>Sender-Name (im E-Mail 'Von' Feld)</label>
            <input
              type="text"
              placeholder="z.B. Max Mustermann"
              value={smtpSenderName}
              onChange={(e) => setSmtpSenderName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>E-Mail-Adresse (Benutzername)</label>
            <input
              type="email"
              placeholder="z.B. max.mustermann@gmx.de"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Passwort / App-Passwort</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showSmtpPass ? "text" : "password"}
                placeholder="Passwort"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowSmtpPass(!showSmtpPass)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showSmtpPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn"
            disabled={smtpTestStatus === 'loading' || !smtpHost || !smtpUser || !smtpPassword}
            onClick={async () => {
              setSmtpTestStatus('loading');
              try {
                const r = await fetch(`${backendUrl}/api/smtp/test`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    host: smtpHost,
                    port: Number(smtpPort),
                    secure: smtpSecure,
                    user: smtpUser,
                    password: smtpPassword,
                    senderName: smtpSenderName
                  })
                });
                setSmtpTestStatus(r.ok ? 'ok' : 'error');
              } catch { setSmtpTestStatus('error'); }
              setTimeout(() => setSmtpTestStatus(''), 4000);
            }}
          >
            {smtpTestStatus === 'loading' ? '⏳ Teste...' : smtpTestStatus === 'ok' ? '✅ Gesendet!' : smtpTestStatus === 'error' ? '❌ Fehler' : '📨 SMTP-Verbindung testen'}
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sendet eine Test-Email an dich selbst.</span>
        </div>
      </div>

      {/* ===== GELERNTE KRITERIEN ===== */}
      <div className="settings-section">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--primary)' }} />
          <span>Gelernte Kriterien (KI-Optimierung)</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Diese Kriterien hat die KI automatisch gelernt, weil du Wohnungen gelöscht hast.
          Sie werden bei zukünftigen Inseraten als Ausschlusskriterien verwendet.
          Du kannst unpassende Kriterien mit dem "×" entfernen oder manuell neue hinzufügen.
        </p>
        
        {learnedNegativePreferences && learnedNegativePreferences.length > 0 ? (
          <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {learnedNegativePreferences.map((pref, idx) => (
              <div key={idx} className="tag-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.35rem 0.75rem', borderRadius: '20px', border: '1px solid', fontSize: '0.85rem' }}>
                <span>{pref}</span>
                <button 
                  type="button" 
                  onClick={() => removeLearnedPref(pref)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: 0, marginLeft: '4px', display: 'flex', alignItems: 'center' }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
            Bisher keine gelernten Kriterien vorhanden.
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Neues Kriterium (z.B. Souterrain)"
            value={newLearnedPrefInput}
            onChange={e => setNewLearnedPrefInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLearnedPref();
              }
            }}
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              flexGrow: 1
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={addLearnedPref}
            style={{ padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.85rem', height: '36px' }}
          >
            Hinzufügen
          </button>
        </div>
      </div>

      {/* ===== TELEGRAM BENACHRICHTIGUNGEN ===== */}
      <div className="settings-section">
        <h2 className="section-title">
          <Send size={20} style={{ color: 'var(--primary)' }} />
          Telegram-Benachrichtigungen
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
            <div
              onClick={() => setTelegramEnabled(!telegramEnabled)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: telegramEnabled ? 'var(--primary)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: telegramEnabled ? 22 : 3,
                width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s'
              }} />
            </div>
            <span style={{ fontWeight: 600 }}>Telegram-Benachrichtigungen aktivieren</span>
          </label>
        </div>
        {telegramEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Bot-Token</label>
              <input
                type="password"
                placeholder="123456:ABC-DEF..."
                value={telegramBotToken}
                onChange={e => setTelegramBotToken(e.target.value)}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Erstelle einen Bot via <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>@BotFather</a> und kopiere den Token.
              </span>
            </div>
            <div className="form-group">
              <label>Chat-ID</label>
              <input
                type="text"
                placeholder="Deine Telegram Chat-ID"
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Sende /start an deinen Bot, dann ruf <a href="https://api.telegram.org/bot{TOKEN}/getUpdates" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>getUpdates</a> auf (ersetze TOKEN), um deine ID zu finden.
              </span>
            </div>
            <div className="form-group">
              <label>Mindest-Score für Benachrichtigung: <strong>{telegramMinScore}%</strong></label>
              <input
                type="range" min={50} max={100} step={5}
                value={telegramMinScore}
                onChange={e => setTelegramMinScore(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                disabled={telegramTestStatus === 'loading' || !telegramBotToken || !telegramChatId}
                onClick={async () => {
                  setTelegramTestStatus('loading');
                  try {
                    const r = await fetch(`${backendUrl}/api/telegram/test`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: telegramBotToken, chatId: telegramChatId })
                    });
                    setTelegramTestStatus(r.ok ? 'ok' : 'error');
                  } catch { setTelegramTestStatus('error'); }
                  setTimeout(() => setTelegramTestStatus(''), 4000);
                }}
              >
                {telegramTestStatus === 'loading' ? '⏳ Teste...' : telegramTestStatus === 'ok' ? '✅ Gesendet!' : telegramTestStatus === 'error' ? '❌ Fehler' : '📨 Test senden'}
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sendet eine Testnachricht an deinen Bot.</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== PENDELZEIT-PROFIL ===== */}
      <div className="settings-section">
        <h2 className="section-title">
          <Compass size={20} style={{ color: 'var(--primary)' }} />
          Pendelzeit-Berechnung
        </h2>
        <div className="form-group">
          <label>Transportmittel für Fahrzeit</label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[{ value: 'driving', label: '🚗 Auto', desc: 'Autofahrt' }, { value: 'foot', label: '🚶 Zu Fuß', desc: 'Fußweg' }, { value: 'both', label: '🚗 + 🚶 Beide', desc: 'Auto & Fußweg' }].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTravelProfile(opt.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: `2px solid ${travelProfile === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: travelProfile === opt.value ? 'rgba(0,242,254,0.1)' : 'var(--bg-surface)',
                  color: travelProfile === opt.value ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: travelProfile === opt.value ? 700 : 400,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Pendelzeit zu deinem Arbeitsplatz-Standort wird automatisch für alle neuen Inserate berechnet.
          </span>
        </div>
      </div>

      {/* ===== KI-AKTIONEN ===== */}
      <div className="form-section">
        <h3><Sparkles size={20} style={{ color: 'var(--primary)' }} /> KI-Datenbank-Aktionen</h3>
        <div className="form-group-full">
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Alle Angebote neu bewerten</label>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            Falls du dein Suchprofil, deine Wünsche oder gelernte Ausschlusskriterien geändert hast, kannst du alle gespeicherten Wohnungen erneut mit deinen neuen Einstellungen durch die KI bewerten lassen. Dies aktualisiert alle Match-Scores und Anschreiben.
          </p>
          <button
            type="button"
            className="btn"
            onClick={onBulkReevaluate}
            title="Alle Angebote neu bewerten"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCw size={16} />
            <span>Alle Angebote neu bewerten</span>
          </button>
        </div>
      </div>
    </form>
  );
}
