import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ExternalLink, Copy, RotateCw, Sparkles, 
  Check, Info, ChevronLeft, ChevronRight, Loader2, Edit2, Save, Trash2,
  Home, Compass, MessageCircle, Send, Bot
} from 'lucide-react';

import PriceChart from './PriceChart.jsx';

const CRITERIA_LABELS = {
  rent: 'Warmmiete / Budget',
  size: 'Wohnfläche',
  rooms: 'Zimmeranzahl',
  location: 'Lage & Entfernung',
  ebk: 'Einbauküche (EBK)',
  balkon: 'Balkon / Terrasse',
  floor: 'Etage / Erdgeschoss',
  wbs: 'WBS-Status'
};

export default function ListingDetail({ listing, backendUrl, onClose, onUpdateListing, deviceLocation }) {
  const [copied, setCopied] = useState(false);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [viewingDate, setViewingDate] = useState(listing.viewingDate || '');
  const [viewingNotes, setViewingNotes] = useState(listing.viewingNotes || '');
  const [savingViewing, setSavingViewing] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [recipientEmailInput, setRecipientEmailInput] = useState(listing.contactEmail || '');
  
  // === CHAT COPILOT STATE ===
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', content: `Hallo! Ich bin dein KI-Assistent für diese Wohnung. Ich kenne alle Details zu **${listing.title || 'dieser Wohnung'}** und kann dir helfen. Was möchtest du wissen?\n\n**Beispiele:**\n- „Schreibe eine kurze Nachricht, ob Haustiere erlaubt sind"\n- „Erkläre mir, warum der Score ${listing.matchScore || '?'}% beträgt"\n- „Bereite mich auf die Besichtigung vor"` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  // === BILD-ANALYSE STATE ===
  const [imageAnalysis, setImageAnalysis] = useState(listing.imageAnalysis || null);
  const [analyzingImages, setAnalyzingImages] = useState(false);

  const [emailSubject, setEmailSubject] = useState('');
  const [liveDepartures, setLiveDepartures] = useState([]);
  const [viewingNoteInput, setViewingNoteInput] = useState('');
  const [submittingViewingNote, setSubmittingViewingNote] = useState(false);

  async function handleSaveViewingNote() {
    if (!viewingNoteInput.trim() || submittingViewingNote) return;
    setSubmittingViewingNote(true);
    try {
      const res = await fetch(`${backendUrl}/api/listings/${listing.id}/viewing-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText: viewingNoteInput })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateListing(data.listing);
        setViewingNoteInput('');
      } else {
        const err = await res.json();
        alert(err.error || 'Fehler beim Speichern der Besichtigungs-Notiz.');
      }
    } catch (e) {
      alert('Netzwerkfehler beim Speichern.');
    } finally {
      setSubmittingViewingNote(false);
    }
  }

  useEffect(() => {
    async function loadLiveTransit() {
      try {
        const res = await fetch(`${backendUrl}/api/listings/${listing.id}/live-transit`);
        if (res.ok) {
          const data = await res.json();
          if (data.departures) setLiveDepartures(data.departures);
        }
      } catch (e) {}
    }
    if (listing.id) loadLiveTransit();
  }, [listing.id, backendUrl]);

  useEffect(() => {
    setViewingDate(listing.viewingDate || '');
    setViewingNotes(listing.viewingNotes || '');
    setRecipientEmailInput(listing.contactEmail || '');
    setEmailSubject(`Bewerbung für Mietwohnung: ${listing.title}`);
  }, [listing]);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await fetch(`${backendUrl}/api/documents`);
        if (res.ok) {
          const docs = await res.json();
          setDocuments(docs);
          setSelectedDocIds(docs.map(d => d.id));
        }
      } catch (err) {
        console.error('Fehler beim Laden der Dokumente:', err);
      }
    }
    loadDocuments();
  }, [backendUrl]);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch(`${backendUrl}/api/preferences`);
        if (res.ok) {
          const data = await res.json();
          setPreferences(data);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Einstellungen:', err);
      }
    }
    loadPrefs();
  }, [backendUrl]);

  const {
    id,
    title,
    priceKalt,
    priceWarm,
    sqm,
    rooms,
    location,
    portal,
    url,
    description,
    matchScore,
    matchSummary,
    pros,
    cons,
    coverLetter,
    distanceKm,
    travelTimeDrivingMin,
    travelTimeFootMin,
    travelTimeBicycleMin,
    lat,
    lon,
    images = [],
    enriched,
    criteriaBreakdown,
    contactEmail,
    contactPhone,
    pois,
    targetTravelTimes = [],
    isKauf,
    isTausch
  } = listing;

  // Live-Entfernung zum aktuellen Standort berechnen
  let liveDistanceKm = null;
  if (deviceLocation && deviceLocation.lat && deviceLocation.lon && lat && lon) {
    const R = 6371;
    const dLat = (lat - deviceLocation.lat) * Math.PI / 180;
    const dLon = (lon - deviceLocation.lon) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deviceLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    liveDistanceKm = Math.round(R * c * 10) / 10;
  }

  const delta = 0.01;
  const bboxLeft = lon ? lon - delta : 0;
  const bboxRight = lon ? lon + delta : 0;
  const bboxBottom = lat ? lat - delta : 0;
  const bboxTop = lat ? lat + delta : 0;
  const mapUrl = (lat && lon) 
    ? `${backendUrl}/api/map-html?listingId=${id}`
    : '';

  // Auto-Enrichment beim Öffnen des Modals
  useEffect(() => {
    async function enrichListing() {
      // Nur bei gescrapten Inseraten mit einer URL und falls noch nicht enriched
      if (!url || id.startsWith('manual-text') || enriched) {
        return;
      }

      // Wenn bereits mehrere Bilder und eine lange Beschreibung da sind, als bereits geladen ansehen
      if (images.length > 1 && description && description.length > 500) {
        return;
      }

      setEnriching(true);
      try {
        console.log(`Lade Detaildaten für Wohnung ${id} im Detailfenster...`);
        const res = await fetch(`${backendUrl}/api/listings/${id}/enrich`, {
          method: 'POST'
        });
        if (res.ok) {
          const updated = await res.json();
          onUpdateListing(updated);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Detaildaten:', err);
      } finally {
        setEnriching(false);
      }
    }

    enrichListing();
  }, [id, url, backendUrl, enriched, images.length, description, onUpdateListing]);

  // Kopiert das Anschreiben in die Zwischenablage
  function handleCopy() {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Chat-Scroll: automatisch nach unten scrollen wenn neue Nachrichten kommen
  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Sendet eine Chat-Nachricht an den KI-Copiloten
  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/listings/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        const err = await res.json();
        setChatMessages(prev => [...prev, { role: 'model', content: `❌ Fehler: ${err.error || 'Unbekannter Fehler.'}` }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: '❌ Netzwerkfehler. Bitte stelle sicher, dass das Backend läuft.' }]);
    } finally {
      setChatLoading(false);
    }
  }

  // Generiert das Anschreiben neu (falls z.B. Profil aktualisiert wurde)
  async function handleRegenerateLetter() {
    setLoadingLetter(true);
    try {
      const res = await fetch(`${backendUrl}/api/listings/${id}/generate-letter`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateListing({ ...listing, coverLetter: data.coverLetter });
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Fehler beim Generieren des Anschreibens.');
      }
    } catch (err) {
      alert('Netzwerkfehler beim Generieren.');
    } finally {
      setLoadingLetter(false);
    }
  }

  // Wohnung manuell neu bewerten
  async function handleReevaluate() {
    setEvaluating(true);
    try {
      const res = await fetch(`${backendUrl}/api/listings/${id}/evaluate`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateListing(updated);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Fehler bei der Neubewertung.');
      }
    } catch (err) {
      alert('Netzwerkfehler bei der Neubewertung.');
    } finally {
      setEvaluating(false);
    }
  }

  // Notizen laden
  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch(`${backendUrl}/api/notes`);
        if (res.ok) {
          const all = await res.json();
          setNotes(all.filter(n => n.listingId === id));
          localStorage.setItem('cached_notes', JSON.stringify(all));
        } else {
          throw new Error('Offline');
        }
      } catch {
        const cachedNotes = localStorage.getItem('cached_notes');
        if (cachedNotes) {
          const all = JSON.parse(cachedNotes);
          setNotes(all.filter(n => n.listingId === id));
        }
      }
    }
    loadNotes();
  }, [id, backendUrl]);

  async function handleSaveNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    const newNote = {
      id: editingNoteId || `note-local-${Date.now()}`,
      listingId: id,
      title: noteTitle,
      text: noteText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const method = editingNoteId ? 'PUT' : 'POST';
      const url2 = editingNoteId ? `${backendUrl}/api/notes/${editingNoteId}` : `${backendUrl}/api/notes`;
      const res = await fetch(url2, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id, title: noteTitle, text: noteText })
      });
      if (res.ok) {
        const saved = await res.json();
        updateLocalNotes(saved);
      } else {
        throw new Error('Offline');
      }
    } catch {
      // Offline-Fallback: Lokal im Cache speichern
      updateLocalNotes(newNote);
    }
    setSavingNote(false);
  }

  function updateLocalNotes(saved) {
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === saved.id);
      if (idx !== -1) return prev.map(n => n.id === saved.id ? saved : n);
      return [...prev, saved];
    });

    const cachedNotes = localStorage.getItem('cached_notes');
    let allNotes = cachedNotes ? JSON.parse(cachedNotes) : [];
    const idxAll = allNotes.findIndex(n => n.id === saved.id);
    if (idxAll !== -1) allNotes[idxAll] = saved;
    else allNotes.push(saved);
    localStorage.setItem('cached_notes', JSON.stringify(allNotes));

    setNoteText('');
    setNoteTitle('');
    setEditingNoteId(null);
  }

  async function handleSaveViewing() {
    setSavingViewing(true);
    try {
      const res = await fetch(`${backendUrl}/api/listings/${id}/viewing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewingDate, viewingNotes })
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateListing(updated);
        alert('Besichtigungstermin gespeichert!');
      } else {
        alert('Fehler beim Speichern des Termins.');
      }
    } catch (err) {
      console.error(err);
      alert('Netzwerkfehler beim Speichern des Termins.');
    } finally {
      setSavingViewing(false);
    }
  }

  function handleDownloadICS() {
    if (!viewingDate) return;
    
    // Konvertiere lokales Datum in UTC für .ics
    const dateObj = new Date(viewingDate);
    const startDateStr = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Dauer standardmäßig 1 Stunde
    const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
    const endDateStr = endDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const stampStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const escapeICS = (str) => {
      if (!str) return '';
      return str
        .replace(/\\/g, '\\\\')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
    };
    
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wohnungssuche KI//Besichtigungstermine//DE',
      'BEGIN:VEVENT',
      `UID:listing-${id}@wohnungssuche-ki`,
      `DTSTAMP:${stampStr}`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:Besichtigung: ${escapeICS(title)}`,
      `DESCRIPTION:Besichtigungstermin für das Inserat: ${escapeICS(url || '')}\\n\\nNotizen:\\n${escapeICS(viewingNotes)}`,
      `LOCATION:${escapeICS(location || '')}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    
    const icsString = icsLines.join('\r\n');
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Besichtigung_${(title || 'Termin').replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleDeleteNote(noteId) {
    try {
      await fetch(`${backendUrl}/api/notes/${noteId}`, { method: 'DELETE' });
    } catch {}
    
    // Immer lokal aus dem Cache entfernen
    setNotes(prev => prev.filter(n => n.id !== noteId));
    const cachedNotes = localStorage.getItem('cached_notes');
    if (cachedNotes) {
      const allNotes = JSON.parse(cachedNotes).filter(n => n.id !== noteId);
      localStorage.setItem('cached_notes', JSON.stringify(allNotes));
    }
  }

  async function handleVote(partner, vote) {
    try {
      const res = await fetch(`${backendUrl}/api/listings/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner, vote })
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateListing(updated);
      }
    } catch (err) {
      console.error('Fehler beim Abstimmen:', err);
    }
  }

  function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  // Slider Navigation
  function handlePrevImage() {
    setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function handleNextImage() {
    setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1100px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.3, margin: 0 }}>{title}</h2>
              {isTausch && (
                <span style={{ background: '#a855f7', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>Tausch</span>
              )}
              {isKauf && (
                <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>Kauf</span>
              )}
              {!isKauf && !isTausch && (
                <span style={{ background: 'var(--primary)', color: '#030712', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>Miete</span>
              )}
            </div>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--primary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <span>Originalanzeige öffnen</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'visible' }}>
          <div className="detail-layout">
            
            {/* Linke Seite: Bilder, Details & AI Bewertung */}
            <div className="detail-info-pane">
              
              {/* Bilder-Slider */}
              {images && images.length > 0 ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    position: 'relative',
                    height: '320px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: '#0a0d1a',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={images[activeImageIndex]} 
                      alt={`Wohnungsbild ${activeImageIndex + 1}`} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                    
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={handlePrevImage}
                          style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(3, 7, 18, 0.6)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            zIndex: 10
                          }}
                          onMouseEnter={e => e.target.style.background = 'rgba(3, 7, 18, 0.9)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(3, 7, 18, 0.6)'}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <button 
                          onClick={handleNextImage}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(3, 7, 18, 0.6)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            zIndex: 10
                          }}
                          onMouseEnter={e => e.target.style.background = 'rgba(3, 7, 18, 0.9)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(3, 7, 18, 0.6)'}
                        >
                          <ChevronRight size={20} />
                        </button>

                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: 'rgba(3, 7, 18, 0.7)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: '#e5e7eb',
                          fontWeight: 600,
                          zIndex: 10
                        }}>
                          {activeImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}

                    {/* Ladeanzeige über dem Slider falls er gerade details nachlädt */}
                    {enriching && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(3, 7, 18, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        zIndex: 20
                      }}>
                        <Loader2 size={24} className="spinner" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'white', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Lade Detailbilder & Infos...</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail-Zeile */}
                  {images.length > 1 && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      marginTop: '8px',
                      paddingBottom: '6px',
                      scrollbarWidth: 'thin'
                    }}>
                      {images.map((img, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          style={{
                            width: '70px',
                            height: '45px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: activeImageIndex === idx ? '2px solid var(--primary)' : '2px solid transparent',
                            opacity: activeImageIndex === idx ? 1 : 0.6,
                            transition: 'opacity 0.2s, border-color 0.2s',
                            flexShrink: 0
                          }}
                        >
                          <img src={img} alt={`Miniatur ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, rgba(13, 19, 39, 0.4) 0%, rgba(20, 28, 56, 0.4) 100%)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  color: 'var(--text-muted)',
                  position: 'relative'
                }}>
                  <Home size={40} style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '0.85rem' }}>Keine Bilder verfügbar</span>
                  {enriching && (
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(3, 7, 18, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      zIndex: 20
                    }}>
                      <Loader2 size={24} className="spinner" style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>Lade Detailbilder & Infos...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Statusbar bei Detail-Enrichment, falls nicht über dem Slider */}
              {enriching && !images.length && (
                <div style={{
                  background: 'rgba(0, 242, 254, 0.05)',
                  border: '1px solid rgba(0, 242, 254, 0.2)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--primary)',
                  fontSize: '0.85rem'
                }}>
                  <Loader2 size={16} className="spinner" />
                  <span>Detaillierte Inserats-Informationen werden von der Portalseite geladen...</span>
                </div>
              )}

              {/* Preisanalyse & Mietspiegel-Vergleich */}
              <PriceChart listing={listing} preferences={preferences} />

              {/* ===== VISUELLE BILDANALYSE (Phase 2) ===== */}
              {images && images.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: imageAnalysis ? '0.85rem' : '0' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                      <span>Visuelle KI-Analyse</span>
                      {imageAnalysis && (
                        <span style={{
                          background: imageAnalysis.overallImpression === 'gut' ? 'rgba(16,185,129,0.15)' : imageAnalysis.overallImpression === 'mittel' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                          color: imageAnalysis.overallImpression === 'gut' ? '#10b981' : imageAnalysis.overallImpression === 'mittel' ? '#f59e0b' : '#ef4444',
                          fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '20px',
                          border: `1px solid ${imageAnalysis.overallImpression === 'gut' ? 'rgba(16,185,129,0.3)' : imageAnalysis.overallImpression === 'mittel' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                          {imageAnalysis.overallImpression === 'gut' ? 'Guter Eindruck' : imageAnalysis.overallImpression === 'mittel' ? 'Mittelmäßig' : 'Schlechter Eindruck'}
                        </span>
                      )}
                    </h4>
                    <button
                      className="btn"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      disabled={analyzingImages}
                      onClick={async () => {
                        setAnalyzingImages(true);
                        try {
                          const res = await fetch(`${backendUrl}/api/listings/${id}/analyze-images`, { method: 'POST' });
                          if (res.ok) {
                            const data = await res.json();
                            setImageAnalysis(data.imageAnalysis);
                            onUpdateListing(data.listing);
                          } else {
                            const err = await res.json();
                            alert(err.error || 'Fehler bei der Bildanalyse.');
                          }
                        } catch (e) {
                          alert('Netzwerkfehler bei der Bildanalyse.');
                        } finally {
                          setAnalyzingImages(false);
                        }
                      }}
                    >
                      {analyzingImages ? <Loader2 size={12} className="spinner" /> : <Sparkles size={12} />}
                      <span>{analyzingImages ? 'Analysiere...' : imageAnalysis ? 'Neu analysieren' : 'Fotos analysieren'}</span>
                    </button>
                  </div>
                  {imageAnalysis && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        „{imageAnalysis.summary}"
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                            <span>☀️ Helligkeit</span><span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{imageAnalysis.brightnessScore}%</span>
                          </div>
                          <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${imageAnalysis.brightnessScore}%`, height: '100%', background: `hsl(${imageAnalysis.brightnessScore * 1.2}, 80%, 55%)`, borderRadius: '3px' }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                            <span>🏠 Zustand</span><span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{imageAnalysis.conditionScore}%</span>
                          </div>
                          <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${imageAnalysis.conditionScore}%`, height: '100%', background: `hsl(${imageAnalysis.conditionScore * 1.2}, 80%, 55%)`, borderRadius: '3px' }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Boden: <strong style={{ color: 'var(--text-main)' }}>{imageAnalysis.flooringType}</strong></span>
                        <span style={{ color: 'var(--border)' }}>|</span>
                        <span style={{ color: 'var(--text-muted)' }}>Bad: <strong style={{ color: 'var(--text-main)' }}>{imageAnalysis.bathroomStyle}</strong></span>
                        {imageAnalysis.hasModernKitchen !== null && (
                          <>
                            <span style={{ color: 'var(--border)' }}>|</span>
                            <span style={{ color: 'var(--text-muted)' }}>Küche: <strong style={{ color: imageAnalysis.hasModernKitchen ? '#10b981' : '#f59e0b' }}>{imageAnalysis.hasModernKitchen ? 'Modern ✓' : 'Nicht modern'}</strong></span>
                          </>
                        )}
                      </div>
                      {imageAnalysis.positiveFeatures?.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {imageAnalysis.positiveFeatures.map((f, i) => (
                            <span key={i} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>✓ {f}</span>
                          ))}
                          {imageAnalysis.negativeFeatures?.map((f, i) => (
                            <span key={i} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>✗ {f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* KI-Matching-Score Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className={`score-badge ${getScoreClass(matchScore || 50)}`} style={{ width: '60px', height: '60px', fontSize: '1.3rem', flexShrink: 0 }}>
                  {evaluating ? <Loader2 size={20} className="spinner" style={{ color: 'var(--primary)' }} /> : (matchScore ? `${matchScore}%` : '?')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>KI-Matching Score</h3>
                    <button
                      className="btn"
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={handleReevaluate}
                      disabled={evaluating || enriching}
                      title="Neu bewerten"
                    >
                      <RotateCw size={12} className={evaluating ? 'spinner' : ''} />
                      <span>{evaluating ? 'Bewertet...' : 'Neu bewerten'}</span>
                    </button>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Basierend auf deinen Kriterien bewertet.
                  </span>
                </div>
              </div>

              {/* ÖPNV Live-Abfahrtsmonitor */}
              {liveDepartures && liveDepartures.length > 0 && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🚌 Live-Abfahrten an nächster Haltestelle ({liveDepartures[0]?.stopName})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                    {liveDepartures.map((dep, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{dep.line} ➔ {dep.direction}</span>
                        <span style={{ fontWeight: 700, color: dep.departureMin <= 5 ? '#10b981' : 'var(--text-main)' }}>
                          in {dep.departureMin} Min.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partner-Abstimmung (Multi-User) */}
              {preferences?.partnerModeEnabled && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    👥 Partner-Abstimmung
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Partner A */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {preferences.partnerAName}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            background: listing.partnerVotes?.partnerA === 'like' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                            borderColor: listing.partnerVotes?.partnerA === 'like' ? '#10b981' : 'var(--border)',
                            color: listing.partnerVotes?.partnerA === 'like' ? '#10b981' : 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleVote('partnerA', listing.partnerVotes?.partnerA === 'like' ? null : 'like')}
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            background: listing.partnerVotes?.partnerA === 'dislike' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            borderColor: listing.partnerVotes?.partnerA === 'dislike' ? '#ef4444' : 'var(--border)',
                            color: listing.partnerVotes?.partnerA === 'dislike' ? '#ef4444' : 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleVote('partnerA', listing.partnerVotes?.partnerA === 'dislike' ? null : 'dislike')}
                        >
                          👎
                        </button>
                      </div>
                    </div>

                    {/* Partner B */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {preferences.partnerBName}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            background: listing.partnerVotes?.partnerB === 'like' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                            borderColor: listing.partnerVotes?.partnerB === 'like' ? '#10b981' : 'var(--border)',
                            color: listing.partnerVotes?.partnerB === 'like' ? '#10b981' : 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleVote('partnerB', listing.partnerVotes?.partnerB === 'like' ? null : 'like')}
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            background: listing.partnerVotes?.partnerB === 'dislike' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            borderColor: listing.partnerVotes?.partnerB === 'dislike' ? '#ef4444' : 'var(--border)',
                            color: listing.partnerVotes?.partnerB === 'dislike' ? '#ef4444' : 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleVote('partnerB', listing.partnerVotes?.partnerB === 'dislike' ? null : 'dislike')}
                        >
                          👎
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* KI-Besichtigungs-Coach & Sprachnotizen */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🎙️ KI-Besichtigungs-Coach & Vor-Ort Notizen
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Trage deine Eindrücke oder Diktate der Besichtigung ein. Gemini analysiert sie automatisch und aktualisiert Vor- und Nachteile.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="z. B. Bad saniert, Balkon hat Sonne, aber Fenster im Schlafzimmer wirken alt"
                    value={viewingNoteInput}
                    onChange={e => setViewingNoteInput(e.target.value)}
                    style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', fontSize: '0.82rem', color: 'var(--text-main)' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveViewingNote}
                    disabled={submittingViewingNote || !viewingNoteInput.trim()}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    {submittingViewingNote ? 'Analysiere...' : 'Auswerten'}
                  </button>
                </div>

                {listing.viewingNotesList && listing.viewingNotesList.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {listing.viewingNotesList.map((vn, i) => (
                      <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Eindruck: {vn.analysis?.summary || vn.noteText}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {matchSummary && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-main)' }}>AI Fazit:</strong>
                    {matchSummary}
                  </div>
                </div>
              )}

              {/* Warnbox für Kostenfalle */}
              {listing.hiddenCosts?.detected && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  color: '#f87171'
                }}>
                  <span style={{ fontSize: '1.2rem', marginTop: '-2px' }}>⚠️</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#ef4444' }}>Achtung: Kostenfalle / Risiko erkannt!</strong>
                    {listing.hiddenCosts.details || 'Die KI hat Anzeichen für versteckte Kosten oder vertragliche Risiken (z.B. Indexmiete, Staffelmiete oder separate Heizkostenabrechnung) in der Beschreibung gefunden.'}
                  </div>
                </div>
              )}

              {/* Kriterien-Checklist */}
              {criteriaBreakdown && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                    <span>Kriterien-Checkliste</span>
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                      const item = criteriaBreakdown[key];
                      if (!item) return null;
                      
                      let statusIcon = null;
                      let bg = 'rgba(255, 255, 255, 0.02)';
                      let border = '1px solid var(--border)';
                      
                      if (item.status === 'pass') {
                        statusIcon = <Check size={14} style={{ color: '#10b981' }} />;
                        bg = 'rgba(16, 185, 129, 0.03)';
                        border = '1px solid rgba(16, 185, 129, 0.15)';
                      } else if (item.status === 'fail') {
                        statusIcon = <X size={14} style={{ color: '#ef4444' }} />;
                        bg = 'rgba(239, 68, 68, 0.03)';
                        border = '1px solid rgba(239, 68, 68, 0.15)';
                      } else {
                        statusIcon = <Info size={14} style={{ color: 'var(--text-muted)' }} />;
                      }
                      
                      return (
                        <div 
                          key={key}
                          style={{
                            display: 'flex',
                            gap: '0.6rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            background: bg,
                            border: border,
                            fontSize: '0.8rem',
                            lineHeight: 1.4
                          }}
                        >
                          <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16px', width: '16px', flexShrink: 0 }}>
                            {statusIcon}
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)' }}>{label}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.detail}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Miete, QM, Zimmer Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Warmmiete</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{priceWarm ? `${priceWarm} €` : 'N/A'}</span>
                </div>
                <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Kaltmiete</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{priceKalt ? `${priceKalt} €` : 'N/A'}</span>
                </div>
                <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Mietpreis/m²</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{priceKalt && sqm ? `${(priceKalt / sqm).toFixed(2)} €/m²` : 'N/A'}</span>
                </div>
                <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fläche</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{sqm ? `${sqm} m²` : 'N/A'}</span>
                </div>
                <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Zimmer</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{rooms ? `${rooms}` : 'N/A'}</span>
                </div>
                {distanceKm !== undefined && distanceKm !== null && (
                  <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Entfernung</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{distanceKm.toFixed(1)} km</span>
                  </div>
                )}
                {liveDistanceKm !== null && (
                  <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>📍 Live-Distanz</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{liveDistanceKm.toFixed(1)} km</span>
                  </div>
                )}
                {travelTimeDrivingMin > 0 && (
                  <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>🚗 Auto</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{travelTimeDrivingMin} Min</span>
                  </div>
                )}
                {travelTimeBicycleMin > 0 && (
                  <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>🚲 Fahrrad</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{travelTimeBicycleMin} Min</span>
                  </div>
                )}
                {travelTimeFootMin > 0 && (
                  <div style={{ background: 'rgba(0, 242, 254, 0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>🚶 Zu Fuß</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{travelTimeFootMin} Min</span>
                  </div>
                )}
              </div>

              {/* Pendelzeiten zu allen Zielen - Commute Matrix */}
              {targetTravelTimes && targetTravelTimes.length > 0 && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  overflowX: 'auto'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <Compass size={16} style={{ color: 'var(--primary)' }} />
                    <span>Mobilitäts- & Pendelzeiten-Matrix</span>
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem 0.25rem' }}>Zielort</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>Distanz</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>🚗 Auto</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>🚲 Fahrrad</th>
                        <th style={{ padding: '0.5rem 0.25rem' }}>🚋 ÖPNV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetTravelTimes.map((target, idx) => {
                        const getDurationStyle = (min) => {
                          if (min === undefined || min === null) return { color: 'var(--text-muted)' };
                          if (min < 20) return { color: '#10b981', fontWeight: 600 }; // Green
                          if (min <= 40) return { color: '#f59e0b', fontWeight: 600 }; // Yellow
                          return { color: '#ef4444', fontWeight: 600 }; // Red
                        };

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.6rem 0.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              {target.label}
                            </td>
                            <td style={{ padding: '0.6rem 0.25rem', color: 'var(--text-muted)' }}>
                              {target.distanceKm ? `${target.distanceKm.toFixed(1)} km` : 'N/A'}
                            </td>
                            <td style={{ padding: '0.6rem 0.25rem', ...getDurationStyle(target.durationDriving) }}>
                              {target.durationDriving !== undefined ? `${target.durationDriving} Min` : 'N/A'}
                            </td>
                            <td style={{ padding: '0.6rem 0.25rem', ...getDurationStyle(target.durationBicycle) }}>
                              {target.durationBicycle !== undefined ? `${target.durationBicycle} Min` : 'N/A'}
                            </td>
                            <td style={{ padding: '0.6rem 0.25rem', ...getDurationStyle(target.durationTransit) }}>
                              {target.durationTransit !== undefined ? `${target.durationTransit} Min` : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ===== FINANZ- & MIETPREIS-CHECK ===== */}
              {preferences && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <span style={{ fontSize: '1.1rem' }}>💰</span>
                    <span>Finanz- & Mietpreis-Check</span>
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* 1. Nettoeinkommen / 30%-Regel */}
                    {priceWarm && preferences.netIncome ? (() => {
                      const ratio = Math.round((priceWarm / preferences.netIncome) * 100);
                      let ratioColor = '#10b981'; // Green
                      let ratioLabel = 'Sehr gut (unter 30%)';
                      if (ratio > 30 && ratio <= 40) {
                        ratioColor = '#e5e7eb'; // Neutral
                        ratioColor = '#f59e0b'; // Yellow
                        ratioLabel = 'Erhöht (30% - 40%)';
                      } else if (ratio > 40) {
                        ratioColor = '#ef4444'; // Red
                        ratioLabel = 'Kritisch (über 40%)';
                      }
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Mietbelastungsquote (30%-Regel)</span>
                            <strong style={{ color: ratioColor }}>{ratio}% ({ratioLabel})</strong>
                          </div>
                          <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(ratio, 100)}%`, height: '100%', background: ratioColor, borderRadius: '4px', transition: 'width 0.3s' }}></div>
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                            Warmmiete ({priceWarm} €) von {preferences.netIncome} € Nettoeinkommen.
                          </div>
                        </div>
                      );
                    })() : null}

                    {/* 2. Nebenkosten-Check */}
                    {(() => {
                      const actualNK = (priceWarm && priceKalt) ? (priceWarm - priceKalt) : (listing.estimatedNebenkosten || null);
                      if (actualNK === null) return null;
                      const maxNK = preferences.maxNebenkosten ?? 250;
                      const isOverNK = actualNK > maxNK;
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '8px', background: isOverNK ? 'rgba(239, 68, 68, 0.03)' : 'rgba(16, 185, 129, 0.03)', border: isOverNK ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)', fontSize: '0.8rem' }}>
                          <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)' }}>Nebenkosten-Check</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.73rem' }}>
                              Schätzung/Berechnung: {actualNK} € (Limit: {maxNK} €)
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: isOverNK ? '#ef4444' : '#10b981' }}>
                            {isOverNK ? 'Über Budget ❌' : 'Im Budget ✔️'}
                          </span>
                        </div>
                      );
                    })()}

                    {/* 3. Kautions-Check */}
                    {(() => {
                      const actualKaution = listing.estimatedKaution || (priceKalt ? priceKalt * 3 : null);
                      if (actualKaution === null) return null;
                      const maxKaution = preferences.maxKaution ?? 2000;
                      const isOverKaution = actualKaution > maxKaution;
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '8px', background: isOverKaution ? 'rgba(239, 68, 68, 0.03)' : 'rgba(16, 185, 129, 0.03)', border: isOverKaution ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)', fontSize: '0.8rem' }}>
                          <div>
                            <strong style={{ display: 'block', color: 'var(--text-main)' }}>Mietkaution</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.73rem' }}>
                              Berechnet: {actualKaution} € (Kautionslimit: {maxKaution} €)
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: isOverKaution ? '#ef4444' : '#10b981' }}>
                            {isOverKaution ? 'Über Kautionslimit ❌' : 'Im Kautionsbudget ✔️'}
                          </span>
                        </div>
                      );
                    })()}

                    {/* 4. Mietpreisbremse (Rent Control) */}
                    {priceKalt && sqm && (() => {
                      const rentPerSqm = priceKalt / sqm;
                      const mietspiegelRef = preferences.mietspiegelReference ?? 12.5;
                      const aiEstimatedMietspiegel = listing.mietpreisbremseCheck?.estimatedMietspiegelSqm;
                      
                      const exceedsRef = rentPerSqm > mietspiegelRef * 1.1;
                      const exceedsAi = aiEstimatedMietspiegel ? (rentPerSqm > aiEstimatedMietspiegel * 1.1) : false;
                      
                      const showWarning = exceedsRef || exceedsAi;
                      
                      return (
                        <div style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          background: showWarning ? 'rgba(245, 158, 11, 0.03)' : 'rgba(16, 185, 129, 0.03)',
                          border: showWarning ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)',
                          fontSize: '0.8rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <strong style={{ color: 'var(--text-main)' }}>Mietpreisbremse-Check</strong>
                            <span style={{ fontWeight: 700, color: showWarning ? '#f59e0b' : '#10b981' }}>
                              {showWarning ? 'Verdacht auf Verstoß ⚠️' : 'Unverdächtig ✔️'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            <div>Aktueller Quadratmeterpreis: <strong>{rentPerSqm.toFixed(2)} €/m²</strong></div>
                            <div>Hinterlegter Richtwert: {mietspiegelRef} €/m² {exceedsRef && <span style={{ color: '#ef4444' }}>(überschritten)</span>}</div>
                            {aiEstimatedMietspiegel && (
                              <div>KI geschätzter Mietspiegel: {aiEstimatedMietspiegel} €/m² {exceedsAi && <span style={{ color: '#ef4444' }}>(überschritten)</span>}</div>
                            )}
                            {listing.mietpreisbremseCheck?.explanation && (
                              <div style={{ marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.3 }}>
                                "{listing.mietpreisbremseCheck.explanation}"
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              )}

              {/* Pros & Cons */}
              <div className="pro-con-grid" style={{ margin: '1.5rem 0 0 0' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--success)' }}>Vorteile</h4>
                  <ul className="pro-list">
                    {pros && pros.length > 0 ? (
                      pros.map((p, idx) => <li key={idx}>{p}</li>)
                    ) : (
                      <li>Keine besonderen Vorteile gelistet.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--danger)' }}>Nachteile</h4>
                  <ul className="con-list">
                    {cons && cons.length > 0 ? (
                      cons.map((c, idx) => <li key={idx}>{c}</li>)
                    ) : (
                      <li>Keine besonderen Nachteile gelistet.</li>
                    )}
                  </ul>
                </div>
              </div>

              {description && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Beschreibung</h4>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    maxHeight: '180px',
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {description}
                  </p>
                </div>
              )}

              {lat && lon && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lage auf Karte</h4>
                  <div style={{
                    width: '100%',
                    height: '250px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)'
                  }}>
                    <iframe
                      title="Wohnungsstandort"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={mapUrl}
                      style={{ border: 'none' }}
                    ></iframe>
                  </div>
                  <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    <a 
                      href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      Größere Karte anzeigen
                    </a>
                  </small>
                  
                  {pois && (pois.supermarkets?.length > 0 || pois.publicTransit?.length > 0 || pois.parks?.length > 0) && (
                    <div style={{ marginTop: '1rem', background: 'var(--bg-card)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <h5 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>📍 Infrastruktur in der Nähe (1km)</span>
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', fontSize: '0.72rem' }}>
                        {pois.supermarkets?.length > 0 && (
                          <div>
                            <strong style={{ display: 'block', color: '#10b981', marginBottom: '0.2rem' }}>🛒 Supermärkte</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {pois.supermarkets.slice(0, 3).map((poi, idx) => (
                                <li key={idx} style={{ color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={poi.name}>
                                  {poi.name} ({(poi.distanceKm * 1000).toFixed(0)}m)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {pois.publicTransit?.length > 0 && (
                          <div>
                            <strong style={{ display: 'block', color: '#3b82f6', marginBottom: '0.2rem' }}>🚌 ÖPNV</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {pois.publicTransit.slice(0, 3).map((poi, idx) => (
                                <li key={idx} style={{ color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={poi.name}>
                                  {poi.name} ({(poi.distanceKm * 1000).toFixed(0)}m)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {pois.parks?.length > 0 && (
                          <div>
                            <strong style={{ display: 'block', color: '#047857', marginBottom: '0.2rem' }}>🌳 Parks</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {pois.parks.slice(0, 3).map((poi, idx) => (
                                <li key={idx} style={{ color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={poi.name}>
                                  {poi.name} ({(poi.distanceKm * 1000).toFixed(0)}m)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rechte Seite: Anschreiben */}
            <div className="detail-letter-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                  <span>Bewerbungsanschreiben</span>
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn"
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}
                    onClick={handleRegenerateLetter}
                    disabled={loadingLetter}
                  >
                    <RotateCw size={12} className={loadingLetter ? 'spinner' : ''} />
                    <span>Neu generieren</span>
                  </button>
                  
                  {coverLetter && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}
                      onClick={handleCopy}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                    </button>
                  )}
                </div>
              </div>

              {loadingLetter ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '250px',
                  background: '#0d1222',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  gap: '1rem'
                }}>
                  <RotateCw size={36} className="spinner" style={{ color: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Erstelle Anschreiben mit Gemini...
                  </span>
                </div>
              ) : coverLetter ? (
                <div style={{
                  background: '#0d1222',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  fontSize: '0.875rem',
                  lineHeight: 1.75,
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-main)'
                }}>
                  {coverLetter}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '250px',
                  background: '#0d1222',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  textAlign: 'center',
                  padding: '2rem',
                  gap: '1rem'
                }}>
                  <Info size={32} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Kein Anschreiben vorhanden</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Generiere ein passendes Anschreiben basierend auf deinem Suchprofil und dieser Wohnung.
                    </span>
                  </div>
                  <button className="btn btn-primary" onClick={handleRegenerateLetter}>
                    <Sparkles size={14} />
                    <span>Anschreiben generieren</span>
                  </button>
                </div>
              )}

              {/* Schnell-Bewerbung */}
              {coverLetter && (() => {
                const hasSmtp = preferences?.smtpHost && preferences?.smtpUser && preferences?.smtpPassword;
                return (
                  <div style={{
                    background: 'rgba(0, 242, 254, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginTop: '1.25rem'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ExternalLink size={16} style={{ color: 'var(--primary)' }} />
                      <span>Auto-Mail Schnell-Bewerbung</span>
                    </h4>
                    
                    {hasSmtp ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Empfänger E-Mail</label>
                          <input
                            type="email"
                            placeholder="empfaenger@beispiel.de"
                            value={recipientEmailInput}
                            onChange={(e) => setRecipientEmailInput(e.target.value)}
                            style={{
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-main)',
                              padding: '0.45rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              width: '100%'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>E-Mail Betreff</label>
                          <input
                            type="text"
                            placeholder="Betreff"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            style={{
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-main)',
                              padding: '0.45rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              width: '100%'
                            }}
                          />
                        </div>

                        {documents.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dokumente für Bewerbungsmappe auswählen:</label>
                            <div style={{
                              maxHeight: '120px',
                              overflowY: 'auto',
                              background: 'rgba(0,0,0,0.15)',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem'
                            }}>
                              {documents.map(doc => (
                                <label key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', cursor: 'pointer', margin: 0 }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedDocIds.includes(doc.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedDocIds([...selectedDocIds, doc.id]);
                                      } else {
                                        setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
                                      }
                                    }}
                                    style={{ width: 'auto', margin: 0 }}
                                  />
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    [{doc.category}] {doc.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {preferences?.autopilotEnabled && (
                          <button
                            className="btn btn-secondary"
                            onClick={async () => {
                              setSendingEmail(true);
                              try {
                                const res = await fetch(`${backendUrl}/api/listings/${id}/apply`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    recipientEmail: recipientEmailInput
                                  })
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  onUpdateListing(data.listing);
                                  alert('Autopilot-Bewerbung erfolgreich gesendet!');
                                } else {
                                  const errData = await res.json();
                                  alert(errData.error || 'Fehler beim Senden.');
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Netzwerkfehler beim Senden der Autopilot-Bewerbung.');
                              } finally {
                                setSendingEmail(false);
                              }
                            }}
                            disabled={sendingEmail}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              padding: '0.55rem 1rem',
                              marginBottom: '0.5rem',
                              fontWeight: 600,
                              width: '100%',
                              background: 'rgba(16, 185, 129, 0.1)',
                              borderColor: '#10b981',
                              color: '#10b981',
                              cursor: 'pointer'
                            }}
                          >
                            {sendingEmail ? <Loader2 size={14} className="spinner" /> : <span>🚀</span>}
                            <span>{sendingEmail ? 'Wird gesendet...' : 'Autopilot Schnell-Bewerbung auslösen'}</span>
                          </button>
                        )}

                        <button
                          className="btn btn-primary"
                          onClick={async () => {
                            if (!recipientEmailInput) {
                              alert('Bitte eine Empfänger-E-Mail eingeben.');
                              return;
                            }
                            setSendingEmail(true);
                            try {
                              const res = await fetch(`${backendUrl}/api/listings/${id}/send-email-apply`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  recipientEmail: recipientEmailInput,
                                  subject: emailSubject,
                                  emailBody: coverLetter,
                                  documentIds: selectedDocIds,
                                  coverTitle: `Bewerbungsmappe - Bewerbung ${title}`
                                })
                              });
                              if (res.ok) {
                                const data = await res.json();
                                onUpdateListing(data.listing);
                                alert('E-Mail-Bewerbung erfolgreich gesendet und Status auf "Beworben" gesetzt!');
                              } else {
                                const errData = await res.json();
                                alert(errData.error || 'Fehler beim Senden der E-Mail-Bewerbung.');
                              }
                            } catch (err) {
                              console.error(err);
                              alert('Netzwerkfehler beim Senden der E-Mail-Bewerbung.');
                            } finally {
                              setSendingEmail(false);
                            }
                          }}
                          disabled={sendingEmail}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.55rem 1rem',
                            marginTop: '0.25rem',
                            fontWeight: 600,
                            width: '100%'
                          }}
                        >
                          {sendingEmail ? <Loader2 size={14} className="spinner" /> : <ExternalLink size={14} />}
                          <span>{sendingEmail ? 'Wird gesendet...' : 'Bewerbung per E-Mail senden (1-Klick)'}</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          Richte SMTP-Zugangsdaten in den Einstellungen ein, um dich direkt aus der App mit 1 Klick per E-Mail zu bewerben (inkl. PDF-Mappen-Anhang).
                        </p>
                        
                        {contactEmail ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Gefundene Vermieter-E-Mail: <strong style={{ color: 'var(--primary)' }}>{contactEmail}</strong>
                            </p>
                            <a
                              className="btn"
                              href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Bewerbung um die Wohnung: ${title}`)}&body=${encodeURIComponent(coverLetter)}`}
                              style={{
                                textDecoration: 'none',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 1rem',
                                fontSize: '0.82rem'
                              }}
                            >
                              <ExternalLink size={12} />
                              <span>Über lokales E-Mail Programm bewerben</span>
                            </a>
                          </div>
                        ) : (
                          <button
                            className="btn"
                            onClick={() => {
                              navigator.clipboard.writeText(coverLetter);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                              if (url) {
                                window.open(url, '_blank');
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              padding: '0.45rem 1rem',
                              cursor: 'pointer',
                              fontSize: '0.82rem'
                            }}
                          >
                            <ExternalLink size={12} />
                            <span>Anschreiben kopieren & Portal öffnen</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ===== BESICHTIGUNGSTERMIN ===== */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📅 Besichtigungstermin</span>
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Termin Datum & Uhrzeit</label>
                  <input
                    type="datetime-local"
                    value={viewingDate}
                    onChange={e => setViewingDate(e.target.value)}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Termin-Notizen</label>
                  <textarea
                    rows={2}
                    placeholder="z. B. Klingelname, Treffpunkt, benötigte Dokumente..."
                    value={viewingNotes}
                    onChange={e => setViewingNotes(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={handleSaveViewing}
                    disabled={savingViewing}
                  >
                    <Save size={12} />
                    <span>{savingViewing ? 'Speichert...' : 'Termin speichern'}</span>
                  </button>
                  
                  {listing.viewingDate && (
                    <button
                      className="btn"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={handleDownloadICS}
                    >
                      <ExternalLink size={12} />
                      <span>In Kalender (.ics)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ===== NOTIZEN ===== */}
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit2 size={16} style={{ color: 'var(--primary)' }} /> Meine Notizen
                </h3>

                {/* Notiz-Formular */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <input
                    type="text"
                    placeholder="Titel (optional)"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <textarea
                    rows={3}
                    placeholder="Notiz zu dieser Wohnung..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {editingNoteId && (
                      <button className="btn" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                        onClick={() => { setEditingNoteId(null); setNoteText(''); setNoteTitle(''); }}>
                        Abbrechen
                      </button>
                    )}
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}
                      onClick={handleSaveNote}
                      disabled={savingNote || !noteText.trim()}
                    >
                      <Save size={13} /> {editingNoteId ? 'Aktualisieren' : 'Notiz speichern'}
                    </button>
                  </div>
                </div>

                {/* Bestehende Notizen */}
                {notes.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Noch keine Notizen für diese Wohnung.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {notes.map(note => (
                      <div key={note.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                        {note.title && <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{note.title}</div>}
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{note.text}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(note.updatedAt).toLocaleString('de-DE')}</span>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => { setEditingNoteId(note.id); setNoteText(note.text); setNoteTitle(note.title || ''); }}>
                              <Edit2 size={12} />
                            </button>
                            <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                              onClick={() => handleDeleteNote(note.id)}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* ===== KI COPILOT CHAT WIDGET ===== */}
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem',
          pointerEvents: 'all'
        }}>
          {/* Chat Panel */}
          {chatOpen && (
            <div style={{
              width: '360px',
              height: '500px',
              background: 'linear-gradient(135deg, #0d1222 0%, #111827 100%)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0, 242, 254, 0.05)',
              overflow: 'hidden'
            }}>
              {/* Chat Header */}
              <div style={{
                padding: '0.85rem 1rem',
                background: 'linear-gradient(90deg, rgba(0,242,254,0.12), rgba(0,242,254,0.04))',
                borderBottom: '1px solid rgba(0,242,254,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bot size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>KI-Copilot</span>
                  <span style={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(16,185,129,0.3)'
                  }}>LIVE</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', lineHeight: 1 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                scrollbarWidth: 'thin'
              }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    {msg.role === 'model' && (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(0,242,254,0.2), rgba(0,242,254,0.05))',
                        border: '1px solid rgba(0,242,254,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Bot size={14} style={{ color: 'var(--primary)' }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '82%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(0,242,254,0.18), rgba(0,242,254,0.08))'
                        : 'rgba(255,255,255,0.04)',
                      border: msg.role === 'user'
                        ? '1px solid rgba(0,242,254,0.25)'
                        : '1px solid rgba(255,255,255,0.07)',
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(0,242,254,0.2), rgba(0,242,254,0.05))',
                      border: '1px solid rgba(0,242,254,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Loader2 size={14} className="spinner" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Copilot denkt nach...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Quick Suggestions */}
              <div style={{
                padding: '0.5rem 0.85rem 0 0.85rem',
                display: 'flex',
                gap: '0.4rem',
                flexWrap: 'wrap'
              }}>
                {['Warum dieser Score?', 'Haustiere erlaubt?', 'Besichtigungs-Tipps'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => { setChatInput(suggestion); }}
                    style={{
                      background: 'rgba(0,242,254,0.06)',
                      border: '1px solid rgba(0,242,254,0.15)',
                      borderRadius: '20px',
                      color: 'var(--text-muted)',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.55rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(0,242,254,0.14)'; e.target.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(0,242,254,0.06)'; e.target.style.color = 'var(--text-muted)'; }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div style={{
                padding: '0.75rem 0.85rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-end'
              }}>
                <textarea
                  rows={1}
                  placeholder="Frage zum Inserat stellen..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    resize: 'none',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(0,242,254,0.2)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    padding: '0.5rem 0.7rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    maxHeight: '80px',
                    overflowY: 'auto'
                  }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  style={{
                    background: chatInput.trim() && !chatLoading
                      ? 'linear-gradient(135deg, var(--primary), #0099cc)'
                      : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '10px',
                    color: chatInput.trim() && !chatLoading ? '#030712' : 'var(--text-muted)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Chat Toggle Button */}
          <button
            id="chat-copilot-toggle"
            onClick={() => setChatOpen(prev => !prev)}
            title="KI-Copilot für diese Wohnung"
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: chatOpen
                ? 'linear-gradient(135deg, #0099cc, rgba(0,242,254,0.7))'
                : 'linear-gradient(135deg, var(--primary), #0099cc)',
              border: '2px solid rgba(255,255,255,0.15)',
              color: '#030712',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,242,254,0.35), 0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: chatOpen ? 'scale(0.9) rotate(180deg)' : 'scale(1) rotate(0deg)'
            }}
            onMouseEnter={e => { if (!chatOpen) e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { if (!chatOpen) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {chatOpen ? <X size={22} /> : <MessageCircle size={22} />}
          </button>
        </div>

      </div>
    </div>
  );
}
