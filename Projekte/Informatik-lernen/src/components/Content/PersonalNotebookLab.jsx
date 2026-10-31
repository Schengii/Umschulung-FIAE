import React, { useState, useEffect } from 'react';

import { BookOpen, Plus, Trash2, Tag, Search, Download, Sparkles, Edit3, Eye, Database } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { saveItem, deleteItem } from '../../utils/indexedDbStorage';

const STORAGE_KEY = 'it_devgame_personal_notes';

const INITIAL_SAMPLE_NOTES = [
  {
    id: 'note_1',
    title: 'Wichtige IHK Prüfungs-Formeln (WISO & Netzwerke)',
    tags: ['IHK', 'Spickzettel', 'WISO'],
    content: `### 📌 IHK Spickzettel Zusammenfassung

#### 1. Handelskalkulation
- **Listeneinkaufspreis (LEP)** - Lieferantenrabatt = Zieleinkaufspreis (ZEP)
- **ZEP** - Lieferantenskonto = Bareinkaufspreis (BEP)
- **BEP** + Bezugskosten = Bezugspreis (Einstandspreis)

#### 2. Subnetting Formeln
- Nutzbare Hosts = \`2^(32 - Prefix) - 2\`
- Netzadresse = Bitweise AND-Verknüpfung von IP und Subnetzmaske

#### 3. Deckungsbeitrag (DB)
- \`db = Verkaufspreis (p) - variable Stückkosten (k_var)\`
- Break-Even-Point: \`Fixkosten / db\``,
    updatedAt: '2026-08-25 19:30'
  },
  {
    id: 'note_2',
    title: 'Git Merge-Konflikte & Branching Best Practices',
    tags: ['Git', 'DevOps'],
    content: `### 🌿 Git 3-Way Merge Cheat Sheet

\`\`\`bash
# 1. Feature Branch aktualisieren
git checkout main
git pull origin main
git checkout feature/api-v2
git merge main

# 2. Konflikte auflösen & committen
git add .
git commit -m "fix: resolve 3-way merge conflicts in auth routes"
git push origin feature/api-v2
\`\`\``,
    updatedAt: '2026-08-25 18:45'
  }
];

export default function PersonalNotebookLab() {
  const { awardXP } = useStore();
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SAMPLE_NOTES;
    } catch {
      return INITIAL_SAMPLE_NOTES;
    }
  });

  const [selectedNoteId, setSelectedNoteId] = useState(notes[0]?.id || 'note_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [noteCreatedXpClaimed, setNoteCreatedXpClaimed] = useState(false);
  const [noteExportedXpClaimed, setNoteExportedXpClaimed] = useState(false);

  // Auto-save to localStorage & IndexedDB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
    // Async IndexedDB Sync
    notes.forEach(note => {
      saveItem('notes', note).catch(() => {});
    });
  }, [notes]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  // All unique tags
  const allTags = ['ALL', ...new Set(notes.flatMap(n => n.tags || []))];

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || n.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAddNote = () => {
    const newNote = {
      id: `note_${Date.now()}`,
      title: 'Neues Notizblatt',
      tags: ['Allgemein'],
      content: '### 📝 Neuer Eintrag\n\nSchreibe hier deine persönlichen Lernnotizen...',
      updatedAt: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    saveItem('notes', newNote).catch(() => {});
    if (!noteCreatedXpClaimed) {
      setNoteCreatedXpClaimed(true);
      awardXP(10, 'note_created');
    }
  };

  const handleUpdateCurrentNote = (field, value) => {
    setNotes(notes.map(n => {
      if (n.id === selectedNoteId) {
        const updated = {
          ...n,
          [field]: value,
          updatedAt: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
        };
        saveItem('notes', updated).catch(() => {});
        return updated;
      }
      return n;
    }));
  };

  const handleDeleteNote = (id) => {
    if (notes.length <= 1) return;
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    setSelectedNoteId(remaining[0].id);
    deleteItem('notes', id).catch(() => {});
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([selectedNote.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (!noteExportedXpClaimed) {
      setNoteExportedXpClaimed(true);
      awardXP(15, 'note_exported');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><BookOpen size={14} /> Persönliches Notizbuch</span>
              <span className="badge badge-teal"><Sparkles size={14} /> Markdown &amp; Cheat-Sheet Vault</span>
              <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} /> IndexedDB Offline-Sync
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Developer Notizen- &amp; Wissens-Archiv
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Dein persönliches In-App Notizbuch mit Markdown-Unterstützung, Tag-Organisation, Volltextsuche und 1-Klick-Export für IHK-Spickzettel und Code-Snippets.
            </p>
          </div>

          <button onClick={handleAddNote} className="btn btn-primary" style={{ padding: '10px 18px', gap: '8px' }}>
            <Plus size={16} /> Neue Notiz erstellen
          </button>
        </div>
      </div>

      {/* 2-Pane: Notes Sidebar + Markdown Editor/Preview */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(440px, 2fr)', gap: '20px' }}>
        {/* Notes Sidebar */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          {/* Search & Tag Filter */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Notizen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>

            {/* Tags Bar */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`btn ${selectedTag === tag ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '12px' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2" style={{ maxHeight: '480px', overflowY: 'auto' }}>
            {filteredNotes.map(n => {
              const isSelected = selectedNoteId === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: isSelected ? 'var(--accent-teal)' : 'var(--text-main)', marginBottom: '4px' }}>
                    {n.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{n.tags?.join(', ') || 'Keine Tags'}</span>
                    <span>{n.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Markdown Editor & Live Preview */}
        {selectedNote && (
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleUpdateCurrentNote('title', e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.3rem',
                  fontWeight: '800',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px' }}
                >
                  {isPreviewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                  {isPreviewMode ? 'Editor' : 'Vorschau'}
                </button>

                <button
                  onClick={handleExportMarkdown}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', gap: '6px' }}
                >
                  <Download size={14} /> Export .md
                </button>

                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="btn btn-ghost"
                  style={{ padding: '6px', color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Tag Input */}
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Komma-getrennte Tags (z.B. IHK, SQL, Docker)..."
                value={selectedNote.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tagsArr = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                  handleUpdateCurrentNote('tags', tagsArr);
                }}
                style={{
                  flex: 1,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            {/* Editor or Preview Pane */}
            {isPreviewMode ? (
              <div
                style={{
                  minHeight: '340px',
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  fontSize: '0.92rem',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                {selectedNote.content}
              </div>
            ) : (
              <textarea
                value={selectedNote.content}
                onChange={(e) => handleUpdateCurrentNote('content', e.target.value)}
                placeholder="Schreibe Markdown hier..."
                style={{
                  width: '100%',
                  minHeight: '340px',
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
