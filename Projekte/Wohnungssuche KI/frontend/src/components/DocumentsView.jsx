import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen, Upload, Trash2, FileText, FileImage, File,
  Plus, X, Save, Edit2, ChevronDown, ChevronUp,
  Briefcase, Star, Download, Search, Tag, Shield
} from 'lucide-react';

const CATEGORIES = ['Lebenslauf', 'Lohnnachweis', 'Personalausweis', 'Schufa', 'Referenzschreiben', 'Sonstiges'];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimetype) {
  if (!mimetype) return <File size={20} />;
  if (mimetype.startsWith('image/')) return <FileImage size={20} style={{ color: '#60a5fa' }} />;
  if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('document'))
    return <FileText size={20} style={{ color: '#a78bfa' }} />;
  return <File size={20} style={{ color: '#94a3b8' }} />;
}

export default function DocumentsView({ backendUrl, listings }) {
  const [activeTab, setActiveTab] = useState('docs'); // 'docs' | 'notes' | 'copilot' | 'lease'
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState('alle');
  const [editingNote, setEditingNote] = useState(null); // {id, listingId, title, text}
  const [newNoteListingId, setNewNoteListingId] = useState('');
  const [copilotListingId, setCopilotListingId] = useState('');
  const [copilotResult, setCopilotResult] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Sonstiges');
  const fileInputRef = useRef(null);
  const [portfolioTitle, setPortfolioTitle] = useState('Bewerbungsmappe');
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [generatingPortfolio, setGeneratingPortfolio] = useState(false);

  // Mietvertrag-Prüfer States
  const [leaseFile, setLeaseFile] = useState(null);
  const [leaseAnalyzing, setLeaseAnalyzing] = useState(false);
  const [leaseAnalysisResult, setLeaseAnalysisResult] = useState(null);
  const [leaseError, setLeaseError] = useState('');

  // Mieterselbstauskunft States
  const [showSelfDisclosureForm, setShowSelfDisclosureForm] = useState(false);
  const [sdGenerating, setSdGenerating] = useState(false);
  const [sdData, setSdData] = useState({
    address: '',
    flatDetail: '',
    p1Name: '',
    p1Birthdate: '',
    p1Birthplace: '',
    p1Address: '',
    p1Phone: '',
    p1Email: '',
    p1Job: '',
    p1Employer: '',
    p1Income: '',
    p2Name: '',
    p2Birthdate: '',
    p2Birthplace: '',
    p2Address: '',
    p2Phone: '',
    p2Email: '',
    p2Job: '',
    p2Employer: '',
    p2Income: '',
    rentArrears: false,
    bankruptcy: false,
    foreclosure: false,
    pets: 'no',
    petDetails: '',
    socialAssistance: false
  });

  useEffect(() => {
    loadDocuments();
    loadNotes();
  }, []);

  async function loadDocuments() {
    try {
      const res = await fetch(`${backendUrl}/api/documents`);
      if (res.ok) setDocuments(await res.json());
    } catch { }
  }

  async function loadNotes() {
    try {
      const res = await fetch(`${backendUrl}/api/notes`);
      if (res.ok) setNotes(await res.json());
    } catch { }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', uploadName || file.name);
    formData.append('category', uploadCategory);
    try {
      const res = await fetch(`${backendUrl}/api/documents`, { method: 'POST', body: formData });
      if (res.ok) {
        const doc = await res.json();
        setDocuments(prev => [...prev, doc]);
        setUploadName('');
      }
    } catch { }
    setUploading(false);
    e.target.value = '';
  }

  async function deleteDocument(id) {
    if (!confirm('Dokument wirklich löschen?')) return;
    await fetch(`${backendUrl}/api/documents/${id}`, { method: 'DELETE' });
    setDocuments(prev => prev.filter(d => d.id !== id));
    setSelectedDocIds(prev => prev.filter(dId => dId !== id));
  }

  function toggleDocSelection(id) {
    setSelectedDocIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  function moveDocOrder(id, direction) {
    setSelectedDocIds(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      
      const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[nextIdx];
      updated[nextIdx] = temp;
      
      return updated;
    });
  }

  const [watermarkText, setWatermarkText] = useState('');

  async function downloadPortfolio() {
    setGeneratingPortfolio(true);
    try {
      const response = await fetch(`${backendUrl}/api/documents/generate-portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: portfolioTitle,
          documentIds: selectedDocIds,
          watermarkText
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${portfolioTitle || 'Bewerbungsmappe'}${watermarkText ? '-Wasserzeichen' : ''}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Fehler beim Generieren der Bewerbungsmappe.');
      }
    } catch (err) {
      console.error(err);
      alert('Netzwerkfehler beim Generieren der Bewerbungsmappe.');
    } finally {
      setGeneratingPortfolio(false);
    }
  }

  // Profildaten für die Selbstauskunft als Vorgabe laden
  useEffect(() => {
    async function loadProfilePrefs() {
      try {
        const res = await fetch(`${backendUrl}/api/preferences`);
        if (res.ok) {
          const data = await res.json();
          setSdData(prev => ({
            ...prev,
            p1Name: data.candidateName || '',
            p1Email: data.candidateEmail || '',
            p1Phone: data.candidatePhone || ''
          }));
        }
      } catch (err) {
        console.error('Fehler beim Laden der Profildaten:', err);
      }
    }
    if (showSelfDisclosureForm) {
      loadProfilePrefs();
    }
  }, [backendUrl, showSelfDisclosureForm]);

  async function handleGenerateSelfDisclosure(e) {
    e.preventDefault();
    setSdGenerating(true);
    try {
      const res = await fetch(`${backendUrl}/api/documents/generate-self-disclosure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sdData)
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [...prev, newDoc]);
        setShowSelfDisclosureForm(false);
        alert('Mieterselbstauskunft erfolgreich generiert und in deinen Unterlagen gespeichert!');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Fehler beim Generieren der Selbstauskunft.');
      }
    } catch (err) {
      console.error(err);
      alert('Netzwerkfehler beim Generieren.');
    } finally {
      setSdGenerating(false);
    }
  }

  async function saveNote() {
    if (!editingNote?.text?.trim() || !editingNote?.listingId) return;
    const method = editingNote.id ? 'PUT' : 'POST';
    const url = editingNote.id ? `${backendUrl}/api/notes/${editingNote.id}` : `${backendUrl}/api/notes`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: editingNote.listingId, title: editingNote.title, text: editingNote.text })
    });
    if (res.ok) {
      const saved = await res.json();
      setNotes(prev => {
        const idx = prev.findIndex(n => n.id === saved.id);
        if (idx !== -1) return prev.map(n => n.id === saved.id ? saved : n);
        return [...prev, saved];
      });
    }
    setEditingNote(null);
  }

  async function deleteNote(id) {
    await fetch(`${backendUrl}/api/notes/${id}`, { method: 'DELETE' });
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  async function generateCoverLetter() {
    if (!copilotListingId) return;
    const listing = listings.find(l => l.id === copilotListingId);
    if (!listing) return;
    setCopilotLoading(true);
    setCopilotResult('');
    try {
      const res = await fetch(`${backendUrl}/api/listings/${copilotListingId}/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotResult(data.coverLetter || data.text || 'Kein Ergebnis.');
      } else {
        setCopilotResult('Fehler beim Generieren. Bitte Gemini API Key im Suchprofil hinterlegen.');
      }
    } catch {
      setCopilotResult('Verbindungsfehler.');
    }
    setCopilotLoading(false);
  }

  const filteredDocs = documents.filter(d => {
    const matchesCat = docCategory === 'alle' || d.category === docCategory;
    const matchesSearch = !docSearch || d.name?.toLowerCase().includes(docSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const listingNotes = notes.filter(n => !newNoteListingId || n.listingId === newNoteListingId);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="page-title">
          <h1>Dokumente & Notizen</h1>
          <p>Verwalte deine Bewerbungsunterlagen, mache Notizen zu Inseraten und nutze den KI-Copilot</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        <button className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>
          <FolderOpen size={15} style={{ marginRight: 6 }} />Unterlagen
        </button>
        <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
          <Edit2 size={15} style={{ marginRight: 6 }} />Notizen
        </button>
        <button className={`tab-btn ${activeTab === 'copilot' ? 'active' : ''}`} onClick={() => setActiveTab('copilot')}>
          <Briefcase size={15} style={{ marginRight: 6 }} />Bewerbungs-Copilot
        </button>
        <button className={`tab-btn ${activeTab === 'lease' ? 'active' : ''}`} onClick={() => setActiveTab('lease')}>
          <Shield size={15} style={{ marginRight: 6 }} />Mietvertrag-Prüfer
        </button>
      </div>

      {/* ====== DOKUMENTE TAB ====== */}
      {activeTab === 'docs' && (
        <div>
          {/* Upload-Bereich */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            transition: 'border-color 0.2s'
          }}>
            <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.75rem', opacity: 0.8 }} />
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Dokument hochladen</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              PDF, Word, Bilder bis 10 MB
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Name (optional)"
                value={uploadName}
                onChange={e => setUploadName(e.target.value)}
                style={{ width: '200px', fontSize: '0.85rem' }}
              />
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt" />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={16} />
                <span>{uploading ? 'Lade hoch...' : 'Datei auswählen'}</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setShowSelfDisclosureForm(true)}
                style={{ background: 'rgba(0, 242, 254, 0.05)', borderColor: 'var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Selbstauskunft erstellen</span>
              </button>
            </div>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Suchen..." value={docSearch} onChange={e => setDocSearch(e.target.value)} style={{ paddingLeft: '2rem', fontSize: '0.85rem' }} />
            </div>
            <div className="tabs" style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
              <button className={`tab-btn ${docCategory === 'alle' ? 'active' : ''}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => setDocCategory('alle')}>
                Alle
              </button>
              {CATEGORIES.map(c => (
                <button key={c} className={`tab-btn ${docCategory === c ? 'active' : ''}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => setDocCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dokument-Liste */}
          {filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <FolderOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p>Noch keine Unterlagen hochgeladen.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredDocs.map(doc => (
                <div key={doc.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ color: 'var(--primary)' }}>{getFileIcon(doc.mimetype)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={11} /> {doc.category}
                      </span>
                      <span>{formatFileSize(doc.size)}</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <a
                      href={`${backendUrl}${doc.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Download size={14} /> Öffnen
                    </a>
                    <button
                      className="btn"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bewerbungsmappe konfigurieren */}
          {documents.length > 0 && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginTop: '2.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <Briefcase size={18} style={{ color: 'var(--primary)' }} />
                <span>Bewerbungsmappe zusammenstellen</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Wähle die Dokumente aus, die an das Deckblatt (inkl. Name, E-Mail, Telefon und Profilbild aus deinem Suchprofil) angehängt werden sollen. 
                Die PDF-Mappe wird automatisch zusammengestellt.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Titel der Mappe</label>
                  <input
                    type="text"
                    placeholder="z. B. Bewerbungsunterlagen - Max Mustermann"
                    value={portfolioTitle}
                    onChange={e => setPortfolioTitle(e.target.value)}
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Dokumente auswählen & sortieren</label>
                  {documents.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <div key={doc.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: isSelected ? 'rgba(0, 242, 254, 0.04)' : 'transparent',
                        border: isSelected ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDocSelection(doc.id)}
                            style={{ cursor: 'pointer', width: 'auto', margin: 0 }}
                          />
                          <span style={{ color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>{doc.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                            {doc.category}
                          </span>
                        </div>
                        
                        {/* Sortierungs-Pfeile */}
                        {isSelected && (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              type="button"
                              className="btn"
                              style={{ padding: '0.2rem 0.4rem' }}
                              onClick={() => moveDocOrder(doc.id, 'up')}
                              disabled={selectedDocIds.indexOf(doc.id) === 0}
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn"
                              style={{ padding: '0.2rem 0.4rem' }}
                              onClick={() => moveDocOrder(doc.id, 'down')}
                              disabled={selectedDocIds.indexOf(doc.id) === selectedDocIds.length - 1}
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={downloadPortfolio}
                disabled={generatingPortfolio || selectedDocIds.length === 0}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {generatingPortfolio ? (
                  <>
                    <span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '6px' }} />
                    Generiere Mappe...
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Mappe als PDF herunterladen
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ====== NOTIZEN TAB ====== */}
      {activeTab === 'notes' && (
        <div>
          {/* Neue Notiz erstellen */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} style={{ color: 'var(--primary)' }} /> Neue Notiz
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <select
                value={editingNote?.listingId || ''}
                onChange={e => setEditingNote(n => ({ ...(n || { title: '', text: '' }), listingId: e.target.value, id: null }))}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
              >
                <option value="">-- Inserat auswählen --</option>
                {listings.map(l => (
                  <option key={l.id} value={l.id}>{l.title} ({l.location})</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Titel (optional)"
                value={editingNote?.title || ''}
                onChange={e => setEditingNote(n => ({ ...(n || { listingId: '', text: '' }), title: e.target.value }))}
                style={{ fontSize: '0.85rem' }}
              />
              <textarea
                placeholder="Notiz schreiben..."
                rows={4}
                value={editingNote?.text || ''}
                onChange={e => setEditingNote(n => ({ ...(n || { listingId: '', title: '' }), text: e.target.value }))}
                style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                {editingNote?.id && (
                  <button className="btn" onClick={() => setEditingNote(null)}>Abbrechen</button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={saveNote}
                  disabled={!editingNote?.text?.trim() || !editingNote?.listingId}
                >
                  <Save size={15} /> Notiz speichern
                </button>
              </div>
            </div>
          </div>

          {/* Filter nach Inserat */}
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
            <select
              value={newNoteListingId}
              onChange={e => setNewNoteListingId(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.65rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
            >
              <option value="">Alle Inserate</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>

          {/* Notizen-Liste */}
          {listingNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Edit2 size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p>Noch keine Notizen vorhanden.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {listingNotes.map(note => {
                const listing = listings.find(l => l.id === note.listingId);
                return (
                  <div key={note.id} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    transition: 'border-color 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                      <div>
                        {note.title && (
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{note.title}</div>
                        )}
                        {listing && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                            🏠 {listing.title}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          onClick={() => setEditingNote({ ...note })}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{note.text}</p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(note.updatedAt).toLocaleString('de-DE')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====== BEWERBUNGS-COPILOT TAB ====== */}
      {activeTab === 'copilot' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05), rgba(79, 209, 197, 0.05))',
            border: '1px solid rgba(0, 242, 254, 0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} style={{ color: 'var(--primary)' }} /> KI-Bewerbungs-Copilot
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Wähle ein Inserat aus und lass die KI ein maßgeschneidertes Anschreiben für dich erstellen –
              basierend auf deinem Profil und den Wohnungsdetails.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Inserat auswählen</label>
            <select
              value={copilotListingId}
              onChange={e => { setCopilotListingId(e.target.value); setCopilotResult(''); }}
              style={{ fontSize: '0.9rem', padding: '0.6rem 0.9rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-main)' }}
            >
              <option value="">-- Inserat auswählen --</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>
                  {l.matchScore ? `[${l.matchScore}%] ` : ''}{l.title} – {l.location} ({l.priceKalt ? `${l.priceKalt}€` : 'k. A.'})
                </option>
              ))}
            </select>

            {copilotListingId && listings.find(l => l.id === copilotListingId) && (() => {
              const l = listings.find(ll => ll.id === copilotListingId);
              return (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>{l.title}</strong>
                  <div style={{ marginTop: '0.3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {l.priceKalt > 0 && <span>💰 {l.priceKalt}€ kalt</span>}
                    {l.sqm > 0 && <span>📐 {l.sqm} m²</span>}
                    {l.rooms > 0 && <span>🚪 {l.rooms} Zimmer</span>}
                    {l.matchScore > 0 && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>⭐ {l.matchScore}% Match</span>}
                  </div>
                </div>
              );
            })()}

            <button
              className="btn btn-primary"
              onClick={generateCoverLetter}
              disabled={!copilotListingId || copilotLoading}
              style={{ alignSelf: 'flex-start', padding: '0.65rem 1.5rem' }}
            >
              {copilotLoading ? (
                <><span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 8 }} />Generiere Anschreiben...</>
              ) : (
                <><Briefcase size={16} /> Anschreiben generieren</>
              )}
            </button>
          </div>

          {copilotResult && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>✉️ Generiertes Anschreiben</h3>
                <button
                  className="btn"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => {
                    navigator.clipboard.writeText(copilotResult);
                  }}
                >
                  📋 Kopieren
                </button>
              </div>
              <pre style={{
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
                color: 'var(--text-main)',
                margin: 0
              }}>{copilotResult}</pre>
            </div>
          )}
        </div>
      )}

      {/* ====== MIETVERTRAG-PRÜFER TAB ====== */}
      {activeTab === 'lease' && (() => {
        return (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05), rgba(79, 209, 197, 0.05))',
              border: '1px solid rgba(0, 242, 254, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} style={{ color: 'var(--primary)' }} /> Mietvertrag-Prüfer (KI-Audit)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Lade deinen Mietvertrag als PDF-Datei hoch. Die KI prüft den Vertrag automatisch auf unzulässige Klauseln (z.B. unwirksame Schönheitsreparatur-Regeln, unzulässige Tierhaltungs-Klauseln), Kündigungssperren und Kostenfallen (z.B. versteckte Index-/Staffelmieten oder unzulässige Betriebskostenumlagen) nach deutscher Rechtsprechung.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div 
              style={{
                background: 'var(--bg-surface)',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                marginBottom: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 242, 254, 0.02)';
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'transparent';
                const file = e.dataTransfer.files?.[0];
                if (file && file.type === 'application/pdf') {
                  setLeaseFile(file);
                  setLeaseError('');
                } else {
                  setLeaseError('Bitte nur PDF-Dateien hochladen.');
                }
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';
                input.onchange = (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLeaseFile(file);
                    setLeaseError('');
                  }
                };
                input.click();
              }}
            >
              <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '0.75rem', opacity: 0.8 }} />
              {leaseFile ? (
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Ausgewählte Datei:</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>{leaseFile.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({formatFileSize(leaseFile.size)}) · Klicken zum Ändern</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Mietvertrag per Drag & Drop hierher ziehen</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Oder klicken, um deinen PDF-Mietvertrag auszuwählen</p>
                </div>
              )}
            </div>

            {leaseError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                {leaseError}
              </div>
            )}

            {leaseFile && !leaseAnalyzing && (
              <button
                className="btn btn-primary"
                onClick={async () => {
                  setLeaseAnalyzing(true);
                  setLeaseAnalysisResult(null);
                  setLeaseError('');
                  const formData = new FormData();
                  formData.append('file', leaseFile);
                  try {
                    const res = await fetch(`${backendUrl}/api/documents/analyze-lease`, {
                      method: 'POST',
                      body: formData
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setLeaseAnalysisResult(data.analysis);
                    } else {
                      const errData = await res.json();
                      setLeaseError(errData.error || 'Fehler beim Analysieren des Mietvertrags.');
                    }
                  } catch (err) {
                    setLeaseError('Netzwerkfehler beim Analysieren.');
                  } finally {
                    setLeaseAnalyzing(false);
                  }
                }}
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Shield size={16} />
                <span>Mietvertrag jetzt prüfen</span>
              </button>
            )}

            {leaseAnalyzing && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '2rem'
              }}>
                <span className="spinner" style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(0, 242, 254, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div>
                  <h4 style={{ fontWeight: 700, margin: '0 0 0.5rem 0' }}>Mietvertrag wird analysiert...</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
                    Der PDF-Text wird ausgelesen und durch den Mietrechts-Experten auf Basis aktueller BGH-Urteile und rechtlicher Fallstricke geprüft. Dies kann bis zu 30 Sekunden dauern.
                  </p>
                </div>
              </div>
            )}

            {leaseAnalysisResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                
                {/* Highlight/Fazit Box */}
                <div style={{
                  background: leaseAnalysisResult.overallVerdict === 'good' ? 'rgba(16, 185, 129, 0.05)' : leaseAnalysisResult.overallVerdict === 'warning' ? 'rgba(233, 201, 75, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${leaseAnalysisResult.overallVerdict === 'good' ? 'rgba(16, 185, 129, 0.25)' : leaseAnalysisResult.overallVerdict === 'warning' ? 'rgba(233, 201, 75, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: leaseAnalysisResult.overallVerdict === 'good' ? 'rgba(16, 185, 129, 0.1)' : leaseAnalysisResult.overallVerdict === 'warning' ? 'rgba(233, 201, 75, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: leaseAnalysisResult.overallVerdict === 'good' ? '#10b981' : leaseAnalysisResult.overallVerdict === 'warning' ? '#ecc94b' : '#ef4444',
                    flexShrink: 0
                  }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: leaseAnalysisResult.overallVerdict === 'good' ? '#10b981' : leaseAnalysisResult.overallVerdict === 'warning' ? '#ecc94b' : '#ef4444' }}>
                      {leaseAnalysisResult.overallVerdict === 'good' ? 'Vertrag unbedenklich' : leaseAnalysisResult.overallVerdict === 'warning' ? 'Erhöhte Aufmerksamkeit empfohlen' : 'Risiko / Klauseln prüfen lassen!'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>{leaseAnalysisResult.summary}</p>
                  </div>
                </div>

                {/* Audit Results Table/List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Prüfergebnisse im Detail:</h4>
                  {leaseAnalysisResult.checks?.map((check, idx) => {
                    let badgeColor = 'var(--text-muted)';
                    let badgeBg = 'rgba(255, 255, 255, 0.05)';
                    let statusLabel = 'Unbekannt';
                    let icon = 'ℹ️';

                    if (check.status === 'ok') {
                      badgeColor = '#10b981';
                      badgeBg = 'rgba(16, 185, 129, 0.08)';
                      statusLabel = 'Zulässig / Standard';
                      icon = '✅';
                    } else if (check.status === 'unfavorable') {
                      badgeColor = '#ecc94b';
                      badgeBg = 'rgba(233, 201, 75, 0.08)';
                      statusLabel = 'Mieterunfreundlich';
                      icon = '⚠️';
                    } else if (check.status === 'invalid') {
                      badgeColor = '#ef4444';
                      badgeBg = 'rgba(239, 68, 68, 0.08)';
                      statusLabel = 'Voraussichtlich Unwirksam';
                      icon = '❌';
                    }

                    return (
                      <div key={idx} style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{icon}</span>
                            <span>{check.category}</span>
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: badgeColor,
                            background: badgeBg,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: `1px solid ${badgeColor}33`
                          }}>
                            {statusLabel}
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {check.verdict}
                        </p>

                        {check.originalClause && (
                          <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderLeft: `3px solid ${badgeColor}`,
                            padding: '0.75rem 1rem',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontStyle: 'italic',
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                            marginTop: '0.25rem',
                            whiteSpace: 'pre-wrap'
                          }}>
                            "{check.originalClause.trim()}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rechtlicher Disclaimer */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem', padding: '0 1rem', fontStyle: 'italic' }}>
                  Hinweis: Diese Analyse basiert auf einer automatisierten KI-Prüfung und stellt keine offizielle Rechtsberatung dar. Im Zweifelsfall wende dich bitte an einen Anwalt für Mietrecht oder den Mieterschutzbund.
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Modal: Mieterselbstauskunft */}
      {showSelfDisclosureForm && (
        <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 7, 18, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Mieterselbstauskunft erstellen</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Fülle das Formular aus, um ein professionelles, unterschriftsbereites PDF-Formular zu generieren.</p>
              </div>
              <button className="modal-close" onClick={() => setShowSelfDisclosureForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleGenerateSelfDisclosure} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Angaben zum Mietobjekt */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--primary)' }}>Angaben zum Mietobjekt</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Straße, Hausnummer, Ort</label>
                    <input 
                      type="text" 
                      placeholder="z.B. Musterweg 12, 53111 Bonn" 
                      value={sdData.address} 
                      onChange={e => setSdData({...sdData, address: e.target.value})} 
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Wohnungsdetails (z.B. EG links)</label>
                    <input 
                      type="text" 
                      placeholder="z.B. 2. OG rechts" 
                      value={sdData.flatDetail} 
                      onChange={e => setSdData({...sdData, flatDetail: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Bewerberspalten */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Spalte 1 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--primary)' }}>Bewerber 1 (Hauptmieter)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Name, Vorname *</label>
                      <input type="text" required value={sdData.p1Name} onChange={e => setSdData({...sdData, p1Name: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Geburtsdatum *</label>
                      <input type="text" placeholder="TT.MM.JJJJ" required value={sdData.p1Birthdate} onChange={e => setSdData({...sdData, p1Birthdate: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Geburtsort</label>
                      <input type="text" value={sdData.p1Birthplace} onChange={e => setSdData({...sdData, p1Birthplace: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Aktuelle Anschrift *</label>
                      <input type="text" required value={sdData.p1Address} onChange={e => setSdData({...sdData, p1Address: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Telefonnummer *</label>
                      <input type="text" required value={sdData.p1Phone} onChange={e => setSdData({...sdData, p1Phone: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>E-Mail-Adresse *</label>
                      <input type="email" required value={sdData.p1Email} onChange={e => setSdData({...sdData, p1Email: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Beruf / Tätigkeit</label>
                      <input type="text" value={sdData.p1Job} onChange={e => setSdData({...sdData, p1Job: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Aktueller Arbeitgeber</label>
                      <input type="text" value={sdData.p1Employer} onChange={e => setSdData({...sdData, p1Employer: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nettoeinkommen (mtl. €)</label>
                      <input type="number" value={sdData.p1Income} onChange={e => setSdData({...sdData, p1Income: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Spalte 2 */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--primary)' }}>Bewerber 2 (Mitmieter / Partner)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Name, Vorname</label>
                      <input type="text" value={sdData.p2Name} onChange={e => setSdData({...sdData, p2Name: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Geburtsdatum</label>
                      <input type="text" placeholder="TT.MM.JJJJ" value={sdData.p2Birthdate} onChange={e => setSdData({...sdData, p2Birthdate: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Geburtsort</label>
                      <input type="text" value={sdData.p2Birthplace} onChange={e => setSdData({...sdData, p2Birthplace: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Aktuelle Anschrift</label>
                      <input type="text" value={sdData.p2Address} onChange={e => setSdData({...sdData, p2Address: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Telefonnummer</label>
                      <input type="text" value={sdData.p2Phone} onChange={e => setSdData({...sdData, p2Phone: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>E-Mail-Adresse</label>
                      <input type="email" value={sdData.p2Email} onChange={e => setSdData({...sdData, p2Email: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Beruf / Tätigkeit</label>
                      <input type="text" value={sdData.p2Job} onChange={e => setSdData({...sdData, p2Job: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Aktueller Arbeitgeber</label>
                      <input type="text" value={sdData.p2Employer} onChange={e => setSdData({...sdData, p2Employer: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nettoeinkommen (mtl. €)</label>
                      <input type="number" value={sdData.p2Income} onChange={e => setSdData({...sdData, p2Income: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Zusätzliche Abfragen */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--primary)' }}>Zusätzliche Erklärungen</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <input type="checkbox" id="rentArrears" checked={sdData.rentArrears} onChange={e => setSdData({...sdData, rentArrears: e.target.checked})} style={{ width: 'auto', margin: 0, cursor: 'pointer' }} />
                  <label htmlFor="rentArrears" style={{ margin: 0, cursor: 'pointer', fontSize: '0.8rem', userSelect: 'none' }}>Es bestehen Mietrückstände aus bisherigen Mietverhältnissen</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <input type="checkbox" id="bankruptcy" checked={sdData.bankruptcy} onChange={e => setSdData({...sdData, bankruptcy: e.target.checked})} style={{ width: 'auto', margin: 0, cursor: 'pointer' }} />
                  <label htmlFor="bankruptcy" style={{ margin: 0, cursor: 'pointer', fontSize: '0.8rem', userSelect: 'none' }}>In den letzten 5 Jahren wurde ein Insolvenzverfahren über mein/unser Vermögen eröffnet</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <input type="checkbox" id="foreclosure" checked={sdData.foreclosure} onChange={e => setSdData({...sdData, foreclosure: e.target.checked})} style={{ width: 'auto', margin: 0, cursor: 'pointer' }} />
                  <label htmlFor="foreclosure" style={{ margin: 0, cursor: 'pointer', fontSize: '0.8rem', userSelect: 'none' }}>Gegen mich/uns laufen Pfändungen oder Zwangsvollstreckungsmaßnahmen</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <input type="checkbox" id="socialAssistance" checked={sdData.socialAssistance} onChange={e => setSdData({...sdData, socialAssistance: e.target.checked})} style={{ width: 'auto', margin: 0, cursor: 'pointer' }} />
                  <label htmlFor="socialAssistance" style={{ margin: 0, cursor: 'pointer', fontSize: '0.8rem', userSelect: 'none' }}>Die Miete wird ganz oder teilweise durch öffentliche Mittel (z. B. Jobcenter) getragen</label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Haustiere halten?</label>
                    <select value={sdData.pets} onChange={e => setSdData({...sdData, pets: e.target.value})} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '6px' }}>
                      <option value="no">Nein</option>
                      <option value="yes">Ja</option>
                    </select>
                  </div>
                  {sdData.pets === 'yes' && (
                    <input 
                      type="text" 
                      placeholder="Welche Tiere? (z.B. Hund Rasse X, 1 Katze)" 
                      value={sdData.petDetails} 
                      onChange={e => setSdData({...sdData, petDetails: e.target.value})} 
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }} 
                    />
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowSelfDisclosureForm(false)} disabled={sdGenerating}>
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary" disabled={sdGenerating} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {sdGenerating ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Erstelle PDF...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Als Dokument speichern</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
