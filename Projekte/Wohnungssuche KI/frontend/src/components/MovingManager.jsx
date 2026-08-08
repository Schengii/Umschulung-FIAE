import React, { useState } from 'react';
import { Truck, FileText, CheckSquare, Download, Sparkles, Loader2 } from 'lucide-react';

export default function MovingManager({ backendUrl }) {
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'termination'

  // Checklist State
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Alte Mietwohnung fristgerecht kündigen (3 Monate BGB)', done: false },
    { id: '2', title: 'Strom- & Gasvertrag für neue Adresse ummelden / vergleichen', done: false },
    { id: '3', title: 'Nachsendeauftrag bei der Deutschen Post einrichten', done: false },
    { id: '4', title: 'Wohnsitz beim Bürgeramt / Einwohnermeldeamt ummelden', done: false },
    { id: '5', title: 'Mietkaution der alten Wohnung zurückfordern / Protokoll', done: false },
    { id: '6', title: 'Internet- & Festnetzanschluss an neue Adresse umziehen', done: false }
  ]);

  // Form State for Termination Letter
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantAddress: '',
    landlordName: '',
    landlordAddress: '',
    flatDetails: '',
    terminationDate: ''
  });

  const [loadingLetter, setLoadingLetter] = useState(false);
  const [letterResult, setLetterResult] = useState('');

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleGenerateTermination = async (e) => {
    e.preventDefault();
    setLoadingLetter(true);
    try {
      const res = await fetch(`${backendUrl}/api/moving/termination-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setLetterResult(data.letter);
      } else {
        const err = await res.json();
        alert(err.error || 'Fehler beim Generieren.');
      }
    } catch (err) {
      alert('Netzwerkfehler beim Generieren.');
    } finally {
      setLoadingLetter(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Truck className="w-6 h-6 text-sky-400" /> Kündigungs- & Umzugs-Assistent
        </h2>
        <p className="text-xs text-slate-400">Verwalte deine Umzugsaufgaben und erstelle rechtssichere Kündigungsschreiben.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'checklist' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Umzugs-Checkliste ({tasks.filter(t => t.done).length}/{tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('termination')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'termination' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Alte Wohnung kündigen (§ 573c BGB)
        </button>
      </div>

      {/* TAB 1: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 mb-3">Aufgabenliste vor & nach dem Umzug:</h3>
          {tasks.map(t => (
            <label key={t.id} className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleTask(t.id)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className={`text-xs ${t.done ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                {t.title}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* TAB 2: TERMINATION GENERATOR */}
      {activeTab === 'termination' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Rechtssicheres Kündigungsschreiben erstellen:</h3>
          
          <form onSubmit={handleGenerateTermination} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Dein Name</label>
              <input
                type="text"
                placeholder="Max Mustermann"
                value={formData.tenantName}
                onChange={e => setFormData({ ...formData, tenantName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Deine aktuelle Adresse</label>
              <input
                type="text"
                placeholder="Musterstraße 1, 50667 Köln"
                value={formData.tenantAddress}
                onChange={e => setFormData({ ...formData, tenantAddress: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Vermieter Name / Hausverwaltung</label>
              <input
                type="text"
                placeholder="Immobilienverwaltung GmbH"
                value={formData.landlordName}
                onChange={e => setFormData({ ...formData, landlordName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Vermieter Adresse</label>
              <input
                type="text"
                placeholder="Vermieterstr. 10, 50667 Köln"
                value={formData.landlordAddress}
                onChange={e => setFormData({ ...formData, landlordAddress: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Wohnungsdetails (Etage / Lage)</label>
              <input
                type="text"
                placeholder="2. OG rechts, Musterstraße 1"
                value={formData.flatDetails}
                onChange={e => setFormData({ ...formData, flatDetails: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Kündigungstermin</label>
              <input
                type="text"
                placeholder="zum 31.10.2026 / nächstmöglich"
                value={formData.terminationDate}
                onChange={e => setFormData({ ...formData, terminationDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loadingLetter}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 font-semibold text-white rounded-xl flex items-center justify-center gap-2 shadow"
              >
                {loadingLetter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Kündigungsschreiben mit KI generieren
              </button>
            </div>
          </form>

          {letterResult && (
            <div className="mt-4 p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
              <h4 className="text-xs font-bold text-sky-400 mb-2">Generiertes Kündigungsschreiben:</h4>
              <textarea
                value={letterResult}
                onChange={e => setLetterResult(e.target.value)}
                rows={12}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
